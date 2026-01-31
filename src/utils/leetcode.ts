
import { supabase } from '../lib/supabase';

interface LeetCodeSubmission {
    title: string;
    titleSlug: string;
    timestamp: string;
    statusDisplay: string;
    lang: string;
}

export const fetchLeetCodeSubmissions = async (username: string): Promise<LeetCodeSubmission[]> => {
    try {
        // Fetch last 20 accepted submissions
        const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/acSubmission?limit=300`);
        if (!response.ok) {
            throw new Error('Failed to fetch LeetCode submissions');
        }

        const data = await response.json();
        return data.submission || [];
    } catch (error) {
        console.error('Error fetching LeetCode data:', error);
        return [];
    }
};

export const syncLeetCodeProblems = async (userId: string, username: string) => {
    if (!userId || !username) return false;

    // Fetch recent submissions (both accepted and others)
    // we use limit=50 to get a good chunk of recent history
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/submission?limit=50`);
    if (!response.ok) return false;

    const data = await response.json();
    const submissions: LeetCodeSubmission[] = data.submission || [];

    if (submissions.length === 0) return false;

    // Get existing problems to avoid duplicates
    const { data: existingProblems } = await supabase
        .from('coding_problems')
        .select('problem_name, problem_link, status')
        .eq('user_id', userId)
        .eq('section_name', 'LeetCode');

    const existingMap = new Map();
    existingProblems?.forEach(p => {
        existingMap.set(p.problem_link, p.status);
    });

    let newCount = 0;

    // Process from oldest to newest
    const reversedSubmissions = [...submissions].reverse();

    for (const sub of reversedSubmissions) {
        const link = `https://leetcode.com/problems/${sub.titleSlug}/`;
        const newStatus = sub.statusDisplay === 'Accepted' ? 'Solved' : 'Attempted';

        // Skip if already tracked with same or better status
        // i.e. if we have it 'Solved', ignore 'Attempted'
        // if we have it 'Solved', ignore 'Solved' (duplicate)
        // if we have it 'Attempted' and new is 'Solved', we UPDATE it

        const currentStatus = existingMap.get(link);

        if (currentStatus === 'Solved') {
            continue;
        }

        if (currentStatus === 'Attempted' && newStatus === 'Attempted') {
            continue;
        }

        // If 'Attempted' -> 'Solved', we update
        if (currentStatus === 'Attempted' && newStatus === 'Solved') {
            await supabase
                .from('coding_problems')
                .update({
                    status: 'Solved',
                    completed_at: new Date(parseInt(sub.timestamp) * 1000).toISOString()
                })
                .eq('user_id', userId)
                .eq('problem_link', link);
            newCount++;
            continue;
        }

        // Else insert new
        if (!currentStatus) {
            const { error } = await supabase.from('coding_problems').insert({
                user_id: userId,
                section_name: 'LeetCode',
                problem_name: sub.title,
                problem_link: link,
                difficulty: 'Medium', // API doesn't list difficulty in submission list easily, default to Medium
                status: newStatus,
                completed_at: newStatus === 'Solved' ? new Date(parseInt(sub.timestamp) * 1000).toISOString() : null,
            });

            if (!error) {
                newCount++;
                existingMap.set(link, newStatus); // Update local map so we don't re-insert in this loop
            } else {
                console.error('Error syncing problem:', sub.title, error);
            }
        }
    }

    return newCount > 0;
};

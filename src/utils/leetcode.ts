import api from '../lib/api';

interface LeetCodeSubmission {
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay: string;
  lang: string;
}

export const fetchLeetCodeSubmissions = async (username: string): Promise<LeetCodeSubmission[]> => {
  try {
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/acSubmission?limit=300`);
    if (!response.ok) throw new Error('Failed to fetch LeetCode submissions');
    const data = await response.json();
    return data.submission || [];
  } catch (error) {
    console.error('Error fetching LeetCode data:', error);
    return [];
  }
};

export const syncLeetCodeProblems = async (userId: string, username: string) => {
  if (!userId || !username) return false;

  const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/submission?limit=50`);
  if (!response.ok) return false;

  const data = await response.json();
  const submissions: LeetCodeSubmission[] = data.submission || [];
  if (submissions.length === 0) return false;

  // Send submissions to backend for processing
  const { data: result } = await api.post('/api/problems/sync', { submissions });
  return result.synced;
};

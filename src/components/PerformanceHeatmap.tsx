import { useState, useEffect } from 'react';
import { DailyScore } from '../types';
import { Info } from 'lucide-react';

interface HeatmapProps {
  dailyScores: DailyScore[];
}

interface DayData {
  date: string;
  score: number;
  goalsCompleted: number;
  totalGoals: number;
  level: number;
}

export function PerformanceHeatmap({ dailyScores }: HeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  const [heatmapData, setHeatmapData] = useState<DayData[]>([]);
  const [stats, setStats] = useState({ totalDays: 0, maxStreak: 0, currentStreak: 0 });

  useEffect(() => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const data: DayData[] = [];
    const scoreMap = new Map(dailyScores.map(s => [s.date, s]));

    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayScore = scoreMap.get(dateStr);

      let level = 0;
      if (dayScore && dayScore.score > 0) {
        if (dayScore.goals_completed === dayScore.total_goals && dayScore.total_goals > 0) {
          level = 4;
        } else if (dayScore.goals_completed > 0) {
          const ratio = dayScore.goals_completed / dayScore.total_goals;
          level = ratio > 0.7 ? 3 : ratio > 0.4 ? 2 : 1;
        }
      }

      data.push({
        date: dateStr,
        score: dayScore?.score || 0,
        goalsCompleted: dayScore?.goals_completed || 0,
        totalGoals: dayScore?.total_goals || 0,
        level,
      });
    }

    setHeatmapData(data);

    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    let totalActive = 0;

    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].level > 0) {
        tempStreak++;
        totalActive++;
        if (i === data.length - 1 || currentStreak > 0) {
          currentStreak = tempStreak;
        }
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    setStats({ totalDays: totalActive, maxStreak, currentStreak });
  }, [dailyScores]);

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-gray-800';
      case 1: return 'bg-green-900';
      case 2: return 'bg-green-700';
      case 3: return 'bg-green-500';
      case 4: return 'bg-green-400';
      default: return 'bg-gray-800';
    }
  };

  const weeks: DayData[][] = [];
  let currentWeek: DayData[] = [];

  heatmapData.forEach((day, index) => {
    const dayOfWeek = new Date(day.date).getDay();

    if (index === 0 && dayOfWeek !== 0) {
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push({
          date: '',
          score: 0,
          goalsCompleted: 0,
          totalGoals: 0,
          level: -1,
        });
      }
    }

    currentWeek.push(day);

    if (dayOfWeek === 6 || index === heatmapData.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white">
            {dailyScores.length} submissions in the past year
          </h2>
          <Info className="w-4 h-4 text-gray-500" />
        </div>
        <div className="flex items-center gap-6 text-sm">
          <span className="text-gray-400">Total active days: <span className="text-white font-semibold">{stats.totalDays}</span></span>
          <span className="text-gray-400">Max streak: <span className="text-white font-semibold">{stats.maxStreak}</span></span>
          <span className="text-gray-400">Current: <span className="text-green-400 font-semibold">{stats.currentStreak}</span></span>
        </div>
      </div>

      <div className="relative">
        <div className="flex flex-col overflow-x-auto pb-4 custom-scrollbar">
          <div className="flex gap-1 min-w-max">
            {/* Day Labels */}
            <div className="flex flex-col gap-1 w-8 pt-[2px]">
              <div className="h-3"></div>
              <div className="h-3 text-[10px] text-gray-500 font-medium flex items-center">Mon</div>
              <div className="h-3"></div>
              <div className="h-3 text-[10px] text-gray-500 font-medium flex items-center">Wed</div>
              <div className="h-3"></div>
              <div className="h-3 text-[10px] text-gray-500 font-medium flex items-center">Fri</div>
              <div className="h-3"></div>
            </div>

            {/* Heatmap Grid */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      onMouseEnter={() => day.date && setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-3 h-3 rounded-sm transition-all cursor-pointer hover:ring-2 hover:ring-cyan-400 ${day.level === -1 ? 'bg-transparent' : getLevelColor(day.level)
                        }`}
                      title={day.date || ''}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Month Labels */}
          <div className="flex gap-1 mt-2 min-w-max">
            <div className="w-8 shrink-0"></div>
            {weeks.map((week, index) => {
              const firstDay = week.find(d => d.date);
              let label = null;

              if (firstDay) {
                const date = new Date(firstDay.date);
                const month = date.getMonth();

                // Show label if it's the first week or if month changes from previous week
                if (index === 0) {
                  label = monthLabels[month];
                } else {
                  const prevWeek = weeks[index - 1];
                  const prevFirstDay = prevWeek.find(d => d.date);
                  if (prevFirstDay) {
                    const prevMonth = new Date(prevFirstDay.date).getMonth();
                    if (month !== prevMonth) {
                      label = monthLabels[month];
                    }
                  }
                }
              }

              return (
                <div key={index} className="w-3 text-xs text-gray-500 overflow-visible whitespace-nowrap">
                  {label}
                </div>
              );
            })}
          </div>
        </div>

        {hoveredDay && (
          <div className="absolute top-0 right-0 mt-8 mr-4 bg-gray-900/90 backdrop-blur border border-white/10 rounded-lg p-3 text-sm shadow-xl z-20 pointer-events-none">
            <div className="text-white font-medium mb-1">
              {new Date(hoveredDay.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <div className="text-gray-300">
                <span className="text-white font-semibold">{hoveredDay.goalsCompleted}/{hoveredDay.totalGoals}</span> goals completed
              </div>
              <div className="text-cyan-400 font-medium">
                {hoveredDay.score} points
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-900 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

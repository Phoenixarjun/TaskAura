// dailyProgress.ts - Daily progress tracking utilities

export interface DailyProgress {
  date: string;
  completed: number;
  total: number;
  percentage: number;
  message: string;
}

export function saveDailyProgress(date: string, completed: number, total: number): void {
  const progress: DailyProgress = {
    date,
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    message: generateProgressMessage(completed, total)
  };
  
  const allProgress = getAllDailyProgress();
  const existingIndex = allProgress.findIndex(p => p.date === date);
  
  if (existingIndex >= 0) {
    allProgress[existingIndex] = progress;
  } else {
    allProgress.push(progress);
  }
  
  // Sort by date (newest first)
  allProgress.sort((a, b) => b.date.localeCompare(a.date));
  
  localStorage.setItem('dailyProgress', JSON.stringify(allProgress));
}

export function getAllDailyProgress(): DailyProgress[] {
  const data = localStorage.getItem('dailyProgress');
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function getDailyProgress(date: string): DailyProgress | null {
  const allProgress = getAllDailyProgress();
  return allProgress.find(p => p.date === date) || null;
}

export function getLast7DaysProgress(): DailyProgress[] {
  const allProgress = getAllDailyProgress();
  const last7Days: DailyProgress[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);
    
    const progress = allProgress.find(p => p.date === dateStr);
    if (progress) {
      last7Days.push(progress);
    } else {
      // Add empty progress for missing days
      last7Days.push({
        date: dateStr,
        completed: 0,
        total: 0,
        percentage: 0,
        message: 'No tasks'
      });
    }
  }
  
  return last7Days;
}

export function getProgressChartData(): any {
  const last7Days = getLast7DaysProgress();
  
  return {
    labels: last7Days.map(p => formatChartDate(p.date)),
    datasets: [
      {
        label: 'Daily Progress (%)',
        data: last7Days.map(p => p.percentage),
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };
}

export function getProgressStats(): { average: number; best: number; streak: number } {
  const allProgress = getAllDailyProgress();
  const recentProgress = allProgress.slice(0, 30); // Last 30 days
  
  if (recentProgress.length === 0) {
    return { average: 0, best: 0, streak: 0 };
  }
  
  const average = Math.round(
    recentProgress.reduce((sum, p) => sum + p.percentage, 0) / recentProgress.length
  );
  
  const best = Math.max(...recentProgress.map(p => p.percentage));
  
  // Calculate current streak
  let streak = 0;
  const today = new Date().toISOString().slice(0, 10);
  
  for (let i = 0; i < allProgress.length; i++) {
    const progress = allProgress[i];
    if (progress.percentage > 0) {
      streak++;
    } else {
      break;
    }
  }
  
  return { average, best, streak };
}

function generateProgressMessage(completed: number, total: number): string {
  if (total === 0) return 'No tasks today';
  
  const percentage = (completed / total) * 100;
  
  if (percentage === 100) {
    return 'Perfect day! All tasks completed! 🎉';
  } else if (percentage >= 80) {
    return 'Excellent progress! Almost there! 💪';
  } else if (percentage >= 60) {
    return 'Good work! Keep going! 👍';
  } else if (percentage >= 40) {
    return 'Making progress! Stay focused! 🔥';
  } else if (percentage >= 20) {
    return 'Getting started! Every step counts! 🌱';
  } else {
    return 'New day, new opportunities! 💫';
  }
}

function formatChartDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
} 
// storage.ts

export function saveToStorage(key: string, value: any): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadFromStorage(key: string): any[] {
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function getTodayKey(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `dailyTasks-${yyyy}-${mm}-${dd}`;
}

// For learn streaks: expects learnHistory as array of { date: string, ... }
export function updateStreak(learnHistory: { date: string }[]): number {
  if (!learnHistory.length) return 0;
  // Sort by date descending
  const sorted = [...learnHistory].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  let current = new Date();
  for (let i = 0; i < sorted.length; i++) {
    const entryDate = new Date(sorted[i].date);
    if (
      entryDate.getFullYear() === current.getFullYear() &&
      entryDate.getMonth() === current.getMonth() &&
      entryDate.getDate() === current.getDate()
    ) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
} 
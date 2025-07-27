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

// Export localStorage data to JSON files
export function exportDataToJSON(): void {
  const data: {
    dailyTasks: { [key: string]: any[] };
    weeklyTasks: any[];
    learnHistory: any[];
  } = {
    dailyTasks: {},
    weeklyTasks: loadFromStorage('weeklyTasks'),
    learnHistory: loadFromStorage('learnHistory')
  };

  // Get all daily task keys from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('dailyTasks-')) {
      data.dailyTasks[key] = loadFromStorage(key);
    }
  }

  // Create download link for JSON file
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `taskaura-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Import data from JSON file to localStorage
export function importDataFromJSON(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Import weekly tasks
        if (data.weeklyTasks) {
          saveToStorage('weeklyTasks', data.weeklyTasks);
        }
        
        // Import learn history
        if (data.learnHistory) {
          saveToStorage('learnHistory', data.learnHistory);
        }
        
        // Import daily tasks
        if (data.dailyTasks) {
          Object.keys(data.dailyTasks).forEach(key => {
            saveToStorage(key, data.dailyTasks[key]);
          });
        }
        
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// Clear all data from localStorage
export function clearAllData(): void {
  // Clear all daily task keys
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith('dailyTasks-')) {
      localStorage.removeItem(key);
    }
  }
  
  // Clear other data
  localStorage.removeItem('weeklyTasks');
  localStorage.removeItem('learnHistory');
  localStorage.removeItem('weeklyStartDate');
}

// Get all data from localStorage for debugging
export function getAllData(): any {
  const data: {
    dailyTasks: { [key: string]: any[] };
    weeklyTasks: any[];
    learnHistory: any[];
    weeklyStartDate: string | null;
  } = {
    dailyTasks: {},
    weeklyTasks: loadFromStorage('weeklyTasks'),
    learnHistory: loadFromStorage('learnHistory'),
    weeklyStartDate: localStorage.getItem('weeklyStartDate')
  };

  // Get all daily task keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('dailyTasks-')) {
      data.dailyTasks[key] = loadFromStorage(key);
    }
  }

  return data;
} 
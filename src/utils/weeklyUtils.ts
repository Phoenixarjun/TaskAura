import { v4 as uuidv4 } from 'uuid';

export function getWeekStartDate(date = new Date()): string {
  // Sunday as start of week
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

export function getCurrentWeekRange(): [string, string] {
  const start = new Date(getWeekStartDate());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return [
    start.toLocaleDateString(undefined, options),
    end.toLocaleDateString(undefined, options),
  ];
}

export function isNewWeek(): boolean {
  const saved = localStorage.getItem('weeklyStartDate');
  const current = getWeekStartDate();
  return !saved || saved !== current;
}

export function resetWeeklyTasks(): void {
  localStorage.setItem('weeklyTasks', JSON.stringify([]));
  localStorage.setItem('weeklyStartDate', getWeekStartDate());
}

export function getWeeklyTasks(): any[] {
  const data = localStorage.getItem('weeklyTasks');
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveWeeklyTasks(tasks: any[]): void {
  localStorage.setItem('weeklyTasks', JSON.stringify(tasks));
}

export function addWeeklyTask(title: string, description: string): any {
  const newTask = {
    id: uuidv4(),
    title,
    description,
    isCompleted: false,
    createdAt: new Date().toISOString(),
  };
  const tasks = getWeeklyTasks();
  tasks.push(newTask);
  saveWeeklyTasks(tasks);
  return newTask;
}

export function updateWeeklyTask(id: string, updates: Partial<any>): void {
  const tasks = getWeeklyTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx !== -1) {
    tasks[idx] = { ...tasks[idx], ...updates };
    saveWeeklyTasks(tasks);
  }
}

export function deleteWeeklyTask(id: string): void {
  const tasks = getWeeklyTasks().filter((t) => t.id !== id);
  saveWeeklyTasks(tasks);
} 
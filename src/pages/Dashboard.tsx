import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ChartCard from '../components/ChartCard';
import StreakDisplay from '../components/StreakDisplay';
import MotivationalQuote from '../components/MotivationalQuote';
import DataManager from '../components/DataManager';
import { loadFromStorage, getTodayKey, updateStreak } from '../utils/storage';
import { getProgressChartData, getProgressStats, getLast7DaysProgress } from '../utils/dailyProgress';
import { getWeeklyTasks } from '../utils/weeklyUtils';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckCircleIcon, 
  FireIcon, 
  SunIcon, 
  ClockIcon, 
  ChartBarIcon,
  CalendarIcon,
  StarIcon,
  BoltIcon,
  HeartIcon,
  SparklesIcon,
  BookOpenIcon
} from '@heroicons/react/24/solid';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import styles from './Dashboard.module.css';
import { weeklyTasksAPI, learnTasksAPI, dailyTasksAPI, healthAPI } from '../services/apiService';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { 
      delay: i * 0.1, 
      type: 'spring' as const, 
      stiffness: 80 
    } 
  }),
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { colors, isDark } = useTheme();
  const { user, isLoading: authLoading } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  // Confetti disabled globally
  
  // State for real-time data
  const [weeklyTasks, setWeeklyTasks] = useState<any[]>([]);
  const [learnHistory, setLearnHistory] = useState<any[]>([]);
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  // Load data from localStorage (fast and reliable)
  const loadDataFromLocalStorage = () => {
    try {
      const todayKey = getTodayKey();
      const localDaily = loadFromStorage(todayKey);
      const localWeekly = loadFromStorage('weeklyTasks');
      const localLearn = loadFromStorage('learnHistory');
      
      setDailyTasks(Array.isArray(localDaily) ? localDaily : []);
      setWeeklyTasks(Array.isArray(localWeekly) ? localWeekly : []);
      setLearnHistory(Array.isArray(localLearn) ? localLearn : []);
      
      console.log('Loaded data from localStorage:', {
        daily: localDaily?.length || 0,
        weekly: localWeekly?.length || 0,
        learn: localLearn?.length || 0
      });
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  };

  // Check backend health
  const checkBackendHealth = async () => {
    try {
      await healthAPI.check();
      setBackendStatus('connected');
      return true;
    } catch (error) {
      console.warn('Backend health check failed:', error);
      setBackendStatus('disconnected');
      return false;
    }
  };

  // Fetch data from backend APIs (background sync)
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!user) {
        console.log('User not authenticated, using demo endpoints');
        setBackendStatus('connected');
        
        // Try to fetch demo data from backend
        try {
          const [weeklyResponse, learnResponse, dailyResponse] = await Promise.allSettled([
            weeklyTasksAPI.getAll(),
            learnTasksAPI.getAll(),
            dailyTasksAPI.getAll()
          ]);

          // Handle demo responses
          if (weeklyResponse.status === 'fulfilled') {
            const weeklyData = weeklyResponse.value as any;
            const tasks = weeklyData && weeklyData.tasks && Array.isArray(weeklyData.tasks) ? weeklyData.tasks : [];
            setWeeklyTasks(tasks);
            localStorage.setItem('weeklyTasks', JSON.stringify(tasks));
          }

          if (learnResponse.status === 'fulfilled') {
            const learnData = learnResponse.value as any;
            const tasks = learnData && learnData.tasks && Array.isArray(learnData.tasks) ? learnData.tasks : [];
            setLearnHistory(tasks);
            localStorage.setItem('learnHistory', JSON.stringify(tasks));
          }

          if (dailyResponse.status === 'fulfilled') {
            const dailyData = dailyResponse.value as any;
            const tasks = dailyData && dailyData.tasks && Array.isArray(dailyData.tasks) ? dailyData.tasks : [];
            setDailyTasks(tasks);
            const todayKey = getTodayKey();
            localStorage.setItem(todayKey, JSON.stringify(tasks));
          }

          toast('✅ Demo mode: Connected to backend', {
            duration: 3000,
            position: 'bottom-center',
            style: {
              background: '#10b981',
              color: '#fff',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600'
            }
          });
        } catch (error) {
          console.warn('Demo endpoints failed, using localStorage only');
          loadDataFromLocalStorage();
          setBackendStatus('disconnected');
          
          toast('Running in offline mode with local data', {
            duration: 4000,
            position: 'bottom-center',
            style: {
              background: '#f59e0b',
              color: '#fff',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600'
            }
          });
        }
        return;
      }

      // Check backend health first
      const isBackendHealthy = await checkBackendHealth();
      
      if (!isBackendHealthy) {
        console.warn('Backend is down, using localStorage only');
        loadDataFromLocalStorage();
        return;
      }

      const [weeklyResponse, learnResponse, dailyResponse] = await Promise.allSettled([
        weeklyTasksAPI.getAll(),
        learnTasksAPI.getAll(),
        dailyTasksAPI.getAll()
      ]);

      // Handle weekly tasks
      if (weeklyResponse.status === 'fulfilled') {
        const weeklyData = weeklyResponse.value as any;
        const tasksRaw = Array.isArray(weeklyData?.tasks) ? weeklyData.tasks : (Array.isArray(weeklyData) ? weeklyData : []);
        const normalized = tasksRaw.map((t: any) => ({
          ...t,
          isCompleted: t?.isCompleted ?? t?.completed ?? false,
        }));
        setWeeklyTasks(normalized);
        localStorage.setItem('weeklyTasks', JSON.stringify(normalized));
      } else {
        console.warn('Weekly tasks API failed, using localStorage fallback');
        const localWeekly = loadFromStorage('weeklyTasks');
        setWeeklyTasks(Array.isArray(localWeekly) ? localWeekly.map((t: any)=> ({...t, isCompleted: t?.isCompleted ?? t?.completed ?? false})) : []);
      }

      // Handle learn history
      if (learnResponse.status === 'fulfilled') {
        const learnData = learnResponse.value as any;
        const tasks = Array.isArray(learnData) ? learnData : (Array.isArray(learnData?.tasks) ? learnData.tasks : []);
        setLearnHistory(tasks);
        localStorage.setItem('learnHistory', JSON.stringify(tasks));
      } else {
        console.warn('Learn history API failed, using localStorage fallback');
        const localLearn = loadFromStorage('learnHistory');
        setLearnHistory(Array.isArray(localLearn) ? localLearn : []);
      }

      // Handle daily tasks
      if (dailyResponse.status === 'fulfilled') {
        const dailyData = dailyResponse.value as any;
        const tasksRaw = Array.isArray(dailyData?.tasks) ? dailyData.tasks : (Array.isArray(dailyData) ? dailyData : []);
        const today = new Date().toISOString().split('T')[0];
        const todaysTasks = tasksRaw.filter((task: any) => {
          const taskDateSrc = task.date || task.createdAt || task.updatedAt;
          if (!taskDateSrc) return false;
          const taskDate = new Date(taskDateSrc).toISOString().split('T')[0];
          return taskDate === today;
        });
        setDailyTasks(todaysTasks);
        const todayKeyLocal = getTodayKey();
        localStorage.setItem(todayKeyLocal, JSON.stringify(todaysTasks));
      } else {
        console.warn('Daily tasks API failed, using localStorage fallback');
        const todayKey = getTodayKey();
        const localDaily = loadFromStorage(todayKey);
        console.log('Today tasks from localStorage:', localDaily);
        setDailyTasks(Array.isArray(localDaily) ? localDaily : []);
      }

      toast.success('✅ Dashboard data refreshed successfully!', {
        duration: 3000,
        position: 'bottom-center',
        style: {
          background: '#10b981',
          color: '#fff',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: '600'
        }
      });
    } catch (error) {
      console.error('Error syncing dashboard data:', error);
      toast.error('Failed to sync data. Using local data.', {
        duration: 3000,
        position: 'bottom-center',
        style: {
          background: '#ef4444',
          color: '#fff',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: '600'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Update time and greeting
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      const hour = now.getHours();
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 17) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch data on mount and set up event listeners
  useEffect(() => {
    // Load data from localStorage first (fast and reliable)
    loadDataFromLocalStorage();
    
    // Then try to sync with backend in background (only if authenticated)
    if (!authLoading) {
      fetchDashboardData();
    }
    
    // Listen for storage changes to update dashboard in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (e.key.includes('dailyTasks') || e.key === 'weeklyTasks' || e.key === 'learnHistory')) {
        console.log('Storage changed, refreshing dashboard:', e.key);
        loadDataFromLocalStorage();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from other components
    const handleTaskUpdate = () => {
      console.log('Task update event received, refreshing dashboard');
      loadDataFromLocalStorage();
      if (user) {
        fetchDashboardData();
      }
    };
    
    window.addEventListener('taskUpdated', handleTaskUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('taskUpdated', handleTaskUpdate);
    };
  }, [authLoading, user]);

  // Calculate progress
  const dailyDone = dailyTasks.filter((t: any) => t.isCompleted || t.completed).length;
  const dailyTotal = dailyTasks.length;
  const dailyPercent = dailyTotal ? Math.round((dailyDone / dailyTotal) * 100) : 0;

  // Debug logging for progress calculation
  console.log('Dashboard Progress Debug:', {
    dailyTasks,
    dailyDone,
    dailyTotal,
    dailyPercent,
    completedTasks: dailyTasks.filter((t: any) => t.isCompleted || t.completed)
  });

  const weeklyDone = weeklyTasks.filter((t: any) => t.isCompleted || t.completed).length;
  const weeklyTotal = weeklyTasks.length;
  const weeklyPercent = weeklyTotal ? Math.round((weeklyDone / weeklyTotal) * 100) : 0;

  const streak = updateStreak(learnHistory);
  const learningRate = learnHistory.length;
  const latestLearnings = [...learnHistory].sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt || new Date());
    const dateB = new Date(b.date || b.createdAt || new Date());
    return dateB.getTime() - dateA.getTime();
  }).slice(0, 2);

  // Progress tracking data
  const progressChartData = useMemo(() => getProgressChartData(), [dailyTasks]);
  const progressStats = useMemo(() => getProgressStats(), [dailyTasks]);

  // Weekly Task Progress Chart Data
  const weeklyProgressData = useMemo(() => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData = new Array(7).fill(0);
    weeklyTasks.forEach(task => {
      if (task.isCompleted && task.completedAt) {
        const completedDate = new Date(task.completedAt);
        const day = completedDate.getDay();
        weekData[day]++;
      }
    });
    return {
      labels: daysOfWeek,
      datasets: [{
        label: 'Weekly Tasks Completed',
        data: weekData,
        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.6)' : 'rgba(99, 102, 241, 0.8)',
        borderColor: isDark ? 'rgba(99, 102, 241, 0.9)' : 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }]
    };
  }, [isDark, weeklyTasks]);

  // Daily Task Completion Chart Data
  const dailyCompletionData = useMemo(() => {
    const last7Days = getLast7DaysProgress();
    return {
      labels: last7Days.map(p => new Date(p.date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [{
        label: 'Daily Tasks Completed',
        data: last7Days.map(p => p.completed),
        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.6)' : 'rgba(16, 185, 129, 0.8)',
        borderColor: isDark ? 'rgba(16, 185, 129, 0.9)' : 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointBackgroundColor: isDark ? 'rgba(16, 185, 129, 0.9)' : 'rgba(16, 185, 129, 1)',
        pointBorderColor: isDark ? '#0f172a' : '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    };
  }, [isDark]);

  // Learning Rate Chart Data
  const learningRateData = useMemo(() => {
    const last7Days = getLast7DaysProgress();
    let cumulativeRate = 0;
    const rateData = last7Days.map(p => {
      cumulativeRate += p.completed;
      return cumulativeRate;
    });
    return {
      labels: last7Days.map(p => new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        label: 'Total Learnings',
        data: rateData,
        backgroundColor: isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.1)',
        borderColor: isDark ? 'rgba(168, 85, 247, 0.9)' : 'rgba(168, 85, 247, 1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: isDark ? 'rgba(168, 85, 247, 0.9)' : 'rgba(168, 85, 247, 1)',
        pointBorderColor: isDark ? '#0f172a' : '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    };
  }, [isDark]);

  // Learning Streak Chart Data
  const learningStreakData = useMemo(() => ({
    labels: ['Current', 'Goal'],
    datasets: [{
      data: [streak, 30],
      backgroundColor: [
        isDark ? 'rgba(239, 68, 68, 0.7)' : 'rgba(239, 68, 68, 0.8)',
        isDark ? 'rgba(156, 163, 175, 0.2)' : 'rgba(156, 163, 175, 0.3)'
      ],
      borderWidth: 0,
      cutout: '70%',
    }]
  }), [streak, isDark]);

  // Chart data
  const weeklyChartData = useMemo(() => ({
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [weeklyDone, weeklyTotal - weeklyDone],
        backgroundColor: [
          isDark ? 'rgba(99, 102, 241, 0.8)' : '#6366f1',
          isDark ? 'rgba(156, 163, 175, 0.3)' : '#d1d5db'
        ],
        borderWidth: 0,
      },
    ],
  }), [weeklyDone, weeklyTotal, isDark]);

  // Achievement system
  const achievements = useMemo(() => {
    const achievements = [];
    if (streak >= 7) achievements.push({ id: 'week', title: 'Week Warrior', icon: '🔥', desc: '7-day learning streak' });
    if (weeklyPercent >= 80) achievements.push({ id: 'productive', title: 'Productivity Master', icon: '⚡', desc: '80% weekly completion' });
    if (dailyDone >= 5) achievements.push({ id: 'daily', title: 'Daily Champion', icon: '⭐', desc: '5+ daily tasks completed' });
    if (learnHistory.length >= 10) achievements.push({ id: 'learner', title: 'Knowledge Seeker', icon: '📚', desc: '10+ learning entries' });
    if (progressStats.average >= 70) achievements.push({ id: 'consistent', title: 'Consistent Performer', icon: '📈', desc: '70%+ average daily progress' });
    if (progressStats.streak >= 5) achievements.push({ id: 'streaker', title: 'Streak Master', icon: '🔥', desc: '5+ day progress streak' });
    return achievements;
  }, [streak, weeklyPercent, dailyDone, learnHistory.length, progressStats.average, progressStats.streak]);

  // Confetti disabled

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <>
              {/* Control Bar: Backend Status + Refresh Button */}
        <div className={styles.dashboardControls}>
          <div className={styles.backendStatus}>
            <span className={`${styles.statusDot} ${styles[`status-${backendStatus}`]}`}></span>
            <span className={styles.statusText}>
              {backendStatus === 'connected' && user && '🟢 Backend Connected'}
              {backendStatus === 'connected' && !user && '🟢 Demo Mode'}
              {backendStatus === 'disconnected' && '🔴 Backend Disconnected'}
              {backendStatus === 'checking' && '🟡 Checking Connection...'}
            </span>
          </div>
          <div className={styles.controlButtons}>
            <button
              onClick={() => {
                loadDataFromLocalStorage();
                if (user) {
                  fetchDashboardData(); // Also sync with backend
                } else {
                  toast('Please log in to sync with backend', {
                    duration: 3000,
                    position: 'bottom-center',
                    style: {
                      background: '#3b82f6',
                      color: '#fff',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }
                  });
                }
              }}
              disabled={loading}
              className={styles.refreshButton}
            >
              {loading ? <span className={styles.refreshSpinner}></span> : '🔄'} Refresh Data
            </button>
            {!user && (
              <button
                onClick={() => navigate('/auth')}
                className={styles.loginButton}
              >
                🔐 Login to Sync
              </button>
            )}
          </div>
        </div>
      {/* Main Dashboard Container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className={styles.dashboardContainer}
      >
        {/* Confetti removed */}

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 60 }}
          className={styles.heroSection}
        >
          <div className={styles.heroContent}>
            <div className={styles.greetingSection}>
              <h1 
                className={styles.greeting}
                style={{ 
                  color: isDark ? '#ffffff' : '#1e293b',
                  textShadow: isDark ? '0 0 20px rgba(255, 255, 255, 0.3)' : 'none'
                }}
              >
                {greeting}!
              </h1>
              <div 
                className={styles.timeDisplay}
                style={{ 
                  color: isDark ? '#ffffff' : '#475569',
                  textShadow: isDark ? '0 0 10px rgba(255, 255, 255, 0.2)' : 'none'
                }}
              >
                <ClockIcon className={styles.timeIcon} />
                <span className={styles.time}>{formatTime(currentTime)}</span>
              </div>
              <div 
                className={styles.dateDisplay}
                style={{ 
                  color: isDark ? '#ffffff' : '#475569',
                  textShadow: isDark ? '0 0 10px rgba(255, 255, 255, 0.2)' : 'none'
                }}
              >
                <CalendarIcon className={styles.dateIcon} />
                <span className={styles.date}>{formatDate(currentTime)}</span>
              </div>
            </div>
            <div className={styles.quoteSection}>
              <MotivationalQuote />
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={styles.quickStats}
        >
          <motion.div 
            className={styles.statCard}
            whileHover={{ scale: 1.05, y: -5 }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className={styles.statIcon}>
              <CheckCircleIcon />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{dailyDone}/{dailyTotal}</div>
              <div className={styles.statLabel}>Today's Tasks</div>
            </div>
            <div className={styles.statProgress}>
              <div 
                className={styles.progressBar} 
                style={{ width: `${dailyPercent}%` }}
              />
            </div>
          </motion.div>

          <motion.div 
            className={styles.statCard}
            whileHover={{ scale: 1.05, y: -5 }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className={styles.statIcon}>
              <ChartBarIcon />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{weeklyPercent}%</div>
              <div className={styles.statLabel}>Weekly Progress</div>
            </div>
            <div className={styles.statProgress}>
              <div 
                className={styles.progressBar} 
                style={{ width: `${weeklyPercent}%` }}
              />
            </div>
          </motion.div>

          <motion.div 
            className={styles.statCard}
            whileHover={{ scale: 1.05, y: -5 }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className={styles.statIcon}>
              <FireIcon />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{streak}</div>
              <div className={styles.statLabel}>Learning Streak</div>
            </div>
            <div className={styles.statProgress}>
              <div 
                className={styles.progressBar} 
                style={{ width: `${Math.min(streak * 10, 100)}%` }}
              />
            </div>
          </motion.div>

          <motion.div 
            className={styles.statCard}
            whileHover={{ scale: 1.05, y: -5 }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className={styles.statIcon}>
              <ChartBarIcon />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{learningRate}</div>
              <div className={styles.statLabel}>Learning Rate</div>
            </div>
            <div className={styles.statProgress}>
              <div 
                className={styles.progressBar} 
                style={{ width: `${Math.min(learningRate * 2, 100)}%` }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Visual Analytics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={styles.analyticsGrid}
        >
          {/* Weekly Task Progress Chart */}
          <motion.div
            custom={0}
            variants={cardVariants}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.18)' }}
            whileTap={{ scale: 0.98 }}
            className={styles.analyticsCard}
          >
            <div className={styles.cardHeader}>
              <ChartBarIcon className={styles.cardIcon} />
              <span className={styles.cardTitle}>Weekly Task Progress</span>
            </div>
            <div className={styles.chartContainer}>
              <div className={styles.chartWrapper}>
                <Bar 
                  data={weeklyProgressData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(0, 0, 0, 0.8)',
                        titleColor: isDark ? '#e2e8f0' : '#fff',
                        bodyColor: isDark ? '#e2e8f0' : '#fff',
                        borderColor: isDark ? 'rgba(99, 102, 241, 0.5)' : '#6366f1',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                          color: isDark ? '#94a3b8' : '#64748b',
                          font: {
                            size: 12
                          }
                        },
                        grid: {
                          color: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)'
                        }
                      },
                      x: {
                        ticks: {
                          color: isDark ? '#94a3b8' : '#64748b',
                          font: {
                            size: 12
                          }
                        },
                        grid: {
                          color: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)'
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </motion.div>

          {/* Daily Task Completion Chart */}
          <motion.div
            custom={1}
            variants={cardVariants}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 32px 0 rgba(16,185,129,0.18)' }}
            whileTap={{ scale: 0.98 }}
            className={styles.analyticsCard}
          >
            <div className={styles.cardHeader}>
              <SunIcon className={styles.cardIcon} />
              <span className={styles.cardTitle}>Daily Task Completion</span>
            </div>
            <div className={styles.chartContainer}>
              <div className={styles.chartWrapper}>
                <Line 
                  data={dailyCompletionData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(0, 0, 0, 0.8)',
                        titleColor: isDark ? '#e2e8f0' : '#fff',
                        bodyColor: isDark ? '#e2e8f0' : '#fff',
                        borderColor: isDark ? 'rgba(16, 185, 129, 0.5)' : '#10b981',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                          color: isDark ? '#94a3b8' : '#64748b',
                          font: {
                            size: 12
                          }
                        },
                        grid: {
                          color: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)'
                        }
                      },
                      x: {
                        ticks: {
                          color: isDark ? '#94a3b8' : '#64748b',
                          font: {
                            size: 12
                          }
                        },
                        grid: {
                          color: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)'
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </motion.div>

          {/* Learning Rate Chart */}
          <motion.div
            custom={2}
            variants={cardVariants}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 32px 0 rgba(168,85,247,0.18)' }}
            whileTap={{ scale: 0.98 }}
            className={styles.analyticsCard}
          >
            <div className={styles.cardHeader}>
              <ChartBarIcon className={styles.cardIcon} />
              <span className={styles.cardTitle}>Learning Rate Growth</span>
            </div>
            <div className={styles.chartContainer}>
              <div className={styles.chartWrapper}>
                <Line 
                  data={learningRateData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(0, 0, 0, 0.8)',
                        titleColor: isDark ? '#e2e8f0' : '#fff',
                        bodyColor: isDark ? '#e2e8f0' : '#fff',
                        borderColor: isDark ? 'rgba(168, 85, 247, 0.5)' : '#a855f7',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                          color: isDark ? '#94a3b8' : '#64748b',
                          font: {
                            size: 12
                          }
                        },
                        grid: {
                          color: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)'
                        }
                      },
                      x: {
                        ticks: {
                          color: isDark ? '#94a3b8' : '#64748b',
                          font: {
                            size: 12
                          }
                        },
                        grid: {
                          color: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)'
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </motion.div>

          {/* Learning Streak Chart */}
          <motion.div
            custom={3}
            variants={cardVariants}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 32px 0 rgba(239,68,68,0.18)' }}
            whileTap={{ scale: 0.98 }}
            className={styles.analyticsCard}
          >
            <div className={styles.cardHeader}>
              <FireIcon className={styles.cardIcon} />
              <span className={styles.cardTitle}>Learning Streak</span>
            </div>
            <div className={styles.chartContainer}>
              <div className={styles.chartWrapper}>
                <Doughnut 
                  data={learningStreakData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(0, 0, 0, 0.8)',
                        titleColor: isDark ? '#e2e8f0' : '#fff',
                        bodyColor: isDark ? '#e2e8f0' : '#fff',
                        borderColor: isDark ? 'rgba(239, 68, 68, 0.5)' : '#ef4444',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false
                      }
                    }
                  }} 
                />
              </div>
            </div>
            <div className={styles.streakStats}>
              <div className={styles.streakStat}>
                <span className={styles.streakValue}>{streak}</span>
                <span className={styles.streakLabel}>Current</span>
              </div>
              <div className={styles.streakStat}>
                <span className={styles.streakValue}>30</span>
                <span className={styles.streakLabel}>Goal</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Latest Learnings Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={styles.latestLearnings}
        >
          <div className={styles.learningsHeader}>
            <h2 
              className={styles.learningsTitle}
              style={{ 
                color: isDark ? '#ffffff' : '#1e293b',
                textShadow: isDark ? '0 0 10px rgba(255, 255, 255, 0.3)' : 'none'
              }}
            >
              <BookOpenIcon className={styles.learningsIcon} />
              Latest Learnings
            </h2>
            <button 
              className={styles.viewMoreBtn}
              onClick={() => navigate('/learn')}
            >
              View More
            </button>
          </div>
          <div className={styles.learningsGrid}>
            {latestLearnings.map((learning: any, index: number) => (
              <motion.div
                key={learning.id || `learning-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={styles.learningCard}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className={styles.learningCardHeader}>
                  <span className={`${styles.learningCategory} ${styles[(learning.category || 'Tech').toLowerCase()]}`}>
                    {learning.category || 'Tech'}
                  </span>
                  <span className={styles.learningDate}>
                    {new Date(learning.date || new Date()).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <h3 className={styles.learningTitle}>{learning.title || 'Untitled'}</h3>
                {learning.description && (
                  <p className={styles.learningDescription}>{learning.description}</p>
                )}
              </motion.div>
            ))}
            {latestLearnings.length === 0 && (
              <div className={styles.emptyLearnings}>
                <span className={styles.emptyIcon}>📚</span>
                <p className={styles.emptyText}>No learnings yet. Start your journey!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Main Grid */}
        <motion.div
          className={styles.mainGrid}
          initial="hidden"
          animate="visible"
        >
          {/* Weekly Goals Card */}
          <motion.div
            custom={0}
            variants={cardVariants}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.18)' }}
            whileTap={{ scale: 0.98 }}
            className={styles.mainCard}
          >
            <div className={styles.cardHeader}>
              <CheckCircleIcon className={styles.cardIcon} />
              <span className={styles.cardTitle}>
                Weekly Goals
              </span>
            </div>
            {weeklyTotal > 0 ? (
              <>
                <div className={styles.chartWrapper}>
                  <ChartCard title="" data={weeklyChartData} type="doughnut" />
                </div>
                <div className={styles.cardStats}>
                  <div className={styles.cardStat}>
                    <span className={styles.statValue}>{weeklyDone}</span>
                    <span className={styles.statDesc}>completed</span>
                  </div>
                  <div className={styles.cardStat}>
                    <span className={styles.statValue}>{weeklyTotal - weeklyDone}</span>
                    <span className={styles.statDesc}>remaining</span>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.noActivityMessage}>
                <div className={styles.noActivityIcon}>📋</div>
                <h3 className={styles.noActivityTitle}>No Activity Detected</h3>
                <p className={styles.noActivityText}>
                  Start setting weekly goals to track your progress and stay motivated!
                </p>
              </div>
            )}
            <button 
              className={styles.cardButton} 
              onClick={() => navigate('/weekly')}
            >
              Manage Goals
            </button>
          </motion.div>

          {/* Daily Focus Card */}
          <motion.div
            custom={1}
            variants={cardVariants}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 32px 0 rgba(16,185,129,0.18)' }}
            whileTap={{ scale: 0.98 }}
            className={styles.mainCard}
          >
            <div className={styles.cardHeader}>
              <SunIcon className={styles.cardIcon} />
              <span className={styles.cardTitle}>
                Daily Focus
              </span>
            </div>
            <div className={styles.dailyProgress}>
              <div className={styles.progressRing}>
                <svg className={styles.progressSvg} viewBox="0 0 120 120">
                  <circle
                    className={styles.progressBg}
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    strokeWidth="8"
                  />
                  <circle
                    className={styles.progressFill}
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    strokeWidth="8"
                    strokeDasharray={`${dailyPercent * 3.14} 314`}
                    strokeDashoffset="0"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className={styles.progressText}>
                  <span className={styles.progressPercent}>{dailyPercent}%</span>
                  <span className={styles.progressLabel}>Complete</span>
                </div>
              </div>
            </div>
            <div className={styles.taskList}>
              <h4 className={styles.taskListTitle}>Top Tasks:</h4>
              <ul className={styles.taskItems}>
                {dailyTasks.slice(0, 3).map((t: any, i: number) => (
                  <li key={i} className={`${styles.taskItem} ${t.done ? styles.taskDone : ''}`}>
                    <span className={styles.taskDot} />
                    <span className={styles.taskText}>{t.title}</span>
                  </li>
                ))}
                {dailyTasks.length === 0 && (
                  <li className={styles.taskItem}>
                    <span className={styles.taskText}>No tasks yet</span>
                  </li>
                )}
              </ul>
            </div>
            <button 
              className={styles.cardButton} 
              onClick={() => navigate('/daily')}
            >
              Go to Daily
            </button>
          </motion.div>

          {/* Learning Streak Card */}
          <motion.div
            custom={2}
            variants={cardVariants}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 32px 0 rgba(168,85,247,0.18)' }}
            whileTap={{ scale: 0.98 }}
            className={styles.mainCard}
          >
            <div className={styles.cardHeader}>
              <FireIcon className={styles.cardIcon} />
              <span className={styles.cardTitle}>
                Learning Streak
              </span>
            </div>
            <div className={styles.streakDisplay}>
              <StreakDisplay streak={streak} />
            </div>
            <div className={styles.recentLearnings}>
              <h4 className={styles.learningTitle}>Recent Learnings:</h4>
              <div className={styles.learningItems}>
                {latestLearnings.map((l: any, i: number) => (
                  <div key={i} className={styles.learningItem}>
                    <span className={styles.learningCategory}>{l.category || 'Tech'}</span>
                    <span className={styles.learningTitle}>{l.title || 'Untitled'}</span>
                  </div>
                ))}
                {latestLearnings.length === 0 && (
                  <div className={styles.learningItem}>
                    <span className={styles.learningTitle}>No learnings yet</span>
                  </div>
                )}
              </div>
            </div>
            <button 
              className={styles.cardButton} 
              onClick={() => navigate('/learn')}
            >
              View Learnings
            </button>
          </motion.div>
        </motion.div>

        {/* Progress Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={styles.progressTrends}
        >
          <h2 className={styles.trendsTitle}>
            <ChartBarIcon className={styles.trendsIcon} />
            7-Day Progress Trends
          </h2>
          <div className={styles.trendsChart}>
            <Line 
              data={progressChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { 
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(0, 0, 0, 0.8)',
                    titleColor: isDark ? '#e2e8f0' : '#fff',
                    bodyColor: isDark ? '#e2e8f0' : '#fff',
                    borderColor: isDark ? 'rgba(99, 102, 241, 0.5)' : '#6366f1',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: function(value) {
                        return value + '%';
                      },
                      color: isDark ? '#94a3b8' : '#64748b',
                      font: {
                        size: 12
                      }
                    },
                    grid: {
                      color: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)'
                    }
                  },
                  x: {
                    ticks: {
                      color: isDark ? '#94a3b8' : '#64748b',
                      font: {
                        size: 12
                      }
                    },
                    grid: {
                      color: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)'
                    }
                  }
                }
              }} 
            />
          </div>
          <div className={styles.trendsStats}>
            <div className={styles.trendStat}>
              <span className={styles.trendValue}>{progressStats.average}%</span>
              <span className={styles.trendLabel}>7-Day Average</span>
            </div>
            <div className={styles.trendStat}>
              <span className={styles.trendValue}>{progressStats.best}%</span>
              <span className={styles.trendLabel}>Best Day</span>
            </div>
            <div className={styles.trendStat}>
              <span className={styles.trendValue}>{progressStats.streak}</span>
              <span className={styles.trendLabel}>Day Streak</span>
            </div>
          </div>
        </motion.div>

        {/* Achievements Section */}
        {achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={styles.achievementsSection}
          >
            <h2 
              className={styles.achievementsTitle}
              style={{ 
                color: isDark ? '#ffffff' : '#1e293b',
                textShadow: isDark ? '0 0 10px rgba(255, 255, 255, 0.3)' : 'none'
              }}
            >
              <StarIcon className={styles.achievementsIcon} />
              Your Achievements
            </h2>
            <div className={styles.achievementsGrid}>
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={styles.achievementCard}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                >
                  <div className={styles.achievementIcon}>{achievement.icon}</div>
                  <div className={styles.achievementContent}>
                    <h3 className={styles.achievementTitle}>{achievement.title}</h3>
                    <p className={styles.achievementDesc}>{achievement.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={styles.quickActions}
        >
          <h2 
            className={styles.actionsTitle}
            style={{ 
              color: isDark ? '#ffffff' : '#1e293b',
              textShadow: isDark ? '0 0 10px rgba(255, 255, 255, 0.3)' : 'none'
            }}
          >
            Quick Actions
          </h2>
          <div className={styles.actionsGrid}>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={styles.actionButton}
              onClick={() => navigate('/daily')}
            >
              <BoltIcon className={styles.actionIcon} />
              <span>Add Daily Task</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={styles.actionButton}
              onClick={() => navigate('/weekly')}
            >
              <CalendarIcon className={styles.actionIcon} />
              <span>Plan Week</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={styles.actionButton}
              onClick={() => navigate('/learn')}
            >
              <SparklesIcon className={styles.actionIcon} />
              <span>Log Learning</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Data Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={styles.dataManagement}
        >
          <DataManager onDataRefresh={() => {
            loadDataFromLocalStorage();
            if (user) {
              fetchDashboardData(); // Also sync with backend
            }
          }} />
        </motion.div>
      </motion.div>
    </>
  );
};

export default Dashboard; 
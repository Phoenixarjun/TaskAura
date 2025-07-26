import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ChartCard from '../components/ChartCard';
import StreakDisplay from '../components/StreakDisplay';
import MotivationalQuote from '../components/MotivationalQuote';
import { loadFromStorage, getTodayKey, updateStreak } from '../utils/storage';
import { getProgressChartData, getProgressStats, getLast7DaysProgress } from '../utils/dailyProgress';
import { getWeeklyTasks } from '../utils/weeklyUtils';
import { useTheme } from '../contexts/ThemeContext';
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
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import styles from './Dashboard.module.css';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

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
  const { colors } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

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

  // Load all data from different pages
  const todayKey = getTodayKey();
  const dailyTasks = loadFromStorage(todayKey);
  const weeklyTasks = loadFromStorage('weeklyTasks');
  const learnHistory = loadFromStorage('learnHistory');

  // Calculate progress
  const dailyDone = dailyTasks.filter((t: any) => t.done).length;
  const dailyTotal = dailyTasks.length;
  const dailyPercent = dailyTotal ? Math.round((dailyDone / dailyTotal) * 100) : 0;

  const weeklyDone = weeklyTasks.filter((t: any) => t.isCompleted).length;
  const weeklyTotal = weeklyTasks.length;
  const weeklyPercent = weeklyTotal ? Math.round((weeklyDone / weeklyTotal) * 100) : 0;

  const streak = updateStreak(learnHistory);
  const learningRate = learnHistory.length;
  const latestLearnings = [...learnHistory].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 2);

  // Progress tracking data
  const progressChartData = useMemo(() => getProgressChartData(), []);
  const progressStats = useMemo(() => getProgressStats(), []);

  // Weekly Task Progress Chart Data
  const weeklyProgressData = useMemo(() => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyTasks = getWeeklyTasks();
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
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }]
    };
  }, []);

  // Daily Task Completion Chart Data
  const dailyCompletionData = useMemo(() => {
    const last7Days = getLast7DaysProgress();
    return {
      labels: last7Days.map(p => new Date(p.date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [{
        label: 'Daily Tasks Completed',
        data: last7Days.map(p => p.completed),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
      }]
    };
  }, []);

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
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      }]
    };
  }, []);

  // Learning Streak Chart Data
  const learningStreakData = useMemo(() => ({
    labels: ['Current', 'Goal'],
    datasets: [{
      data: [streak, 30],
      backgroundColor: ['rgba(239, 68, 68, 0.8)', 'rgba(156, 163, 175, 0.3)'],
      borderWidth: 0,
      cutout: '70%',
    }]
  }), [streak]);

  // Chart data
  const weeklyChartData = useMemo(() => ({
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [weeklyDone, weeklyTotal - weeklyDone],
        backgroundColor: ['#6366f1', '#d1d5db'],
        borderWidth: 0,
      },
    ],
  }), [weeklyDone, weeklyTotal]);

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

  // Trigger confetti for achievements
  useEffect(() => {
    if (achievements.length > 0 && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [achievements.length, showConfetti]);

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.dashboardContainer}
      style={{
        backgroundColor: colors.primaryBg,
        color: colors.primaryText,
      }}
    >
      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className={styles.confetti}
          >
            {'🎉✨🎊'.repeat(10)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 60 }}
        className={styles.heroSection}
      >
        <div className={styles.heroContent}>
          <div className={styles.greetingSection}>
            <h1 className={styles.greeting}>{greeting}!</h1>
            <div className={styles.timeDisplay}>
              <ClockIcon className={styles.timeIcon} />
              <span className={styles.time}>{formatTime(currentTime)}</span>
            </div>
            <div className={styles.dateDisplay}>
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
            <Bar 
              data={weeklyProgressData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { 
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#6366f1',
                    borderWidth: 1
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }} 
            />
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
            <Line 
              data={dailyCompletionData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { 
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#10b981',
                    borderWidth: 1
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }} 
            />
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
            <Line 
              data={learningRateData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { 
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#a855f7',
                    borderWidth: 1
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }} 
            />
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
            <Doughnut 
              data={learningStreakData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { 
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#ef4444',
                    borderWidth: 1
                  }
                }
              }} 
            />
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
          <h2 className={styles.learningsTitle}>
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
              key={learning.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={styles.learningCard}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className={styles.learningCardHeader}>
                <span className={`${styles.learningCategory} ${styles[learning.category.toLowerCase()]}`}>
                  {learning.category}
                </span>
                <span className={styles.learningDate}>
                  {new Date(learning.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <h3 className={styles.learningTitle}>{learning.title}</h3>
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
            <span className={styles.cardTitle}>Weekly Goals</span>
          </div>
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
            <span className={styles.cardTitle}>Daily Focus</span>
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
            <span className={styles.cardTitle}>Learning Streak</span>
          </div>
          <div className={styles.streakDisplay}>
            <StreakDisplay streak={streak} />
          </div>
          <div className={styles.recentLearnings}>
            <h4 className={styles.learningTitle}>Recent Learnings:</h4>
            <div className={styles.learningItems}>
              {latestLearnings.map((l: any, i: number) => (
                <div key={i} className={styles.learningItem}>
                  <span className={styles.learningCategory}>{l.category}</span>
                  <span className={styles.learningTitle}>{l.title}</span>
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
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  titleColor: '#fff',
                  bodyColor: '#fff',
                  borderColor: '#6366f1',
                  borderWidth: 1
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    callback: function(value) {
                      return value + '%';
                    }
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
          <h2 className={styles.achievementsTitle}>
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
        <h2 className={styles.actionsTitle}>Quick Actions</h2>
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
    </motion.div>
  );
};

export default Dashboard; 
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { PlusIcon, TrashIcon, PencilIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import './Daily.css';
import { dailyTasksAPI } from '../services/apiService';

Chart.register(ArcElement, Tooltip, Legend);

const pageFade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

const modalAnim = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

interface DailyTask {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: string;
  _id?: string; // Added for backend ID
}

function getTodayKey(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `dailyTasks-${year}-${month}-${day}`;
}

function getTodayDate(): string {
  const today = new Date();
  return today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function loadDailyTasks(): DailyTask[] {
  const key = getTodayKey();
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

function saveDailyTasks(tasks: DailyTask[]): void {
  const key = getTodayKey();
  localStorage.setItem(key, JSON.stringify(tasks));
}

function Daily() {
  // State
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editTask, setEditTask] = useState<DailyTask | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSavedBadge, setShowSavedBadge] = useState(false);

  // Load tasks for today from backend
  const loadTasksFromBackend = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await dailyTasksAPI.getAll(today) as any;
      
      // Backend returns { message: string, tasks: array }
      let todayTasks = [];
      if (data && data.tasks && Array.isArray(data.tasks)) {
        // Filter tasks for today
        todayTasks = data.tasks.filter((task: any) => {
          const taskDate = new Date(task.date).toISOString().split('T')[0];
          return taskDate === today;
        });
      }
      
      setTasks(todayTasks);
      console.log('Loaded tasks from backend:', todayTasks);
    } catch (error) {
      // Fallback to localStorage if backend fails
      console.warn('Backend failed, using localStorage:', error);
      setTasks(loadDailyTasks());
    }
  };

  // Load tasks for today
  useEffect(() => {
    loadTasksFromBackend();
  }, []);

  // Save individual task to backend
  const saveTaskToBackend = async (task: DailyTask) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Only create if task doesn't have a backend ID
      if (!task._id) {
        const createdTask = await dailyTasksAPI.create({
          title: task.title,
          description: task.description,
          date: today,
          priority: 'medium',
          category: 'general'
        }) as any;
        
        // Update the task with backend ID
        task._id = createdTask.task._id;
        task.id = createdTask.task._id;
      }
      
      console.log('Saved task to backend:', task);
    } catch (error) {
      console.error('Failed to save to backend:', error);
      // Continue with localStorage save
    }
  };

  // Save all tasks to backend
  const saveAllTasksToBackend = async () => {
    try {
      setSaving(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Save each task to backend
      for (const task of tasks) {
        if (!task._id) {
          await dailyTasksAPI.create({
            title: task.title,
            description: task.description,
            date: today,
            priority: 'medium',
            category: 'general'
          });
        }
      }
      
      console.log('Saved all tasks to backend');
      setShowSavedBadge(true);
      setTimeout(() => setShowSavedBadge(false), 2000);
    } catch (error) {
      console.error('Failed to save to backend:', error);
      toast.error('Failed to save to backend');
    } finally {
      setSaving(false);
    }
  };

  // Progress
  const completed = tasks.filter((t) => t.isCompleted).length;
  const total = tasks.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  // Chart data
  const chartData = useMemo(() => ({
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [completed, total - completed],
        backgroundColor: ['#10b981', '#e5e7eb'],
        borderWidth: 0,
      },
    ],
  }), [completed, total]);

  // Confetti on full completion
  useEffect(() => {
    if (total > 0 && completed === total) {
      setConfetti(true);
      toast.success('Amazing! All daily tasks completed! 🎉');
      setTimeout(() => setConfetti(false), 2000);
    }
  }, [completed, total]);

  // Modal open/close helpers
  const openAddModal = () => {
    setModalMode('add');
    setTitle('');
    setDesc('');
    setEditTask(null);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (task: DailyTask) => {
    setModalMode('edit');
    setTitle(task.title);
    setDesc(task.description || '');
    setEditTask(task);
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTask(null);
    setTitle('');
    setDesc('');
    setFormError('');
  };

  // Add/Edit Task
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setFormError('Title is required');
      return;
    }

    setFormError('');
    setSaving(true);

    try {
      if (modalMode === 'add') {
        // Create task in backend first
        const today = new Date().toISOString().split('T')[0];
        const createdTask = await dailyTasksAPI.create({
          title: title.trim(),
          description: desc.trim() || undefined,
          date: today,
          priority: 'medium',
          category: 'general'
        }) as any;

        // Create local task with backend ID
        const newTask: DailyTask = {
          id: createdTask.task._id,
          title: createdTask.task.title,
          description: createdTask.task.description,
          isCompleted: createdTask.task.completed,
          createdAt: createdTask.task.createdAt,
          _id: createdTask.task._id
        };

        const updated = [...tasks, newTask];
        setTasks(updated);
        saveDailyTasks(updated);
        
        toast.success('✅ Task added successfully!', {
          duration: 3000,
          position: 'bottom-center',
          style: {
            background: '#10b981',
            color: 'white',
            fontWeight: 'bold'
          }
        });

        setTitle('');
        setDesc('');
        setShowModal(false);
      } else if (modalMode === 'edit' && editTask) {
        // Update task in backend
        const today = new Date().toISOString().split('T')[0];
        await dailyTasksAPI.update(editTask._id || editTask.id, {
          title: title.trim(),
          description: desc.trim() || undefined,
          date: today,
          priority: 'medium',
          category: 'general'
        });

        const updated: DailyTask = {
          ...editTask,
          title: title.trim(),
          description: desc.trim() || undefined,
        };

        const updatedTasks = tasks.map(task => 
          task.id === editTask.id ? updated : task
        );
        setTasks(updatedTasks);
        saveDailyTasks(updatedTasks);
        
        toast.success('✅ Task updated successfully!', {
          duration: 3000,
          position: 'bottom-center',
          style: {
            background: '#10b981',
            color: 'white',
            fontWeight: 'bold'
          }
        });

        setEditTask(null);
        setTitle('');
        setDesc('');
        setShowModal(false);
      }
    } catch (error) {
      console.error('Task save error:', error);
      toast.error('❌ Failed to save task', {
        duration: 3000,
        position: 'bottom-center',
        style: {
          background: '#ef4444',
          color: 'white',
          fontWeight: 'bold'
        }
      });
    } finally {
      setSaving(false);
    }
  };

  // Toggle complete
  const handleToggle = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const updatedTasks = tasks.map(task =>
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      );
      setTasks(updatedTasks);
      saveDailyTasks(updatedTasks);

      // Check if all tasks are completed
      const allCompleted = updatedTasks.every(task => task.isCompleted);
      if (allCompleted && updatedTasks.length > 0) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 3000);
      }

      // Save to backend
      if (task._id) {
        await dailyTasksAPI.toggle(task._id);
      }
    } catch (error) {
      console.error('Toggle error:', error);
      toast.error('Failed to toggle task');
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const updatedTasks = tasks.filter(task => task.id !== id);
      setTasks(updatedTasks);
      saveDailyTasks(updatedTasks);

      // Delete from backend
      if (task._id) {
        await dailyTasksAPI.delete(task._id);
      }
      
      toast.success('✅ Task deleted successfully!', {
        duration: 3000,
        position: 'bottom-center',
        style: {
          background: '#10b981',
          color: 'white',
          fontWeight: 'bold'
        }
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete task');
    }
  };

  return (
    <motion.div
      variants={pageFade}
      initial="hidden"
      animate="visible"
      className="daily-container"
    >
      {/* Confetti */}
      <AnimatePresence>
        {confetti && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="confetti"
          >
            {'🎉✨🎊'.repeat(10)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="daily-header">
        <div>
          <h1 className="daily-title">Today's Focus</h1>
          <div className="daily-date">{getTodayDate()}</div>
        </div>
        <div className="daily-header-controls">
          <div className="daily-progress">
            <Doughnut 
              data={chartData} 
              options={{ 
                cutout: '70%', 
                plugins: { legend: { display: false } },
                responsive: true,
                maintainAspectRatio: false
              }} 
            />
          </div>
          <div className="daily-progress-text">
            <span className="progress-percent">{percent}%</span>
            <span className="progress-label">Complete</span>
          </div>
        </div>
        <div className="daily-header-controls">
          <button
            className="save-btn"
            onClick={saveAllTasksToBackend}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Daily Tasks'}
            <ArrowDownTrayIcon className="save-icon" />
          </button>
          {showSavedBadge && (
            <span className="saved-badge">Saved!</span>
          )}
        </div>
      </div>

      {/* Add Task Button */}
      <div className="daily-add-task-container">
        <motion.button
          className="daily-add-task-btn"
          onClick={openAddModal}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <PlusIcon className="add-icon" /> Add Task
        </motion.button>
      </div>

      {/* Task List */}
      <div className="daily-task-list">
        {tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="daily-empty-state"
          >
            <span className="empty-icon">☀️</span>
            <div className="empty-message">No tasks yet. What's on your plate today?</div>
          </motion.div>
        ) : (
          <ul>
            <AnimatePresence>
              {tasks.map((task, idx) => (
                <motion.li
                  key={task.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                  className={`daily-task-card${task.isCompleted ? ' completed' : ''}`}
                >
                  <motion.input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => handleToggle(task.id)}
                    whileTap={{ scale: 1.2 }}
                    className="task-checkbox"
                    aria-label={task.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                  />
                  <div className="task-details">
                    <div className="task-title-wrapper">
                      <span className="task-status-dot"></span>
                      <span className={`task-title${task.isCompleted ? ' completed' : ''}`}>
                        {task.title}
                      </span>
                    </div>
                    {task.description && (
                      <div className={`task-description${task.isCompleted ? ' completed' : ''}`}>{task.description}</div>
                    )}
                  </div>
                  <div className="task-actions">
                    <motion.button
                      className="task-edit-btn"
                      onClick={() => openEditModal(task)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Edit task"
                    >
                      <PencilIcon className="action-icon" />
                    </motion.button>
                    <motion.button
                      className="task-delete-btn"
                      onClick={() => handleDelete(task.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Delete task"
                    >
                      <TrashIcon className="action-icon" />
                    </motion.button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* Add/Edit Task Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-backdrop"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalAnim}
            aria-modal="true"
            role="dialog"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <motion.form
              onSubmit={handleSaveTask}
              className="daily-modal"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalAnim}
            >
              <div className="modal-header-bar" />
              <h2 className="modal-title">
                {modalMode === 'add' ? 'Add Daily Task' : 'Edit Task'}
              </h2>
              <label className="form-label">
                Task Title<span className="required">*</span>
              </label>
              <input
                className="form-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                autoFocus
                placeholder="Enter task title"
                aria-required="true"
              />
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                rows={3}
                placeholder="Optional description"
              />
              {formError && <div className="form-error">{formError}</div>}
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                >
                  {modalMode === 'add' ? 'Add Task' : 'Save Changes'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Daily; 
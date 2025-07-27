import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { PlusIcon, TrashIcon, PencilIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import './Daily.css';

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

import { API_ENDPOINTS } from '../utils/config';

const API_URL = API_ENDPOINTS.dailyTasks;

interface DailyTask {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: string;
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

  // Load tasks for today
  useEffect(() => {
    setTasks(loadDailyTasks());
  }, []);

  // Save daily tasks to backend
  const saveToBackend = async () => {
    if (tasks.length === 0) {
      toast.error('📝 No tasks to save. Add some daily tasks first!', {
        duration: 3000,
        position: 'bottom-center',
        style: {
          background: '#f59e0b',
          color: 'white',
          fontWeight: 'bold'
        }
      });
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: getTodayKey(),
          tasks: tasks
        }),
      });
      
      if (response.ok) {
        toast.success('✅ Daily tasks saved successfully to backend!', {
          duration: 3000,
          position: 'bottom-center',
          style: {
            background: '#10b981',
            color: 'white',
            fontWeight: 'bold'
          }
        });
        setShowSavedBadge(true);
        setTimeout(() => setShowSavedBadge(false), 2000);
      } else {
        toast.error('❌ Failed to save daily tasks. Server error.', {
          duration: 4000,
          position: 'bottom-center',
          style: {
            background: '#ef4444',
            color: 'white',
            fontWeight: 'bold'
          }
        });
      }
    } catch (error) {
      toast.error('🔌 Connection error! Please check if backend server is running.', {
        duration: 5000,
        position: 'bottom-center',
        style: {
          background: '#f59e0b',
          color: 'white',
          fontWeight: 'bold'
        }
      });
      console.error('Save error:', error);
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
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Task title is required');
      return;
    }
    setFormError('');

    if (modalMode === 'add') {
      const newTask: DailyTask = {
        id: uuidv4(),
        title: title.trim(),
        description: desc.trim(),
        isCompleted: false,
        createdAt: new Date().toISOString(),
      };
      const updated = [newTask, ...tasks];
      setTasks(updated);
      saveDailyTasks(updated);
      toast.success('Task added successfully!');
      
      // Notify dashboard of task update
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    } else if (editTask) {
      const updated = { ...editTask, title: title.trim(), description: desc.trim() };
      const updatedTasks = tasks.map((t) => (t.id === editTask.id ? updated : t));
      saveDailyTasks(updatedTasks);
      setTasks(updatedTasks);
      toast.success('Task updated successfully!');
      
      // Notify dashboard of task update
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    }
    closeModal();
  };

  // Toggle complete
  const handleToggle = (id: string) => {
    const updatedTasks = tasks.map((t) =>
      t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
    );
    saveDailyTasks(updatedTasks);
    setTasks(updatedTasks);
    
    // Notify dashboard of task update
    window.dispatchEvent(new CustomEvent('taskUpdated'));
  };

  // Delete
  const handleDelete = (id: string) => {
    const updatedTasks = tasks.filter((t) => t.id !== id);
    saveDailyTasks(updatedTasks);
    setTasks(updatedTasks);
    toast.success('Task deleted successfully!');
    
    // Notify dashboard of task update
    window.dispatchEvent(new CustomEvent('taskUpdated'));
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
            onClick={saveToBackend}
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
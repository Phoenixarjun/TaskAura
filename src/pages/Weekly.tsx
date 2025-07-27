import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getCurrentWeekRange,
  isNewWeek,
  resetWeeklyTasks,
  getWeekStartDate,
} from '../utils/weeklyUtils';
import { v4 as uuidv4 } from 'uuid';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import './Weekly.css';

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const pageFade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

const modalAnim = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

const API_URL = 'http://localhost:4000/api/weekly-tasks';

function Weekly() {
  // State
  const [tasks, setTasks] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editTask, setEditTask] = useState<any | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  // Add error state for title
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSavedBadge, setShowSavedBadge] = useState(false);

  // Load tasks from backend on mount
  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(() => toast.error('Failed to load weekly tasks'))
      .finally(() => setLoading(false));
  }, []);

  // Save tasks to backend
  const saveWeeklyTasks = async (tasksToSave: any[]) => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tasksToSave),
      });
      
      if (response.ok) {
        toast.success('✅ Weekly tasks saved successfully to backend!', {
          duration: 3000,
          position: 'bottom-center',
          style: {
            background: '#6366f1',
            color: 'white',
            fontWeight: 'bold'
          }
        });
        setShowSavedBadge(true);
        setTimeout(() => setShowSavedBadge(false), 2000);
      } else {
        toast.error('❌ Failed to save weekly tasks. Server error.', {
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
      setLoading(false);
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
        backgroundColor: ['#6366f1', '#e5e7eb'],
        borderWidth: 0,
      },
    ],
  }), [completed, total]);

  // Week range
  const [weekStart, weekEnd] = getCurrentWeekRange();

  // Confetti on full completion
  useEffect(() => {
    if (total > 0 && completed === total) {
      setConfetti(true);
      toast.success('Well Done! All tasks completed 🎉');
      setTimeout(() => setConfetti(false), 2000);
    }
  }, [completed, total]);

  // Modal open/close helpers
  const openAddModal = () => {
    setModalMode('add');
    setTitle('');
    setDesc('');
    setEditTask(null);
    setShowModal(true);
  };
  const openEditModal = (task: any) => {
    setModalMode('edit');
    setTitle(task.title);
    setDesc(task.description || '');
    setEditTask(task);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditTask(null);
    setTitle('');
    setDesc('');
  };

  // Add/Edit Task
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Task title is required');
      return;
    }
    setFormError('');
    if (modalMode === 'add') {
      const newTask = {
        id: uuidv4(),
        title: title.trim(),
        description: desc.trim(),
        isCompleted: false,
        createdAt: new Date().toISOString(),
      };
      const updated = [newTask, ...tasks];
      setTasks(updated);
      await saveWeeklyTasks(updated);
      
      // Notify dashboard of task update
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    } else if (editTask) {
      const updated = { ...editTask, title: title.trim(), description: desc.trim() };
      const updatedTasks = tasks.map((t) => (t.id === editTask.id ? updated : t));
      setTasks(updatedTasks);
      await saveWeeklyTasks(updatedTasks);
      
      // Notify dashboard of task update
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    }
    closeModal();
  };

  // Toggle complete
  const handleToggle = async (id: string) => {
    const updatedTasks = tasks.map((t) =>
      t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
    );
    setTasks(updatedTasks);
    await saveWeeklyTasks(updatedTasks);
    
    // Notify dashboard of task update
    window.dispatchEvent(new CustomEvent('taskUpdated'));
  };

  // Delete
  const handleDelete = async (id: string) => {
    const updatedTasks = tasks.filter((t) => t.id !== id);
    setTasks(updatedTasks);
    await saveWeeklyTasks(updatedTasks);
    
    // Notify dashboard of task update
    window.dispatchEvent(new CustomEvent('taskUpdated'));
  };

  // Reset week
  const handleReset = async () => {
    setTasks([]);
    await saveWeeklyTasks([]);
    setShowReset(false);
    
    // Notify dashboard of task update
    window.dispatchEvent(new CustomEvent('taskUpdated'));
  };

  // Manual Save button
  const handleManualSave = async () => {
    if (tasks.length === 0) {
      toast.error('📝 No tasks to save. Add some weekly tasks first!', {
        duration: 3000,
        style: {
          background: '#f59e0b',
          color: 'white',
          fontWeight: 'bold'
        }
      });
      return;
    }
    await saveWeeklyTasks(tasks);
  };

  return (
    <motion.div
      variants={pageFade}
      initial="hidden"
      animate="visible"
      className="weekly-container"
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
            {'🎉'.repeat(10)}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <div className="weekly-header">
        <div>
          <h1 className="weekly-title">Plan Your Week</h1>
          <div className="weekly-date-range">{weekStart} – {weekEnd}</div>
        </div>
        <div className="weekly-header-controls">
          <div className="weekly-progress">
            <Doughnut data={chartData} options={{ cutout: '70%', plugins: { legend: { display: false } } }} />
          </div>
          <button
            className="weekly-reset-btn"
            onClick={() => setShowReset(true)}
          >
            Reset Week
          </button>
        </div>
      </div>
      {/* Add Task Button */}
      <div className="weekly-add-task-container">
        <button
          className="weekly-add-task-btn"
          onClick={openAddModal}
        >
          <PlusIcon className="add-icon" /> Add Task
        </button>
        <button
          className="weekly-save-btn"
          onClick={handleManualSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        {showSavedBadge && (
          <span className="saved-badge">Saved!</span>
        )}
      </div>
      {/* Task List */}
      <div className="weekly-task-list">
        {tasks.length === 0 ? (
          <div className="weekly-empty-state">
            <span className="empty-icon">🗓️</span>
            <div className="empty-message">Nothing planned yet. Add something!</div>
          </div>
        ) : (
          <ul>
            <AnimatePresence>
              {tasks.map((task, idx) => (
                <motion.li
                  key={task.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  className={`weekly-task-card${task.isCompleted ? ' completed' : ''}`}
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
                      <span className={`task-title${task.isCompleted ? ' completed' : ''}`}>{task.title}</span>
                    </div>
                    {task.description && <div className={`task-description${task.isCompleted ? ' completed' : ''}`}>{task.description}</div>}
                  </div>
                  <div className="task-actions">
                    <button
                      className="task-edit-btn"
                      onClick={() => openEditModal(task)}
                      aria-label="Edit task"
                    >
                      <PencilIcon className="action-icon" />
                    </button>
                    <button
                      className="task-delete-btn"
                      onClick={() => handleDelete(task.id)}
                      aria-label="Delete task"
                    >
                      <TrashIcon className="action-icon" />
                    </button>
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
          >
            <motion.form
              onSubmit={handleSaveTask}
              className="weekly-modal"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalAnim}
            >
              <div className="modal-header-bar" />
              <h2 className="modal-title">{modalMode === 'add' ? 'Add Task' : 'Edit Task'}</h2>
              <label className="form-label">Task Title<span className="required">*</span></label>
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
      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showReset && (
          <motion.div
            className="modal-backdrop"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalAnim}
            aria-modal="true"
            role="dialog"
          >
            <motion.div
              className="confirm-modal"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalAnim}
            >
              <div className="modal-header-bar" />
              <h2 className="modal-title">Reset Week?</h2>
              <p className="confirm-message">This will remove all weekly tasks. Are you sure?</p>
              <div className="confirm-buttons">
                <button
                  className="confirm-cancel"
                  onClick={() => setShowReset(false)}
                >
                  Cancel
                </button>
                <button
                  className="confirm-reset"
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Weekly; 
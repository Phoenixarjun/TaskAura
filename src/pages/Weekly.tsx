import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getCurrentWeekRange,
  isNewWeek,
  resetWeeklyTasks,
  getWeeklyTasks,
  saveWeeklyTasks,
  addWeeklyTask,
  updateWeeklyTask,
  deleteWeeklyTask,
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

  // Auto-reset on Sunday
  useEffect(() => {
    if (isNewWeek()) {
      resetWeeklyTasks();
    }
    setTasks(getWeeklyTasks());
  }, []);

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
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Task title is required');
      return;
    }
    setFormError('');
    if (modalMode === 'add') {
      const newTask = addWeeklyTask(title.trim(), desc.trim());
      setTasks([...tasks, newTask]);
    } else if (editTask) {
      const updated = { ...editTask, title: title.trim(), description: desc.trim() };
      const updatedTasks = tasks.map((t) => (t.id === editTask.id ? updated : t));
      saveWeeklyTasks(updatedTasks);
      setTasks(updatedTasks);
    }
    closeModal();
  };

  // Toggle complete
  const handleToggle = (id: string) => {
    const updatedTasks = tasks.map((t) =>
      t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
    );
    saveWeeklyTasks(updatedTasks);
    setTasks(updatedTasks);
  };

  // Delete
  const handleDelete = (id: string) => {
    deleteWeeklyTask(id);
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // Reset week
  const handleReset = () => {
    resetWeeklyTasks();
    setTasks([]);
    setShowReset(false);
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
                    {task.description && <div className="task-description">{task.description}</div>}
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
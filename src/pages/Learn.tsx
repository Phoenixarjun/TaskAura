import React, { useEffect, useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { loadFromStorage, saveToStorage, updateStreak } from '../utils/storage';
import { PencilIcon, TrashIcon, FireIcon, PlusIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import './Learn.css';
import BookOpenIcon from '@heroicons/react/24/solid/BookOpenIcon';

const CATEGORIES = [
  { label: 'Tech', color: 'bg-blue-500' },
  { label: 'Life', color: 'bg-green-500' },
  { label: 'Finance', color: 'bg-yellow-500' },
  { label: 'Mindset', color: 'bg-purple-500' },
  { label: 'Other', color: 'bg-gray-500' },
];
const MILESTONES = [7, 14, 30];

function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

interface LearningEntry {
  id: string;
  title: string;
  description?: string;
  category: string;
  source?: string;
  date: string;
}

const modalAnim = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, type: 'spring' as const, stiffness: 70 } }),
  exit: { opacity: 0, scale: 0.9 },
};

const QUOTES = [
  'Learning never exhausts the mind. – Leonardo da Vinci',
  'The beautiful thing about learning is nobody can take it away from you. – B.B. King',
  'Live as if you were to die tomorrow. Learn as if you were to live forever. – Mahatma Gandhi',
  'The more that you read, the more things you will know. – Dr. Seuss',
  'Education is the most powerful weapon which you can use to change the world. – Nelson Mandela',
];
const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

const Learn: React.FC = () => {
  const [learnings, setLearnings] = useState<LearningEntry[]>(() => loadFromStorage('learnHistory'));
  const [form, setForm] = useState({ title: '', description: '', category: 'Tech', source: '' });
  const [formError, setFormError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editEntry, setEditEntry] = useState<LearningEntry | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const today = getTodayISO();
  const streak = useMemo(() => updateStreak(learnings), [learnings]);
  const learningRate = learnings.length;
  const todayLearnings = learnings.filter(l => l.date === today);
  const pastLearnings = learnings.filter(l => l.date !== today);

  // Milestone confetti
  useEffect(() => {
    if (MILESTONES.includes(streak)) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  }, [streak]);

  // --- Handlers ---
  const openAddModal = () => {
    setModalMode('add');
    setForm({ title: '', description: '', category: 'Tech', source: '' });
    setEditEntry(null);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (entry: LearningEntry) => {
    setModalMode('edit');
    setForm({
      title: entry.title,
      description: entry.description || '',
      category: entry.category,
      source: entry.source || '',
    });
    setEditEntry(entry);
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditEntry(null);
    setForm({ title: '', description: '', category: 'Tech', source: '' });
    setFormError('');
  };

  // Add/Edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setFormError('Title is required');
      return;
    }

    if (modalMode === 'add') {
      const newEntry: LearningEntry = {
        id: uuidv4(),
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        source: form.source.trim(),
        date: today,
      };
      
      const updated = [newEntry, ...learnings];
      setLearnings(updated);
      saveToStorage('learnHistory', updated);
      closeModal();
    } else if (editEntry) {
      const updated = learnings.map((l) =>
        l.id === editEntry.id 
          ? { 
              ...l, 
              title: form.title.trim(),
              description: form.description.trim(),
              category: form.category,
              source: form.source.trim()
            } 
          : l
      );
      setLearnings(updated);
      saveToStorage('learnHistory', updated);
      closeModal();
    }
  };

  // Delete
  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    const updated = learnings.filter((l) => l.id !== deleteId);
    setLearnings(updated);
    saveToStorage('learnHistory', updated);
    setDeleteId(null);
    if (editEntry && editEntry.id === deleteId) closeModal();
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  // --- UI ---
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="learn-container"
    >
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="confetti"
          >
            {'🔥🎉'.repeat(7)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Header */}
      <div
        className="streak-header redesigned-streak-header"
      >
        <div className="streak-header-svg">
          <BookOpenIcon className="streak-svg-icon" />
        </div>
        <div className="streak-header-content">
          <div className="streak-flame">
            <FireIcon className="flame-icon" />
            <span className="streak-count">{streak}</span>
            <span className="streak-label">Day Streak</span>
          </div>
          <div className="learning-rate">
            <ChartBarIcon className="rate-icon" />
            <span className="rate-count">{learningRate}</span>
            <span className="rate-label">Learning Rate</span>
          </div>
          <div className="streak-subtext">Keep learning every day to grow your streak and rate.</div>
          <div className="streak-quote">The more that you read, the more things you will know. – Dr. Seuss</div>
        </div>
      </div>

      {/* Today's Learning Stack */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        className="learn-form-section"
      >
        <div className="today-learnings">
          <div className="today-header">
            <h3 className="today-title">Today's Learnings</h3>
            <button
              className="add-learning-btn"
              onClick={openAddModal}
              aria-label="Add new learning"
            >
              <PlusIcon className="add-icon" />
              Add Learning
            </button>
          </div>
          
          {todayLearnings.length === 0 ? (
            <div className="today-empty">
              <span className="today-empty-icon">📚</span>
              <div className="today-empty-message">No learnings yet today. Start your journey!</div>
            </div>
          ) : (
            <div className="today-stack">
              <AnimatePresence>
                {todayLearnings.map((entry, idx) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.1 }}
                    className="today-learning-card"
                  >
                    <div className="learning-card-header">
                      <span className={`category-badge ${entry.category.toLowerCase()}`}>
                        {entry.category}
                      </span>
                      <span className="learning-card-title">{entry.title}</span>
                    </div>
                    {entry.description && (
                      <div className="learning-card-desc">{entry.description}</div>
                    )}
                    {entry.source && (
                      <a 
                        href={entry.source} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="learning-card-source"
                      >
                        Source
                      </a>
                    )}
                    <div className="learning-card-actions">
                      <button
                        className="edit-btn"
                        onClick={() => openEditModal(entry)}
                        aria-label="Edit learning"
                      >
                        <PencilIcon className="action-icon" />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(entry.id)}
                        aria-label="Delete learning"
                      >
                        <TrashIcon className="action-icon" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* Past Learnings */}
      {pastLearnings.length > 0 && (
        <div className="timeline-section">
          <h2 className="timeline-title">
            <FireIcon className="timeline-fire" />
            Learning History
          </h2>
          <motion.ul
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{}}
            className="timeline"
          >
            <AnimatePresence>
              {pastLearnings.map((entry, idx) => (
                <motion.li
                  key={entry.id}
                  custom={idx}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={cardVariants}
                  className="timeline-card"
                >
                  <div className="timeline-card-header">
                    <span className={`category-badge ${entry.category.toLowerCase()}`}>
                      {entry.category}
                    </span>
                    <span className="timeline-card-title">{entry.title}</span>
                  </div>
                  {entry.description && (
                    <div className="timeline-card-desc">{entry.description}</div>
                  )}
                  {entry.source && (
                    <a 
                      href={entry.source} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="timeline-card-source"
                    >
                      Source
                    </a>
                  )}
                  <div className="timeline-card-date">{formatDate(entry.date)}</div>
                  <div className="timeline-card-actions">
                    <button
                      className="edit-btn"
                      onClick={() => openEditModal(entry)}
                      aria-label="Edit learning"
                    >
                      <PencilIcon className="action-icon" />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(entry.id)}
                      aria-label="Delete learning"
                    >
                      <TrashIcon className="action-icon" />
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </div>
      )}

      {/* Edit/Add Modal */}
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
              onSubmit={handleSubmit}
              className="learn-modal"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalAnim}
            >
              <div className="modal-header-bar" />
              <h2 className="modal-title">{modalMode === 'add' ? 'Add Learning' : 'Edit Learning'}</h2>
              <label className="form-label">Title<span className="required">*</span></label>
              <input
                className="form-input"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
                autoFocus
                placeholder="What did you learn?"
                aria-required="true"
              />
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Optional description"
              />
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                aria-label="Category"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.label} value={cat.label}>{cat.label}</option>
                ))}
              </select>
              <label className="form-label">Source</label>
              <input
                className="form-input"
                value={form.source}
                onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                placeholder="Optional source (URL or text)"
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
                  {modalMode === 'add' ? 'Add Learning' : 'Save Changes'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="modal-backdrop"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalAnim}
            aria-modal="true"
            role="dialog"
            onClick={(e) => {
              if (e.target === e.currentTarget) cancelDelete();
            }}
          >
            <motion.div
              className="confirm-modal"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalAnim}
            >
              <div className="modal-header-bar" />
              <h2 className="modal-title">Delete Learning?</h2>
              <p className="confirm-message">This will remove the learning entry. Are you sure?</p>
              <div className="confirm-buttons">
                <button
                  className="confirm-cancel"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
                <button
                  className="confirm-reset"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Learn; 
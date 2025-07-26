import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface Field {
  label: string;
  name: string;
  required?: boolean;
  type?: 'text' | 'textarea';
  placeholder?: string;
}

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (values: Record<string, string>) => void;
  fields: Field[];
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ open, onClose, onAdd, fields }) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const { colors } = useTheme();

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(values);
    setValues({});
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <form 
        className="modal-container" 
        onSubmit={handleSubmit}
      >
        <div className="modal-header-bar" />
        <h2 className="modal-title">Add Task</h2>
        {fields.map((field) => (
          <div key={field.name}>
            <label 
              className="form-label" 
              htmlFor={field.name}
            >
              {field.label}{field.required && <span className="required">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                required={field.required}
                className="form-textarea"
                value={values[field.name] || ''}
                onChange={handleChange}
                placeholder={field.placeholder}
              />
            ) : (
              <input
                id={field.name}
                name={field.name}
                required={field.required}
                className="form-input"
                type={field.type || 'text'}
                value={values[field.name] || ''}
                onChange={handleChange}
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
          >
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTaskModal; 
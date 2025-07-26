import React, { useState } from 'react';

interface Field {
  label: string;
  name: string;
  required?: boolean;
  type?: 'text' | 'textarea';
}

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (values: Record<string, string>) => void;
  fields: Field[];
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ open, onClose, onAdd, fields }) => {
  const [values, setValues] = useState<Record<string, string>>({});

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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form className="bg-white dark:bg-dark-bg rounded-lg p-6 w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-4 text-light-text dark:text-light-text">Add Task</h2>
        {fields.map((field) => (
          <div className="mb-4" key={field.name}>
            <label className="block mb-1 font-medium text-light-text dark:text-light-text" htmlFor={field.name}>{field.label}{field.required && '*'}</label>
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                required={field.required}
                className="w-full p-2 border rounded dark:bg-dark-bg dark:text-light-text"
                value={values[field.name] || ''}
                onChange={handleChange}
              />
            ) : (
              <input
                id={field.name}
                name={field.name}
                required={field.required}
                className="w-full p-2 border rounded dark:bg-dark-bg dark:text-light-text"
                value={values[field.name] || ''}
                onChange={handleChange}
              />
            )}
          </div>
        ))}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-black dark:text-white">Cancel</button>
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Add</button>
        </div>
      </form>
    </div>
  );
};

export default AddTaskModal; 
import React from 'react';

const StatusBadge = ({ status }) => {
  // Define styling presets based on task status
  const config = {
    todo: {
      label: 'To Do',
      classes: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50',
    },
    in_progress: {
      label: 'In Progress',
      classes: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50',
    },
    done: {
      label: 'Completed',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
    },
  };

  // Get active styling. Fall back to 'todo' if status value is invalid
  const current = config[status] || config.todo;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-300 ${current.classes}`}
    >
      {/* Small dot icon for visual polish */}
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current" />
      {current.label}
    </span>
  );
};

export default StatusBadge;

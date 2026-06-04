import React from 'react';
import { Calendar, Trash2, Edit, AlertCircle, User } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';

const TaskCard = ({ task, onEdit }) => {
  const { user } = useAuthStore();
  const { updateTask, deleteTask } = useTaskStore();

  const isCompleted = task.status === 'done';
  const dueDateObj = new Date(task.dueDate);
  const today = new Date();
  
  // A task is overdue if it is NOT completed and the due date is earlier than today (clearing time of day for fair match)
  const isOverdue = !isCompleted && new Date(dueDateObj.toDateString()) < new Date(today.toDateString());

  // Handle status transitions
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    await updateTask(task._id, { status: newStatus });
  };

  // Format date nicely
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div 
      className={`glass-card p-5 rounded-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-full border-l-4 ${
        isOverdue 
          ? 'border-l-rose-500' 
          : isCompleted 
            ? 'border-l-emerald-500' 
            : 'border-l-amber-500'
      }`}
    >
      <div>
        {/* Header section with status and overdue highlights */}
        <div className="flex items-center justify-between mb-3">
          <StatusBadge status={task.status} />
          {isOverdue && (
            <span className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full border border-rose-100 dark:border-rose-900/50 animate-pulse">
              <AlertCircle size={12} />
              Overdue
            </span>
          )}
        </div>

        {/* Task Title & Description */}
        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-1 leading-snug line-clamp-1">
          {task.title}
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 h-10">
          {task.description || 'No description provided.'}
        </p>
      </div>

      <div>
        {/* Date and Assignee Information */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Calendar size={14} className={isOverdue ? 'text-rose-500' : 'text-slate-400'} />
            <span className={isOverdue ? 'font-semibold text-rose-600 dark:text-rose-400' : ''}>
              {formatDate(task.dueDate)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 flex items-center justify-center text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
              {task.assignedTo ? (
                task.assignedTo.name.split(' ').map(n => n[0]).join('')
              ) : (
                <User size={10} className="text-indigo-500" />
              )}
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 line-clamp-1 max-w-[90px]">
              {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
            </span>
          </div>
        </div>

        {/* Action Controls Section */}
        <div className="flex items-center justify-between gap-2">
          {/* Status Quick selector (Active for everyone who can update status) */}
          <div className="flex-grow">
            <select
              value={task.status}
              onChange={handleStatusChange}
              className="w-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-lg border border-transparent focus:border-slate-300 focus:outline-none cursor-pointer transition-all"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Completed</option>
            </select>
          </div>

          {/* Admin editing/deleting controls */}
          {user?.role === 'admin' && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(task)}
                title="Edit Task"
                className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={async () => {
                  if (confirm('Are you sure you want to delete this task?')) {
                    await deleteTask(task._id);
                  }
                }}
                title="Delete Task"
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';

const ProjectModal = ({ isOpen, onClose, projectToEdit }) => {
  const { users, fetchUsers, user: currentUser } = useAuthStore();
  const { createProject, updateProject } = useProjectStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load all users from DB when modal is opened (so we can choose members)
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Prepopulate form fields if editing an existing project
  useEffect(() => {
    if (projectToEdit && isOpen) {
      setName(projectToEdit.name || '');
      setDescription(projectToEdit.description || '');
      
      // Pull member IDs from populated member objects
      const memberIds = projectToEdit.members?.map(m => m._id || m) || [];
      setSelectedMembers(memberIds);
    } else {
      // Setup default for new projects: include current user
      setName('');
      setDescription('');
      setSelectedMembers(currentUser ? [currentUser._id] : []);
    }
    setError('');
  }, [projectToEdit, isOpen, currentUser]);

  if (!isOpen) return null;

  // Toggle member selections inside state array
  const handleToggleMember = (userId) => {
    setSelectedMembers(prev => {
      if (prev.includes(userId)) {
        // Prevent admins from accidentally removing themselves if they are the creator
        if (projectToEdit && projectToEdit.createdBy?._id === userId && userId === currentUser?._id) {
          return prev; 
        }
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }

    setLoading(true);

    const projectPayload = {
      name,
      description,
      members: selectedMembers,
    };

    let result;
    if (projectToEdit) {
      result = await updateProject(projectToEdit._id, projectPayload);
    } else {
      result = await createProject(projectPayload);
    }

    setLoading(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Failed to save project.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
            {projectToEdit ? 'Edit Project Settings' : 'Create New Project'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-xs bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 p-3 rounded-lg border border-rose-100 dark:border-rose-900/30">
              {error}
            </div>
          )}

          {/* Project Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mobile Application v2"
              className="w-full text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about? Define scope and deliverables..."
              rows={3}
              className="w-full text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Member Selection (Checkbox list) */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Select Project Members
            </label>
            
            {/* Scrollable multi-select wrapper */}
            <div className="border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/20 max-h-40 overflow-y-auto p-2.5 space-y-1.5">
              {users.map(u => {
                const isSelected = selectedMembers.includes(u._id);
                const isSelf = u._id === currentUser?._id;
                
                return (
                  <div
                    key={u._id}
                    onClick={() => handleToggleMember(u._id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200/50 dark:border-slate-700/50' 
                        : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {u.name} {isSelf && <span className="text-[10px] text-slate-400">(You)</span>}
                        </span>
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          {u.email}
                        </span>
                      </div>
                    </div>

                    {/* Visual Checkbox Badge */}
                    <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-indigo-600 border border-indigo-700 text-white' 
                        : 'border border-slate-300 dark:border-slate-700'
                    }`}>
                      {isSelected && <Check size={10} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
              {users.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-400">
                  No other members found in workspace.
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 disabled:opacity-50 transition-all"
            >
              {loading ? 'Saving...' : projectToEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;

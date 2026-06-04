import React, { useState, useEffect } from 'react';
import { X, Check, Search, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const AddMembersModal = ({ isOpen, onClose, currentMembers = [], onAdd }) => {
  const { users, fetchUsers } = useAuthStore();
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Load all users from DB when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setSelectedIds([]);
      setSearchQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Extract list of IDs that are already project members
  const existingMemberIds = currentMembers.map(m => m._id || m);

  // Filter users to only show those who are NOT yet members of the project
  const eligibleUsers = users.filter(u => {
    const isAlreadyMember = existingMemberIds.includes(u._id);
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return !isAlreadyMember && matchesSearch;
  });

  const handleToggleUser = (userId) => {
    setSelectedIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === eligibleUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(eligibleUsers.map(u => u._id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;

    setLoading(true);
    // Combine existing member IDs with new selections
    const updatedMemberIds = [...existingMemberIds, ...selectedIds];
    await onAdd(updatedMemberIds);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-indigo-500" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Add Workspace Members</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search members by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Members list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Members ({selectedIds.length} selected)
              </span>
              {eligibleUsers.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {selectedIds.length === eligibleUsers.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            <div className="border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/10 max-h-56 overflow-y-auto p-2 space-y-1">
              {eligibleUsers.length > 0 ? (
                eligibleUsers.map(u => {
                  const isSelected = selectedIds.includes(u._id);
                  return (
                    <div
                      key={u._id}
                      onClick={() => handleToggleUser(u._id)}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200/50 dark:border-slate-700/50' 
                          : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/40 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-xs shrink-0 border border-indigo-500/10">
                          {u.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                            {u.name}
                          </span>
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500 truncate">
                            {u.email}
                          </span>
                        </div>
                      </div>

                      {/* Checkbox circle */}
                      <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-indigo-600 border border-indigo-700 text-white' 
                          : 'border border-slate-300 dark:border-slate-700'
                      }`}>
                        {isSelected && <Check size={10} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                  {searchQuery ? 'No members match search.' : 'All members are already in the project.'}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedIds.length === 0}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {loading ? 'Adding...' : `Add Members`}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default AddMembersModal;
export { AddMembersModal };

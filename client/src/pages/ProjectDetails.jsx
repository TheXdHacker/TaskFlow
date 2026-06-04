import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import ProjectModal from '../components/ProjectModal';
import { AddMembersModal } from '../components/AddMembersModal';
import { Plus, Users, Settings, Trash2, ChevronLeft, Calendar } from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentProject, fetchProjectById, updateProject, deleteProject, loading: projectLoading } = useProjectStore();
  const { tasks, fetchTasks, loading: tasksLoading } = useTaskStore();

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Fetch project details and tasks on component mount
  useEffect(() => {
    fetchProjectById(id);
    fetchTasks(id);
  }, [id]);

  const handleDeleteProject = async () => {
    if (confirm('⚠️ WARNING: Deleting this project will permanently delete all its associated tasks. This action cannot be undone. Are you sure you want to proceed?')) {
      const result = await deleteProject(id);
      if (result.success) {
        navigate('/projects'); // Return to project list
      }
    }
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setTaskModalOpen(true);
  };

  const handleCreateTaskClick = () => {
    setTaskToEdit(null); // Clear previous edit state
    setTaskModalOpen(true);
  };

  const handleAddMembers = async (updatedMemberIds) => {
    const result = await updateProject(currentProject._id, {
      members: updatedMemberIds,
    });
    if (result.success) {
      fetchProjectById(id);
    }
  };

  // 1. Separate tasks into Kanban board columns based on status
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  // Format date utility
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (projectLoading && !currentProject) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading project workspace...</p>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-600 dark:text-slate-400">Workspace project could not be found.</p>
        <button onClick={() => navigate('/projects')} className="mt-4 text-sm text-indigo-600 font-bold hover:underline">
          Return to Projects list
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Back link & Project Admin Actions row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/50 dark:border-slate-800/50 transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Back to Projects"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{currentProject.name}</h1>
            <span className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <Calendar size={12} />
              Created {formatDate(currentProject.createdAt)} by {currentProject.createdBy?.name || 'Admin'}
            </span>
          </div>
        </div>

        {/* Project controls (Admin Only) */}
        {user?.role === 'admin' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setProjectModalOpen(true)}
              className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-200"
            >
              <Settings size={14} />
              Configure Workspace
            </button>
            <button
              onClick={handleDeleteProject}
              className="flex items-center gap-1.5 border border-transparent hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-semibold px-4 py-2 rounded-xl text-sm transition-all"
              title="Delete Project"
            >
              <Trash2 size={14} />
              Delete Project
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Left side Kanban board, Right side members drawer */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Left Pane: Kanban Board Column Container (Span 3/4) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Create Task Action header */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kanban Board Board</span>
            {user?.role === 'admin' && (
              <button
                onClick={handleCreateTaskClick}
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-3.5 py-1.5 rounded-xl text-xs transition-all duration-200"
              >
                <Plus size={14} />
                Create Task
              </button>
            )}
          </div>

          {/* Kanban Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Column: To Do */}
            <div className="bg-slate-100/50 dark:bg-slate-900/20 border border-slate-200/30 dark:border-slate-800/30 rounded-2xl p-4 flex flex-col min-h-[450px]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">To Do</span>
                <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-0.5 rounded-lg">
                  {todoTasks.length}
                </span>
              </div>
              <div className="space-y-4 overflow-y-auto max-h-[500px] flex-grow">
                {todoTasks.map(task => (
                  <TaskCard key={task._id} task={task} onEdit={handleEditTask} />
                ))}
                {todoTasks.length === 0 && (
                  <div className="text-center py-10 text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200/60 dark:border-slate-800/60 rounded-xl">
                    No tasks waiting.
                  </div>
                )}
              </div>
            </div>

            {/* Column: In Progress */}
            <div className="bg-slate-100/50 dark:bg-slate-900/20 border border-slate-200/30 dark:border-slate-800/30 rounded-2xl p-4 flex flex-col min-h-[450px]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">In Progress</span>
                <span className="bg-amber-100 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-0.5 rounded-lg">
                  {inProgressTasks.length}
                </span>
              </div>
              <div className="space-y-4 overflow-y-auto max-h-[500px] flex-grow">
                {inProgressTasks.map(task => (
                  <TaskCard key={task._id} task={task} onEdit={handleEditTask} />
                ))}
                {inProgressTasks.length === 0 && (
                  <div className="text-center py-10 text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200/60 dark:border-slate-800/60 rounded-xl">
                    No active tasks.
                  </div>
                )}
              </div>
            </div>

            {/* Column: Completed */}
            <div className="bg-slate-100/50 dark:bg-slate-900/20 border border-slate-200/30 dark:border-slate-800/30 rounded-2xl p-4 flex flex-col min-h-[450px]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">Completed</span>
                <span className="bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-lg">
                  {doneTasks.length}
                </span>
              </div>
              <div className="space-y-4 overflow-y-auto max-h-[500px] flex-grow">
                {doneTasks.map(task => (
                  <TaskCard key={task._id} task={task} onEdit={handleEditTask} />
                ))}
                {doneTasks.length === 0 && (
                  <div className="text-center py-10 text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200/60 dark:border-slate-800/60 rounded-xl">
                    No completed tasks yet.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Pane: Members Sidebar Drawer (Span 1/4) */}
        <div className="xl:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-indigo-500" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Workspace Members</h3>
            </div>
            {user?.role === 'admin' && (
              <button
                onClick={() => setAddMembersOpen(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                title="Add Members"
              >
                <Plus size={12} />
                Add
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {currentProject.members?.map((member) => (
              <div key={member._id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-xs shrink-0 border border-indigo-500/10">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {member.name}
                  </span>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {member.role}
                  </span>
                </div>
              </div>
            ))}
            {(!currentProject.members || currentProject.members.length === 0) && (
              <div className="text-center py-4 text-xs text-slate-400">
                No contributors added.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Task Creation/Editing Modal (Admin Only) */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        taskToEdit={taskToEdit}
        projectId={id}
      />

      {/* Project Configuration Modal (Admin Only) */}
      {user?.role === 'admin' && (
        <ProjectModal
          isOpen={projectModalOpen}
          onClose={() => setProjectModalOpen(false)}
          projectToEdit={currentProject}
        />
      )}

      {/* Add Members Modal (Admin Only) */}
      <AddMembersModal
        isOpen={addMembersOpen}
        onClose={() => setAddMembersOpen(false)}
        currentMembers={currentProject.members}
        onAdd={handleAddMembers}
      />

    </div>
  );
};

export default ProjectDetails;

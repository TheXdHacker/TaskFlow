import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../store/authStore';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';
import { FolderPlus, Info } from 'lucide-react';

const ProjectList = () => {
  const { user } = useAuthStore();
  const { projects, fetchProjects, loading, error } = useProjectStore();
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch projects list when mounting
  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Title & Actions row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Projects Workspace</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500">Access team workspaces and view task progress boards</p>
        </div>

        {/* Create Project button - Restricted to Admins only */}
        {user?.role === 'admin' && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-md shadow-indigo-600/10 active:scale-[0.98] self-start sm:self-auto"
          >
            <FolderPlus size={16} />
            New Project
          </button>
        )}
      </div>

      {/* Error handling */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Retrieving workspace list...</p>
        </div>
      ) : projects.length > 0 ? (
        /* Projects grid layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <ProjectCard key={proj._id} project={proj} />
          ))}
        </div>
      ) : (
        /* Empty project list view */
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Info size={24} />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">No active projects</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto px-4">
            {user?.role === 'admin' 
              ? "You haven't created any workspaces yet. Click the 'New Project' button above to get started!" 
              : "You haven't been added as a member to any projects yet. Please contact your administrator."
            }
          </p>
        </div>
      )}

      {/* Create Project Modal (Admin Only) */}
      {user?.role === 'admin' && (
        <ProjectModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}

    </div>
  );
};

export default ProjectList;

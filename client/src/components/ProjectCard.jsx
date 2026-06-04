import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Folder, ArrowRight } from 'lucide-react';

const ProjectCard = ({ project }) => {
  // Extract number of team members associated with the project
  const memberCount = project.members?.length || 0;
  
  // Identify the project manager (creator)
  const managerName = project.createdBy?.name || 'Workspace Admin';

  return (
    <div className="glass-card p-6 rounded-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-full">
      <div>
        {/* Project Header Icon & Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Folder size={20} />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-snug line-clamp-1">
            {project.name}
          </h3>
        </div>

        {/* Project Description */}
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-3 h-15">
          {project.description || 'No description provided.'}
        </p>
      </div>

      <div>
        {/* Project Meta Info Pane */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mb-4 text-xs">
          <div>
            <span className="block text-slate-400 uppercase tracking-wider font-semibold text-[9px] mb-0.5">Manager</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{managerName}</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-600 dark:text-slate-400">
            <Users size={12} />
            <span className="font-bold">{memberCount}</span>
          </div>
        </div>

        {/* Access Button */}
        <Link
          to={`/projects/${project._id}`}
          className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-xl text-sm transition-all duration-200"
        >
          Open Workspace
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;

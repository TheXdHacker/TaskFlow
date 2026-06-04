import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, LogOut, X, ShieldAlert, UserCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  const navLinks = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      to: '/projects',
      label: 'Projects',
      icon: <FolderKanban size={18} />,
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop: visible on small screens when sidebar drawer is open */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar navigation drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between w-64 bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header section with brand logo and mobile close trigger */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-black text-white text-base">
                TF
              </div>
              <span className="font-extrabold text-slate-800 dark:text-white text-lg tracking-wider">TaskFlow</span>
            </div>

            {/* Mobile close button */}
            <button
              onClick={toggleSidebar}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links list */}
          <nav className="px-4 py-6 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => {
                  // Auto-close sidebar on mobile after clicking a link
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User profile pane & Logout controls */}
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20">
          <div className="flex items-center gap-3 p-2 mb-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-transparent rounded-xl">
            {/* Initials avatar badge */}
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-500 dark:text-indigo-400 text-sm">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
            </div>

            {/* Username and role labels */}
            <div className="flex-grow min-w-0">
              <span className="block text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.name}</span>
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {user?.role === 'admin' ? (
                  <>
                    <ShieldAlert size={10} className="text-rose-500" />
                    Admin
                  </>
                ) : (
                  <>
                    <UserCheck size={10} className="text-emerald-500" />
                    Member
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50 transition-all duration-200"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

import React, { useEffect, useState } from 'react';
import { Menu, Sun, Moon, Bell, X, Check, AlertTriangle, Info, BellOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuthStore();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Seed initial notification state
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Task Overdue',
      message: 'The task "Write Integration Tests" is overdue.',
      time: '2 hours ago',
      type: 'warning',
      read: false,
    },
    {
      id: 2,
      title: 'New Task Assigned',
      message: 'Workspace Admin assigned you "Setup API Authentication Routing".',
      time: '1 day ago',
      type: 'info',
      read: false,
    },
    {
      id: 3,
      title: 'Project Invitation',
      message: 'You were added to the "Mobile App Redesign" project.',
      time: '2 days ago',
      type: 'success',
      read: true,
    }
  ]);

  // Sync theme changes with the document element class and localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  // Toggle theme action
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const deleteNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
      
      {/* Left side: Hamburger menu for mobile, and greeting title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden transition-colors"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu size={20} />
        </button>
        
        <div>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg md:text-xl">
            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Workspace'}!
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
            Here's what is happening with your workspace today.
          </p>
        </div>
      </div>

      {/* Right side: Notifications trigger and Dark Mode switch */}
      <div className="flex items-center gap-3">
        {/* Notification bell and dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            className={`relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all ${
              showNotifications 
                ? 'bg-slate-100 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Bell size={18} />
            {/* Notification dot indicator */}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full bg-rose-500 border-2 border-white dark:border-slate-900 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {showNotifications && (
            <>
              {/* Backdrop overlay for closing dropdown */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2.5 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden z-50 transition-all duration-300 transform origin-top-right">
                
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Notifications</h4>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button 
                        onClick={clearAll}
                        className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>

                {/* Notification List */}
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        onClick={() => toggleRead(notification.id)}
                        className={`flex gap-3 p-4 text-left transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                          !notification.read ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                        }`}
                      >
                        {/* Icon based on notification type */}
                        <div className="mt-0.5">
                          {notification.type === 'warning' && (
                            <div className="p-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-lg">
                              <AlertTriangle size={14} />
                            </div>
                          )}
                          {notification.type === 'info' && (
                            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 rounded-lg">
                              <Info size={14} />
                            </div>
                          )}
                          {notification.type === 'success' && (
                            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-lg">
                              <Check size={14} />
                            </div>
                          )}
                        </div>

                        {/* Title and Message */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-xs font-semibold text-slate-800 dark:text-slate-200 ${
                              !notification.read ? 'text-indigo-900 dark:text-indigo-300 font-bold' : ''
                            }`}>
                              {notification.title}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              {notification.time}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col items-center justify-between gap-2">
                          <button
                            onClick={(e) => deleteNotification(notification.id, e)}
                            title="Remove"
                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                          {!notification.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full mb-2">
                        <BellOff size={20} />
                      </div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">All caught up!</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">No new notifications.</p>
                    </div>
                  )}
                </div>

              </div>
            </>
          )}
        </div>

        {/* Light/Dark mode switcher */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User avatar indicator (Initials) */}
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-xs border border-indigo-700">
          {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'WA'}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

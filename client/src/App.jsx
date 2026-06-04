import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/ProjectList';
import ProjectDetails from './pages/ProjectDetails';

// Layout Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

/**
 * Route Guard: Redirects unauthorized users trying to access secure pages to the Login screen.
 */
const ProtectedRoute = () => {
  const { token } = useAuthStore();
  
  // If token is missing, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Allow children routing inside nested structure
  return <Outlet />;
};

/**
 * Route Guard: Prevents authenticated users from accessing login or signup views.
 */
const PublicRoute = () => {
  const { token } = useAuthStore();

  // If token exists, direct user to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

/**
 * Layout Wrapper: Encompasses the Sidebar, Navbar, and content container.
 */
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* 1. Collapsible Sidebar Drawer */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* 2. Primary Layout Window */}
      <div className="flex flex-col flex-grow min-w-0">
        
        {/* Dynamic header navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* 3. Scrollable view body panel */}
        <main className="flex-grow overflow-y-auto px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Renders active child page component here */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Public auth routes (restricted if logged in) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Protected workspace routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            
            {/* Direct root path hits to /dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;

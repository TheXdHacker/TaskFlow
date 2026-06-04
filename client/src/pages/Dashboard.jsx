import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { CheckCircle2, Circle, Clock, AlertTriangle, Filter, ListTodo } from 'lucide-react';
import TaskCard from '../components/TaskCard';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { projects, fetchProjects } = useProjectStore();
  const { tasks, fetchTasks } = useTaskStore();
  const [selectedProject, setSelectedProject] = useState('all');

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, []);

  // 1. Filter tasks according to the project filter selection
  const filteredTasks = tasks.filter(task => {
    if (selectedProject === 'all') return true;
    const taskProjId = task.project?._id || task.project;
    return taskProjId === selectedProject;
  });

  // 2. Compute Dashboard Metrics
  const totalTasks = filteredTasks.length;
  const todoTasks = filteredTasks.filter(t => t.status === 'todo').length;
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress').length;
  const doneTasks = filteredTasks.filter(t => t.status === 'done').length;

  // Overdue: status is NOT done and due date is earlier than today (clearing time of day)
  const today = new Date();
  const overdueTasksCount = filteredTasks.filter(t => {
    const isCompleted = t.status === 'done';
    const isPastDue = new Date(t.dueDate).setHours(0,0,0,0) < today.setHours(0,0,0,0);
    return !isCompleted && isPastDue;
  }).length;

  // Tasks assigned to the currently logged-in user
  const myTasks = filteredTasks.filter(t => {
    const assigneeId = t.assignedTo?._id || t.assignedTo;
    return assigneeId === user?._id;
  });

  // 3. Prepare data format for Recharts status pie chart
  const pieData = [
    { name: 'To Do', value: todoTasks, color: '#6366f1' },       // Indigo-500
    { name: 'In Progress', value: inProgressTasks, color: '#f59e0b' }, // Amber-500
    { name: 'Completed', value: doneTasks, color: '#10b981' },   // Emerald-500
  ].filter(item => item.value > 0); // Drop empty values for cleaner charts

  // 4. Prepare data format for project task distribution bar chart
  const barData = projects.map(proj => {
    const projTasks = tasks.filter(t => (t.project?._id || t.project) === proj._id);
    return {
      name: proj.name,
      'To Do': projTasks.filter(t => t.status === 'todo').length,
      'In Progress': projTasks.filter(t => t.status === 'in_progress').length,
      'Completed': projTasks.filter(t => t.status === 'done').length,
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Dashboard Filter Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
          <Filter size={18} className="text-indigo-500" />
          <span>Workspace Analytics Filter</span>
        </div>
        
        <div>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full sm:w-60 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer font-medium"
          >
            <option value="all">All Projects Combined</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Row Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric: Total Tasks */}
        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-indigo-600 flex items-center justify-between">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Tasks</span>
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{totalTasks}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <ListTodo size={22} />
          </div>
        </div>

        {/* Metric: In Progress Tasks */}
        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-amber-500 flex items-center justify-between">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">In Progress</span>
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{inProgressTasks}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock size={22} />
          </div>
        </div>

        {/* Metric: Completed Tasks */}
        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Completed</span>
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{doneTasks}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Metric: Overdue Tasks Warning */}
        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-rose-500 flex items-center justify-between">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Overdue Tasks</span>
            <span className={`text-3xl font-extrabold ${overdueTasksCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-100'}`}>
              {overdueTasksCount}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${overdueTasksCount > 0 ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            <AlertTriangle size={22} />
          </div>
        </div>

      </div>

      {/* Graphical Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts Pie Chart: Task Status Split */}
        <div className="glass-card p-6 rounded-3xl lg:col-span-1 flex flex-col justify-between">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-4">Task Status Distribution</h3>
          
          <div className="h-64 relative flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      background: 'rgba(30, 41, 59, 0.9)', 
                      color: '#fff', 
                      border: 'none', 
                      fontSize: '12px' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-sm text-slate-400">No active tasks to visualize.</div>
            )}
            
            {/* Center Summary Label (doughnut hole content) */}
            {pieData.length > 0 && (
              <div className="absolute flex flex-col items-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</span>
                <span className="text-2xl font-black text-slate-700 dark:text-slate-200">{totalTasks}</span>
              </div>
            )}
          </div>

          {/* Chart Custom Legend */}
          <div className="flex items-center justify-around text-xs mt-4">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-400">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recharts Bar Chart: Projects Task Load */}
        <div className="glass-card p-6 rounded-3xl lg:col-span-2">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-4">Project Load & Progression</h3>
          
          <div className="h-64">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      background: 'rgba(30, 41, 59, 0.9)', 
                      color: '#fff', 
                      border: 'none' 
                    }} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="To Do" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="In Progress" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Completed" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">No project details available.</div>
            )}
          </div>
        </div>

      </div>

      {/* Logged-in User's Tasks Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Tasks Assigned to Me</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Overview of your contributions across projects</p>
          </div>
          
          <span className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 px-3 py-1 rounded-xl text-xs font-bold">
            {myTasks.length} Active Tasks
          </span>
        </div>

        {/* Assigned tasks grid */}
        {myTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myTasks.map(task => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">You are all caught up!</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">No tasks are currently assigned to you.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;

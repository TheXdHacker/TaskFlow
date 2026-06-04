import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import { CheckCircle2, Circle, Clock, AlertTriangle, Filter, ListTodo, FolderKanban, Percent, ClipboardList } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { projects, fetchProjects } = useProjectStore();
  const { tasks, fetchTasks } = useTaskStore();
  const [selectedProject, setSelectedProject] = useState('all');
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setTaskModalOpen(true);
  };

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

      {/* Number-Based Analytics Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panel 1: Task Status Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all duration-300 flex flex-col justify-between lg:col-span-1">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1">Task Status Breakdown</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">Numerical overview of active task states</p>
            
            <div className="space-y-4">
              {/* To Do State */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    To Do
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold">{todoTasks} tasks ({totalTasks > 0 ? Math.round((todoTasks / totalTasks) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${totalTasks > 0 ? (todoTasks / totalTasks) * 100 : 0}%` }} />
                </div>
              </div>

              {/* In Progress State */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    In Progress
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold">{inProgressTasks} tasks ({totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}%` }} />
                </div>
              </div>

              {/* Completed State */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Completed
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold">{doneTasks} tasks ({totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0}%` }} />
                </div>
              </div>

              {/* Overdue State */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Overdue
                  </span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">{overdueTasksCount} tasks ({totalTasks > 0 ? Math.round((overdueTasksCount / totalTasks) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${totalTasks > 0 ? (overdueTasksCount / totalTasks) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 mt-6 pt-4 flex items-center justify-between text-xs text-slate-400">
            <span>Overall completion rate:</span>
            <span className="font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-0.5 font-sans">
              <Percent size={12} />
              {totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Panel 2: Project Task Summary List */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all duration-300 lg:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Project Status Matrix</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Workspace project tasks breakdown & progress metrics</p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5">Project Workspace</th>
                  <th className="py-2.5 text-center">To Do</th>
                  <th className="py-2.5 text-center">In Progress</th>
                  <th className="py-2.5 text-center">Completed</th>
                  <th className="py-2.5 text-center">Total</th>
                  <th className="py-2.5 text-right">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {barData.length > 0 ? (
                  barData.map(proj => {
                    const projTotal = proj['To Do'] + proj['In Progress'] + proj['Completed'];
                    const completionRate = projTotal > 0 ? Math.round((proj['Completed'] / projTotal) * 100) : 0;
                    
                    return (
                      <tr key={proj.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-3 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <div className="p-1 bg-indigo-500/10 text-indigo-500 rounded-lg">
                            <FolderKanban size={14} />
                          </div>
                          <span className="truncate max-w-[150px] md:max-w-[200px]" title={proj.name}>{proj.name}</span>
                        </td>
                        <td className="py-3 text-center font-bold text-indigo-500">{proj['To Do']}</td>
                        <td className="py-3 text-center font-bold text-amber-500">{proj['In Progress']}</td>
                        <td className="py-3 text-center font-bold text-emerald-500">{proj['Completed']}</td>
                        <td className="py-3 text-center font-bold text-slate-500">{projTotal}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${completionRate}%` }} />
                            </div>
                            <span className="font-extrabold text-slate-700 dark:text-slate-300">{completionRate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-slate-400">No projects to display data.</td>
                  </tr>
                )}
              </tbody>
            </table>
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
              <TaskCard key={task._id} task={task} onEdit={handleEditTask} />
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

      {/* Task Modal for Editing */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        taskToEdit={taskToEdit}
        projectId={taskToEdit?.project?._id || taskToEdit?.project}
      />

    </div>
  );
};

export default Dashboard;

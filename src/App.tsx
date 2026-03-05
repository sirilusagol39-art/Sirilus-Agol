import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  BarChart3, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Moon, 
  Sun, 
  Bell,
  ChevronRight,
  Clock,
  BookOpen
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'motion/react';
import { cn, Task, ScheduleItem, DAYS, PRIORITIES, Priority } from './types';

ChartJS.register(ArcElement, Tooltip, Legend);

type View = 'dashboard' | 'tasks' | 'schedule' | 'stats';

export default function App() {
  // State
  const [view, setView] = useState<View>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Form States
  const [newTask, setNewTask] = useState({ title: '', subject: '', deadline: '', priority: 'Medium' as Priority });
  const [newSchedule, setNewSchedule] = useState({ day: 'Senin', subject: '' });

  // Load Data
  useEffect(() => {
    const savedTasks = localStorage.getItem('smartsma_tasks');
    const savedSchedule = localStorage.getItem('smartsma_schedule');
    const savedDarkMode = localStorage.getItem('smartsma_darkmode');

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedSchedule) setSchedule(JSON.parse(savedSchedule));
    if (savedDarkMode) {
      const isDark = JSON.parse(savedDarkMode);
      setDarkMode(isDark);
      if (isDark) document.documentElement.classList.add('dark');
    }

    // Check for today's deadlines
    checkDeadlines(savedTasks ? JSON.parse(savedTasks) : []);
  }, []);

  // Save Data
  useEffect(() => {
    localStorage.setItem('smartsma_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('smartsma_schedule', JSON.stringify(schedule));
  }, [schedule]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('smartsma_darkmode', JSON.stringify(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const checkDeadlines = (taskList: Task[]) => {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = taskList.filter(t => t.deadline === today && !t.completed);
    if (todayTasks.length > 0) {
      setNotifications([`Kamu punya ${todayTasks.length} tugas yang deadline hari ini!`]);
    }
  };

  // Task Actions
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.subject || !newTask.deadline) return;

    const task: Task = {
      id: crypto.randomUUID(),
      ...newTask,
      completed: false,
      createdAt: Date.now()
    };

    setTasks([task, ...tasks]);
    setNewTask({ title: '', subject: '', deadline: '', priority: 'Medium' });
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Schedule Actions
  const addSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedule.subject) return;

    const item: ScheduleItem = {
      id: crypto.randomUUID(),
      ...newSchedule
    };

    setSchedule([...schedule, item]);
    setNewSchedule({ ...newSchedule, subject: '' });
  };

  const deleteSchedule = (id: string) => {
    setSchedule(schedule.filter(s => s.id !== id));
  };

  // Computed
  const todayTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => t.deadline === today);
  }, [tasks]);

  const statsData = {
    labels: ['Selesai', 'Belum Selesai'],
    datasets: [
      {
        data: [
          tasks.filter(t => t.completed).length,
          tasks.filter(t => !t.completed).length,
        ],
        backgroundColor: ['#10b981', '#f43f5e'],
        borderColor: darkMode ? '#0f172a' : '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'High': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'Medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Low': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-2 z-10">
        <div className="flex items-center gap-3 px-2 py-4 mb-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            S
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">SMARTSMA</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">v2.0 Assistant</p>
          </div>
        </div>

        <NavItem 
          active={view === 'dashboard'} 
          onClick={() => setView('dashboard')} 
          icon={<LayoutDashboard size={20} />} 
          label="Dashboard" 
        />
        <NavItem 
          active={view === 'tasks'} 
          onClick={() => setView('tasks')} 
          icon={<CheckSquare size={20} />} 
          label="Tugas" 
        />
        <NavItem 
          active={view === 'schedule'} 
          onClick={() => setView('schedule')} 
          icon={<Calendar size={20} />} 
          label="Jadwal" 
        />
        <NavItem 
          active={view === 'stats'} 
          onClick={() => setView('stats')} 
          icon={<BarChart3 size={20} />} 
          label="Statistik" 
        />

        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-2">
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
          </button>
          <div className="relative">
            <Bell size={20} className="text-slate-400" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <header>
                <h2 className="text-3xl font-bold tracking-tight">Halo, Siswa Hebat! 👋</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Ayo selesaikan tugasmu hari ini.</p>
              </header>

              {notifications.length > 0 && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-4 rounded-2xl flex items-start gap-3">
                  <Bell className="text-indigo-600 dark:text-indigo-400 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">{notifications[0]}</p>
                    <button onClick={() => setView('tasks')} className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1 hover:underline">Lihat Tugas &rarr;</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2">
                      <Clock size={18} className="text-indigo-600" />
                      Deadline Hari Ini
                    </h3>
                    <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                      {todayTasks.length} Tugas
                    </span>
                  </div>
                  <div className="space-y-3">
                    {todayTasks.length > 0 ? (
                      todayTasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <div>
                            <p className="font-semibold text-sm">{task.title}</p>
                            <p className="text-xs text-slate-500">{task.subject}</p>
                          </div>
                          <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", getPriorityColor(task.priority))}>
                            {task.priority}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-4 italic">Tidak ada deadline hari ini. Santai dulu!</p>
                    )}
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2">
                      <BookOpen size={18} className="text-emerald-600" />
                      Jadwal Hari Ini
                    </h3>
                    <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                      {DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {schedule.filter(s => s.day === DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]).length > 0 ? (
                      schedule.filter(s => s.day === DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]).map(item => (
                        <div key={item.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <p className="font-semibold text-sm">{item.subject}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-4 italic">Belum ada jadwal hari ini.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Tugas" value={tasks.length} color="indigo" />
                <StatCard label="Selesai" value={tasks.filter(t => t.completed).length} color="emerald" />
                <StatCard label="Pending" value={tasks.filter(t => !t.completed).length} color="rose" />
                <StatCard label="Jadwal" value={schedule.length} color="amber" />
              </div>
            </motion.div>
          )}

          {view === 'tasks' && (
            <motion.div 
              key="tasks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Daftar Tugas</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Kelola tugas sekolahmu di sini.</p>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Task Form */}
                <div className="lg:col-span-1">
                  <div className="card p-6 sticky top-8">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Plus size={18} className="text-indigo-600" />
                      Tambah Tugas Baru
                    </h3>
                    <form onSubmit={addTask} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Nama Tugas</label>
                        <input 
                          type="text" 
                          placeholder="Contoh: PR Matematika" 
                          className="input-field"
                          value={newTask.title}
                          onChange={e => setNewTask({...newTask, title: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Mata Pelajaran</label>
                        <input 
                          type="text" 
                          placeholder="Contoh: Matematika" 
                          className="input-field"
                          value={newTask.subject}
                          onChange={e => setNewTask({...newTask, subject: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Deadline</label>
                        <input 
                          type="date" 
                          className="input-field"
                          value={newTask.deadline}
                          onChange={e => setNewTask({...newTask, deadline: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Prioritas</label>
                        <select 
                          className="input-field"
                          value={newTask.priority}
                          onChange={e => setNewTask({...newTask, priority: e.target.value as Priority})}
                        >
                          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <button type="submit" className="btn btn-primary w-full mt-2">
                        <Plus size={18} /> Simpan Tugas
                      </button>
                    </form>
                  </div>
                </div>

                {/* Task List */}
                <div className="lg:col-span-2 space-y-4">
                  {tasks.length > 0 ? (
                    tasks.map(task => (
                      <div 
                        key={task.id} 
                        className={cn(
                          "card p-4 flex items-center gap-4 transition-all",
                          task.completed ? "opacity-60 grayscale" : ""
                        )}
                      >
                        <button 
                          onClick={() => toggleTask(task.id)}
                          className={cn(
                            "flex-shrink-0 transition-colors",
                            task.completed ? "text-emerald-500" : "text-slate-300 hover:text-indigo-500"
                          )}
                        >
                          {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <h4 className={cn("font-bold truncate", task.completed ? "line-through" : "")}>{task.title}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <BookOpen size={12} /> {task.subject}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar size={12} /> {task.deadline}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", getPriorityColor(task.priority))}>
                            {task.priority}
                          </span>
                          <button 
                            onClick={() => deleteTask(task.id)}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                      <CheckSquare size={48} className="mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500 font-medium">Belum ada tugas. Tambahkan tugas pertamamu!</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {view === 'schedule' && (
            <motion.div 
              key="schedule"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <header>
                <h2 className="text-3xl font-bold tracking-tight">Jadwal Pelajaran</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Atur jadwal sekolahmu agar tetap teratur.</p>
              </header>

              <div className="card p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Plus size={18} className="text-indigo-600" />
                  Tambah Jadwal
                </h3>
                <form onSubmit={addSchedule} className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Hari</label>
                    <select 
                      className="input-field"
                      value={newSchedule.day}
                      onChange={e => setNewSchedule({...newSchedule, day: e.target.value})}
                    >
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="flex-[2] w-full">
                    <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Mata Pelajaran</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Fisika" 
                      className="input-field"
                      value={newSchedule.subject}
                      onChange={e => setNewSchedule({...newSchedule, subject: e.target.value})}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-full md:w-auto">
                    <Plus size={18} /> Tambah
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DAYS.map(day => {
                  const dayItems = schedule.filter(s => s.day === day);
                  return (
                    <div key={day} className="card flex flex-col">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800">
                        <h4 className="font-bold text-indigo-600 dark:text-indigo-400">{day}</h4>
                      </div>
                      <div className="p-4 flex-1 space-y-2">
                        {dayItems.length > 0 ? (
                          dayItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between group">
                              <span className="text-sm font-medium">{item.subject}</span>
                              <button 
                                onClick={() => deleteSchedule(item.id)}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic py-2">Tidak ada jadwal.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {view === 'stats' && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <header>
                <h2 className="text-3xl font-bold tracking-tight">Statistik Produktivitas</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Lihat perkembangan belajarmu.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                  <div className="card p-6 text-center">
                    <p className="text-xs font-bold uppercase text-slate-400 mb-1">Tingkat Penyelesaian</p>
                    <p className="text-4xl font-bold text-indigo-600">
                      {tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%
                    </p>
                  </div>
                  <div className="card p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Total Tugas</span>
                      <span className="font-bold">{tasks.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-emerald-500">Selesai</span>
                      <span className="font-bold">{tasks.filter(t => t.completed).length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-rose-500">Belum Selesai</span>
                      <span className="font-bold">{tasks.filter(t => !t.completed).length}</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 card p-8 flex flex-col items-center justify-center min-h-[400px]">
                  <h3 className="font-bold mb-8">Grafik Tugas</h3>
                  {tasks.length > 0 ? (
                    <div className="w-full max-w-[300px]">
                      <Doughnut 
                        data={statsData} 
                        options={{
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                color: darkMode ? '#94a3b8' : '#475569',
                                font: { family: 'Inter', weight: 'bold' }
                              }
                            }
                          },
                          cutout: '70%'
                        }} 
                      />
                    </div>
                  ) : (
                    <div className="text-center text-slate-400">
                      <BarChart3 size={48} className="mx-auto mb-4 opacity-20" />
                      <p>Belum ada data untuk ditampilkan.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
        active 
          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400" 
          : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
      )}
    >
      {icon}
      <span>{label}</span>
      {active && <ChevronRight size={16} className="ml-auto" />}
    </button>
  );
}

function StatCard({ label, value, color }: { label: string, value: number, color: 'indigo' | 'emerald' | 'rose' | 'amber' }) {
  const colors = {
    indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/10',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10',
    rose: 'text-rose-600 bg-rose-50 dark:bg-rose-900/10',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/10',
  };

  return (
    <div className="card p-4 flex flex-col items-center justify-center text-center">
      <span className="text-[10px] font-bold uppercase text-slate-400 mb-1">{label}</span>
      <span className={cn("text-2xl font-bold px-3 py-1 rounded-lg", colors[color])}>{value}</span>
    </div>
  );
}

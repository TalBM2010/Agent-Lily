"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserCheck, BookOpen, Star, Flame, Activity,
  Download, Search, ChevronLeft, ChevronRight, RefreshCw,
  TrendingUp, Calendar, AlertCircle, Check, X, Crown
} from "lucide-react";

interface OverviewStats {
  totalUsers: number;
  totalChildren: number;
  totalLessons: number;
  completedLessons: number;
  activeUsersToday: number;
  activeUsersWeek: number;
  totalStars: number;
  totalWordsLearned: number;
}

interface RecentUser {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  childrenCount: number;
}

interface TopChild {
  id: string;
  name: string;
  avatar: string;
  stars: number;
  totalLessons: number;
  currentStreak: number;
  user: { email: string };
}

interface ChartData {
  date: string;
  lessons: number;
  stars: number;
  activeUsers: number;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  children: {
    id: string;
    name: string;
    avatar: string;
    stars: number;
    currentStreak: number;
    totalLessons: number;
    gamificationLevel: number;
  }[];
}

type Tab = "overview" | "users" | "leaderboard";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stats data
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [topChildren, setTopChildren] = useState<TopChild[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  
  // Users data
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [usersPage, setUsersPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab, usersPage, userSearch]);

  async function fetchStats() {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/admin/stats");
      
      if (res.status === 403) {
        setError("אין לך הרשאות מנהל");
        return;
      }
      
      if (!res.ok) {
        throw new Error("Failed to fetch stats");
      }
      
      const data = await res.json();
      setOverview(data.overview);
      setRecentUsers(data.recentUsers);
      setTopChildren(data.topChildren);
      setChartData(data.engagementChart);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("שגיאה בטעינת הנתונים");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      const params = new URLSearchParams({
        page: usersPage.toString(),
        limit: "20",
        search: userSearch,
      });
      
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      
      const data = await res.json();
      setUsers(data.users);
      setTotalUsers(data.pagination.total);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }

  async function handleExport(type: "users" | "activity") {
    try {
      const res = await fetch(`/api/admin/export?type=${type}`);
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            ⚙️
          </motion.div>
          <p className="text-purple-600">טוען לוח בקרה...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <motion.div
          className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-xl font-bold text-gray-800 mb-2">{error}</h1>
          <p className="text-gray-500 mb-4">נדרשת הרשאת מנהל לצפייה בדף זה</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-purple-500 text-white rounded-xl font-medium"
          >
            חזרה לדף הבית
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200" dir="rtl">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔮</span>
            <div>
              <h1 className="text-xl font-bold text-gray-800">לוח בקרה - ניהול</h1>
              <p className="text-sm text-gray-500">Agent Lily Admin</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchStats()}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="רענון"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors"
            >
              חזרה לאפליקציה
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1 pb-2">
          {[
            { id: "overview" as Tab, label: "סקירה", icon: Activity },
            { id: "users" as Tab, label: "משתמשים", icon: Users },
            { id: "leaderboard" as Tab, label: "טבלת מובילים", icon: Crown },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                ${activeTab === tab.id 
                  ? "bg-purple-100 text-purple-700" 
                  : "text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === "overview" && overview && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "משתמשים", value: overview.totalUsers, icon: Users, color: "blue" },
                { label: "ילדים", value: overview.totalChildren, icon: UserCheck, color: "green" },
                { label: "שיעורים", value: overview.completedLessons, icon: BookOpen, color: "purple" },
                { label: "כוכבים", value: overview.totalStars.toLocaleString(), icon: Star, color: "yellow" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="bg-white rounded-2xl p-4 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Activity Stats */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-lg">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  פעילות
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                    <span className="text-gray-600">פעילים היום</span>
                    <span className="font-bold text-green-700">{overview.activeUsersToday}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                    <span className="text-gray-600">פעילים השבוע</span>
                    <span className="font-bold text-blue-700">{overview.activeUsersWeek}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                    <span className="text-gray-600">מילים נלמדו</span>
                    <span className="font-bold text-purple-700">{overview.totalWordsLearned}</span>
                  </div>
                </div>
              </div>

              {/* Engagement Chart (simple bar visualization) */}
              <div className="bg-white rounded-2xl p-5 shadow-lg">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  פעילות ב-7 ימים אחרונים
                </h3>
                <div className="flex items-end justify-between gap-1 h-32">
                  {chartData.slice(-7).map((day, i) => {
                    const maxLessons = Math.max(...chartData.slice(-7).map(d => d.lessons), 1);
                    const height = (day.lessons / maxLessons) * 100;
                    
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center">
                        <motion.div
                          className="w-full bg-gradient-to-t from-purple-500 to-pink-400 rounded-t-lg"
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(height, 5)}%` }}
                          transition={{ delay: i * 0.1 }}
                        />
                        <span className="text-xs text-gray-400 mt-1">
                          {new Date(day.date).getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-center text-gray-400 mt-2">שיעורים ליום</p>
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  משתמשים אחרונים
                </h3>
                <button
                  onClick={() => handleExport("users")}
                  className="flex items-center gap-1 text-sm text-purple-600 hover:bg-purple-50 px-3 py-1 rounded-lg"
                >
                  <Download className="w-4 h-4" />
                  ייצוא
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-right text-sm text-gray-500 border-b">
                      <th className="pb-2 font-medium">משתמש</th>
                      <th className="pb-2 font-medium">ילדים</th>
                      <th className="pb-2 font-medium">הצטרף</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3">
                          <p className="font-medium text-gray-800">{user.name || "ללא שם"}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </td>
                        <td className="py-3 text-gray-600">{user.childrenCount}</td>
                        <td className="py-3 text-gray-500 text-sm">
                          {new Date(user.createdAt).toLocaleDateString("he-IL")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Search and Export */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="חיפוש לפי שם או אימייל..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUsersPage(1);
                  }}
                  className="w-full pr-10 pl-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-purple-400 focus:outline-none"
                />
              </div>
              <button
                onClick={() => handleExport("users")}
                className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50"
              >
                <Download className="w-5 h-5" />
                ייצוא CSV
              </button>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-right text-sm text-gray-600">
                    <th className="px-4 py-3 font-medium">משתמש</th>
                    <th className="px-4 py-3 font-medium">תפקיד</th>
                    <th className="px-4 py-3 font-medium">ילדים</th>
                    <th className="px-4 py-3 font-medium">כוכבים</th>
                    <th className="px-4 py-3 font-medium">הצטרף</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{user.name || "ללא שם"}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === "ADMIN" 
                            ? "bg-purple-100 text-purple-700" 
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {user.role === "ADMIN" ? "מנהל" : "משתמש"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{user.children.length}</td>
                      <td className="px-4 py-3">
                        {user.children.reduce((sum, c) => sum + c.stars, 0)} ⭐
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString("he-IL")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                <span className="text-sm text-gray-500">
                  {totalUsers} משתמשים סה"כ
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                    disabled={usersPage === 1}
                    className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-600">עמוד {usersPage}</span>
                  <button
                    onClick={() => setUsersPage(p => p + 1)}
                    disabled={users.length < 20}
                    className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                <Crown className="w-6 h-6 text-yellow-500" />
                טבלת מובילים - הכוכבים המובילים
              </h3>

              <div className="space-y-3">
                {topChildren.map((child, index) => (
                  <motion.div
                    key={child.id}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl
                      ${index === 0 ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300" :
                        index === 1 ? "bg-gradient-to-r from-gray-50 to-slate-100 border border-gray-300" :
                        index === 2 ? "bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-300" :
                        "bg-gray-50"
                      }
                    `}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Rank */}
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                      ${index === 0 ? "bg-yellow-400 text-yellow-900" :
                        index === 1 ? "bg-gray-400 text-white" :
                        index === 2 ? "bg-orange-400 text-white" :
                        "bg-gray-200 text-gray-600"
                      }
                    `}>
                      {index + 1}
                    </div>

                    {/* Avatar and name */}
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-3xl">{child.avatar}</span>
                      <div>
                        <p className="font-bold text-gray-800">{child.name}</p>
                        <p className="text-xs text-gray-500">{child.user.email}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-yellow-600">{child.stars}</p>
                        <p className="text-gray-400">⭐</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-purple-600">{child.totalLessons}</p>
                        <p className="text-gray-400">📚</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-orange-600">{child.currentStreak}</p>
                        <p className="text-gray-400">🔥</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSelectedUser(null)}
            />
            <motion.div
              className="relative bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-gray-800 mb-4">
                פרטי משתמש
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">שם</label>
                  <p className="font-medium">{selectedUser.name || "ללא שם"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">אימייל</label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">תפקיד</label>
                  <p className="font-medium">{selectedUser.role === "ADMIN" ? "מנהל" : "משתמש"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">הצטרף</label>
                  <p className="font-medium">
                    {new Date(selectedUser.createdAt).toLocaleDateString("he-IL")}
                  </p>
                </div>

                {selectedUser.children.length > 0 && (
                  <div>
                    <label className="text-sm text-gray-500 mb-2 block">ילדים</label>
                    <div className="space-y-2">
                      {selectedUser.children.map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                        >
                          <span className="text-2xl">{child.avatar}</span>
                          <div className="flex-1">
                            <p className="font-medium">{child.name}</p>
                            <p className="text-xs text-gray-500">
                              רמה {child.gamificationLevel} • {child.totalLessons} שיעורים
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-yellow-600">{child.stars} ⭐</p>
                            <p className="text-xs text-gray-500">🔥 {child.currentStreak}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import { Users, Ticket, Bus, TrendingUp, IndianRupee, ArrowUpRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

const StatCard = ({ icon: Icon, label, value, color, gradient, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: delay || 0 }}
        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group"
    >
        <div className="flex items-start justify-between">
            <div className="space-y-3">
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
                <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            </div>
            <div className={`p-2.5 rounded-xl ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={18} className="text-white" />
            </div>
        </div>
        <div className="mt-3 flex items-center text-xs text-emerald-600 font-medium">
            <ArrowUpRight size={13} className="mr-0.5" />
            <span>Active</span>
        </div>
    </motion.div>
);

const SkeletonCard = () => (
    <div className="bg-white p-5 rounded-2xl border border-slate-100">
        <div className="flex justify-between">
            <div className="space-y-3">
                <div className="skeleton h-3 w-20"></div>
                <div className="skeleton h-7 w-16"></div>
            </div>
            <div className="skeleton h-10 w-10 rounded-xl"></div>
        </div>
        <div className="skeleton h-3 w-12 mt-3"></div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/reports/dashboard');
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const defaultChartData = [
        { name: 'Mon', revenue: 0 },
        { name: 'Tue', revenue: 0 },
        { name: 'Wed', revenue: 0 },
        { name: 'Thu', revenue: 0 },
        { name: 'Fri', revenue: 0 },
        { name: 'Sat', revenue: 0 },
        { name: 'Sun', revenue: 0 },
    ];

    const chartData = stats?.revenueByDay?.length > 0 ? stats.revenueByDay : defaultChartData;

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
                <div>
                    <h2 className="text-xl font-bold text-slate-900">
                        {getGreeting()}, <span className="text-primary-600">{user?.name?.split(' ')[0] || 'Admin'}</span> 👋
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">Here's what's happening with your fleet today.</p>
                </div>
                <div className="flex space-x-2">
                    <select className="bg-white border border-slate-200 text-xs font-medium rounded-lg px-3 py-2 text-slate-600 focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all">
                        <option>Today</option>
                        <option>This Week</option>
                        <option>This Month</option>
                    </select>
                </div>
            </motion.div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : (
                    <>
                        <StatCard
                            icon={Ticket}
                            label="Total Bookings"
                            value={stats?.totalBookings || 0}
                            gradient="bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30"
                            delay={0.05}
                        />
                        <StatCard
                            icon={Ticket}
                            label="Total Tickets"
                            value={stats?.totalTickets || 0}
                            gradient="bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-500/30"
                            delay={0.1}
                        />
                        <StatCard
                            icon={IndianRupee}
                            label="Total Revenue"
                            value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
                            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30"
                            delay={0.15}
                        />
                        <StatCard
                            icon={Bus}
                            label="Total Buses"
                            value={stats?.totalBuses || 0}
                            gradient="bg-gradient-to-br from-primary-500 to-primary-600 shadow-primary-500/30"
                            delay={0.2}
                        />
                    </>
                )}
            </div>

            {/* Charts & Recent */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Revenue Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-slate-900 text-sm">Revenue Trend</h3>
                        <span className="text-xs text-slate-400 font-medium">This Week</span>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.12} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                                <RechartsTooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                                        fontSize: '13px',
                                        padding: '10px 14px'
                                    }}
                                    formatter={(value) => [`₹${value}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Recent Bookings */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 text-sm">Recent Bookings</h3>
                        <Clock size={14} className="text-slate-400" />
                    </div>
                    <div className="space-y-3">
                        {stats?.recentBookings?.length > 0 ? (
                            stats.recentBookings.map((booking, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.35 + i * 0.05 }}
                                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3 min-w-0">
                                        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-slate-500 shadow-sm text-xs font-bold shrink-0">
                                            {booking.passengerName.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate">{booking.passengerName}</p>
                                            <p className="text-[11px] text-slate-400">{new Date(booking.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-emerald-600 shrink-0 ml-2">
                                        ₹{booking.totalAmount}
                                    </span>
                                </motion.div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Ticket size={28} className="text-slate-200 mb-2" />
                                <p className="text-sm text-slate-400">No recent bookings</p>
                                <p className="text-xs text-slate-300 mt-0.5">Bookings will appear here</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;

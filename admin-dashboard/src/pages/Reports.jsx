import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { IndianRupee, Ticket, Users, TrendingUp, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Reports = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/reports/dashboard');
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch reports", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const defaultRevenueData = [
        { name: 'Mon', revenue: 0 },
        { name: 'Tue', revenue: 0 },
        { name: 'Wed', revenue: 0 },
        { name: 'Thu', revenue: 0 },
        { name: 'Fri', revenue: 0 },
        { name: 'Sat', revenue: 0 },
        { name: 'Sun', revenue: 0 },
    ];
    
    const revenueData = stats?.revenueByDay?.length > 0 ? stats.revenueByDay : defaultRevenueData;

    const categoryData = [
        { name: 'Sleeper', value: 400 },
        { name: 'Seater', value: 300 },
        { name: 'Semi-Sleeper', value: 200 },
        { name: 'AC', value: 278 },
    ];

    const COLORS = ['#10b981', '#3b82f6', '#f97316', '#8b5cf6'];

    const statCards = [
        { title: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee, gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30', trend: 12.5 },
        { title: 'Total Bookings', value: stats?.totalBookings || 0, icon: Ticket, gradient: 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30', trend: 8.2 },
        { title: 'Total Tickets', value: stats?.totalTickets || 0, icon: Users, gradient: 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/30', trend: 5.1 },
        { title: 'Total Buses', value: stats?.totalBuses || 0, icon: TrendingUp, gradient: 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-primary-500/30', trend: 2.4 },
    ];

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-xl font-bold text-slate-900">Analytics & Reports</h2>
                <p className="text-sm text-slate-500 mt-0.5">Overview of your fleet performance and metrics.</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="flex justify-between items-start">
                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
                                <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
                            </div>
                            <div className={`p-2.5 rounded-xl ${card.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                                <card.icon size={18} className="text-white" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-center text-xs">
                            <span className="text-emerald-600 font-semibold flex items-center">
                                <ArrowUpRight size={13} className="mr-0.5" />
                                {card.trend}%
                            </span>
                            <span className="text-slate-400 ml-1.5">vs last month</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Revenue Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-bold text-slate-900">Revenue Overview</h3>
                        <span className="text-xs text-slate-400 font-medium">This Week</span>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="reportsRevGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.12} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '13px', padding: '10px 14px' }}
                                    formatter={(value) => [`₹${value}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#reportsRevGrad)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Booking Categories Pie */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-bold text-slate-900">Bookings by Bus Type</h3>
                    </div>
                    <div className="h-72 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '13px', padding: '10px 14px' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    iconSize={8}
                                    formatter={(value) => <span className="text-xs text-slate-600 font-medium ml-1">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Reports;

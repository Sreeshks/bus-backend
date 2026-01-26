import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { DollarSign, Ticket, Users, TrendingUp } from 'lucide-react';

const Reports = () => {
    const [stats, setStats] = useState({
        totalRevenue: 125000,
        totalBookings: 856,
        activeUsers: 2340,
        occupancyRate: 78
    });

    // Mock data for charts - in a real app, fetch this from backend
    const revenueData = [
        { name: 'Mon', revenue: 4000 },
        { name: 'Tue', revenue: 3000 },
        { name: 'Wed', revenue: 5000 },
        { name: 'Thu', revenue: 2780 },
        { name: 'Fri', revenue: 6890 },
        { name: 'Sat', revenue: 8390 },
        { name: 'Sun', revenue: 7490 },
    ];

    const categoryData = [
        { name: 'Sleeper', value: 400 },
        { name: 'Seater', value: 300 },
        { name: 'Semi-Sleeper', value: 200 },
        { name: 'AC', value: 278 },
    ];

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

    const StatCard = ({ title, value, icon: Icon, color, trend }) => (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-2">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
                <span className="text-emerald-500 font-medium flex items-center">
                    <TrendingUp size={14} className="mr-1" /> {trend}%
                </span>
                <span className="text-slate-400 ml-2">vs last month</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Analytics & Reports</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-emerald-500"
                    trend={12.5}
                />
                <StatCard
                    title="Total Bookings"
                    value={stats.totalBookings}
                    icon={Ticket}
                    color="bg-blue-500"
                    trend={8.2}
                />
                <StatCard
                    title="Active Users"
                    value={stats.activeUsers}
                    icon={Users}
                    color="bg-purple-500"
                    trend={5.1}
                />
                <StatCard
                    title="Avg. Occupancy"
                    value={`${stats.occupancyRate}%`}
                    icon={TrendingUp}
                    color="bg-orange-500"
                    trend={2.4}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue Overview</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Booking Categories */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Bookings by Bus Type</h3>
                    <div className="h-80 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;

import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, User, Shield, Key, Edit2, Mail, X, Bus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'Conductor', permissions: [], assignedBus: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const roles = ['Admin', 'Manager', 'Conductor', 'Employee'];

    const roleColors = {
        'Admin': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', avatar: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/20' },
        'Manager': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', avatar: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
        'Conductor': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', avatar: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
        'Employee': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', avatar: 'from-slate-400 to-slate-500', shadow: 'shadow-slate-400/20' },
    };

    const getPermissionsForRole = (role) => {
        switch (role) {
            case 'Admin': return ['manage_users', 'manage_buses', 'manage_trips', 'manage_locations', 'issue_tickets', 'view_reports'];
            case 'Manager': return ['manage_buses', 'manage_trips', 'manage_locations', 'view_reports'];
            case 'Conductor': return ['issue_tickets'];
            default: return [];
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/auth/users');
            setUsers(data);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const fetchBuses = async () => {
        try {
            const { data } = await api.get('/buses');
            setBuses(data);
        } catch (error) {
            console.error('Failed to load buses:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchBuses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                permissions: getPermissionsForRole(formData.role),
                assignedBus: formData.assignedBus || null,
            };

            if (isEditing) {
                if (!payload.password) delete payload.password;
                await api.put(`/auth/users/${editId}`, payload);
                toast.success('User updated successfully');
            } else {
                await api.post('/auth/users', payload);
                toast.success('User created successfully');
            }
            setShowModal(false);
            fetchUsers();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (user) => {
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            permissions: user.permissions,
            assignedBus: user.assignedBus?._id || ''
        });
        setEditId(user._id);
        setIsEditing(true);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', password: '', role: 'Conductor', permissions: [], assignedBus: '' });
        setIsEditing(false);
        setEditId(null);
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">User Management</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Manage team members, permissions & bus assignments</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 text-sm font-medium"
                >
                    <Plus size={16} />
                    <span>Create User</span>
                </button>
            </motion.div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="skeleton h-11 w-11 rounded-xl"></div>
                                <div className="space-y-2 flex-1">
                                    <div className="skeleton h-4 w-28"></div>
                                    <div className="skeleton h-3 w-36"></div>
                                </div>
                            </div>
                            <div className="skeleton h-6 w-20 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            ) : users.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl border border-slate-100 p-12 text-center"
                >
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                        <User size={28} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No team members</h3>
                    <p className="text-sm text-slate-500 mb-4">Create your first user to get started</p>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                    >
                        Create First User
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map((user, i) => {
                        const colors = roleColors[user.role] || roleColors['Employee'];
                        return (
                            <motion.div
                                key={user._id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group"
                            >
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors.avatar} ${colors.shadow} shadow-lg flex items-center justify-center text-white text-sm font-bold`}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-sm text-slate-900 truncate">{user.name}</h3>
                                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>
                                        {user.role}
                                    </span>
                                    {user.isAdmin && (
                                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-50 text-red-700 border border-red-100">
                                            Super Admin
                                        </span>
                                    )}
                                </div>

                                {/* Assigned Bus Badge */}
                                <div className="mb-4">
                                    {user.assignedBus ? (
                                        <div className="flex items-center space-x-2 px-2.5 py-1.5 bg-amber-50 border border-amber-100 rounded-lg">
                                            <Bus size={13} className="text-amber-600 flex-shrink-0" />
                                            <span className="text-[11px] font-semibold text-amber-700 truncate">
                                                {user.assignedBus.name} ({user.assignedBus.busNumber})
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2 px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                                            <Bus size={13} className="text-slate-300 flex-shrink-0" />
                                            <span className="text-[11px] text-slate-400 italic">No bus assigned</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-slate-50">
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition-colors text-xs font-medium flex items-center space-x-1.5 w-full justify-center"
                                    >
                                        <Edit2 size={13} />
                                        <span>Edit Details</span>
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-5 flex justify-between items-center">
                                <div>
                                    <h3 className="text-base font-bold text-white">{isEditing ? 'Edit User' : 'Create New User'}</h3>
                                    <p className="text-xs text-white/70 mt-0.5">{isEditing ? 'Update user details & bus assignment' : 'Add a new team member with bus assignment'}</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                                    <div className="relative">
                                        <User size={15} className="absolute left-3.5 top-3 text-slate-400" />
                                        <input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                                    <div className="relative">
                                        <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                            placeholder="john@yatra.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        {isEditing ? 'New Password (leave blank to keep)' : 'Password'}
                                    </label>
                                    <div className="relative">
                                        <Key size={15} className="absolute left-3.5 top-3 text-slate-400" />
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                            placeholder="••••••••"
                                            required={!isEditing}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                                    <div className="relative">
                                        <Shield size={15} className="absolute left-3.5 top-3 text-slate-400" />
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm bg-white appearance-none"
                                        >
                                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1.5">
                                        Role <b className="text-slate-500">{formData.role}</b> grants relevant permissions automatically.
                                    </p>
                                </div>

                                {/* Assigned Bus Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Assigned Bus</label>
                                    <div className="relative">
                                        <Bus size={15} className="absolute left-3.5 top-3 text-slate-400" />
                                        <select
                                            value={formData.assignedBus}
                                            onChange={(e) => setFormData({ ...formData, assignedBus: e.target.value })}
                                            className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm bg-white appearance-none"
                                        >
                                            <option value="">— No Bus Assigned —</option>
                                            {buses.map(bus => (
                                                <option key={bus._id} value={bus._id}>
                                                    {bus.name} ({bus.busNumber})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1.5">
                                        The bus this user will operate in the mobile terminal app.
                                    </p>
                                </div>

                                <div className="pt-3 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg shadow-primary-500/25 text-sm font-medium"
                                    >
                                        {isEditing ? 'Update User' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Users;

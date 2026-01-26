import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, User, Shield, Key, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'Conductor', permissions: []
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const roles = ['Admin', 'Manager', 'Conductor', 'Employee'];

    // Auto-assign permissions based on role for simplicity
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
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                permissions: getPermissionsForRole(formData.role)
            };

            if (isEditing) {
                // For edit, we might not send password unless changed, but backend handles it gracefully
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
            password: '', // Don't show old password
            role: user.role,
            permissions: user.permissions
        });
        setEditId(user._id);
        setIsEditing(true);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', password: '', role: 'Conductor', permissions: [] });
        setIsEditing(false);
        setEditId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors shadow-lg shadow-primary-500/30"
                >
                    <Plus size={18} />
                    <span>Create User</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(user => (
                    <motion.div
                        key={user._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                        <div className="flex items-center space-x-4 mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${user.role === 'Admin' ? 'bg-purple-100 text-purple-600' :
                                user.role === 'Conductor' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                                }`}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{user.name}</h3>
                                <p className="text-sm text-slate-500">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${user.role === 'Admin' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-700'
                                }`}>
                                {user.role}
                            </span>
                            {user.isAdmin && <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700">Super Admin</span>}
                        </div>

                        <div className="pt-4 border-t border-slate-50 flex justify-end">
                            <button onClick={() => handleEdit(user)} className="text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition-colors text-sm font-medium flex items-center space-x-1">
                                <Edit2 size={16} />
                                <span>Edit Details</span>
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900">{isEditing ? 'Edit User' : 'Create New User'}</h3>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-3 top-2.5 text-slate-400" />
                                        <input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-3 top-2.5 text-slate-400" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                            placeholder="john@yatra.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        {isEditing ? 'New Password (leave blank to keep)' : 'Password'}
                                    </label>
                                    <div className="relative">
                                        <Key size={18} className="absolute left-3 top-2.5 text-slate-400" />
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                            placeholder="••••••••"
                                            required={!isEditing}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                    <div className="relative">
                                        <Shield size={18} className="absolute left-3 top-2.5 text-slate-400" />
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none appearance-none bg-white"
                                        >
                                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Assigning role <b>{formData.role}</b> will automatically grant relevant permissions.
                                    </p>
                                </div>

                                <div className="pt-4 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30"
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

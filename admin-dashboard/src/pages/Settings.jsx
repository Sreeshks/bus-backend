import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User, Mail, Lock, Shield, Settings as SettingsIcon, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Settings = () => {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, name: user.name, email: user.email }));
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return toast.error('Passwords do not match');
        }

        setLoading(true);
        try {
            const updateData = {
                name: formData.name,
                email: formData.email
            };
            if (formData.password) {
                updateData.password = formData.password;
            }

            const { data } = await api.put('/auth/profile', updateData);

            // Update auth context by calling login with new user data (which contains a new token)
            login(data);

            toast.success('Profile updated successfully');
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-xl font-bold text-slate-900">Settings & Profile</h2>
                <p className="text-sm text-slate-500 mt-0.5">Manage your account preferences and security</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-0 animate-[fadeInUp_0.4s_ease-out_forwards]">
                {/* Left Panel: Profile Info */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary-500/30 mb-4">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
                        <p className="text-sm text-slate-500 mb-4">{user?.email}</p>
                        <span className="px-3 py-1 bg-primary-50 text-primary-700 font-semibold text-xs rounded-full">
                            Role: {user?.role || 'Admin'}
                        </span>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Shield size={16} className="text-primary-500" />
                            Active Permissions
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {user?.permissions?.map(p => (
                                <span key={p} className="px-2.5 py-1 text-[11px] font-medium bg-slate-50 border border-slate-200 text-slate-600 rounded-md">
                                    {p.replace('_', ' ')}
                                </span>
                            ))}
                            {(!user?.permissions || user?.permissions?.length === 0) && (
                                <span className="text-sm text-slate-400">All administrative rights</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Edit Form */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex items-center gap-3">
                            <SettingsIcon size={20} className="text-slate-400" />
                            <h3 className="text-base font-bold text-slate-900">Edit Profile</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                                        <User size={14} className="text-slate-400" /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                                        <Mail size={14} className="text-slate-400" /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-5 mt-2">
                                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Lock size={16} className="text-slate-400" /> Change Password
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                            placeholder="Leave blank to keep current"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    Note: You will be logged out and logged back in transparently if you change your password.
                                </p>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;

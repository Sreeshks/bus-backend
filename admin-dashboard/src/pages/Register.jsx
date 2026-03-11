import { useState, useContext } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Bus, Loader2, ArrowRight, UserPlus, Shield, MapPin, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', { name, email, password });
            toast.success('Registration successful! Logging in...');

            const loginResult = await login(email, password);
            if (loginResult.success) {
                navigate('/');
            } else {
                navigate('/login');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Brand Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-emerald-400 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-64 h-64 border border-white/30 rounded-full"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 border border-white/20 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/3 w-48 h-48 border border-white/25 rounded-full"></div>
                </div>

                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Bus size={22} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Ente Yatra</h1>
                            <p className="text-xs text-white/70">Fleet Management</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h2 className="text-4xl font-bold text-white leading-tight">
                                Start your<br />
                                journey with<br />
                                <span className="text-emerald-200">Ente Yatra.</span>
                            </h2>
                            <p className="mt-4 text-white/70 text-lg max-w-md">
                                Join the platform trusted by transport operators to manage their fleet, routes, and ticketing efficiently.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {[
                                { icon: Bus, label: 'Fleet Management' },
                                { icon: Ticket, label: 'Smart Ticketing' },
                                { icon: MapPin, label: 'Route Planning' },
                                { icon: Shield, label: 'Secure System' },
                            ].map((feature, i) => (
                                <motion.div
                                    key={feature.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10"
                                >
                                    <feature.icon size={14} className="text-white/80" />
                                    <span className="text-sm text-white/90 font-medium">{feature.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <p className="text-white/40 text-sm">© 2026 Ente Yatra. All rights reserved.</p>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-sm"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                            <Bus size={22} className="text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900">Ente Yatra</h1>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                                <UserPlus size={16} className="text-primary-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
                        <p className="text-slate-500 mt-1.5 text-sm">Join Ente Yatra fleet management platform</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                placeholder="admin@yatra.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 flex items-center justify-center space-x-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-6"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>

                        <div className="text-center">
                            <span className="text-sm text-slate-500">Already have an account? </span>
                            <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700 font-semibold">
                                Sign In
                            </Link>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;

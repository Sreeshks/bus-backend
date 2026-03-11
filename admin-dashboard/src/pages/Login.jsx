import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Bus, Loader2, ArrowRight, Shield, MapPin, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            toast.success('Welcome back!');
            navigate('/');
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Brand Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-emerald-400 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-64 h-64 border border-white/30 rounded-full"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 border border-white/20 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/3 w-48 h-48 border border-white/25 rounded-full"></div>
                </div>

                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Bus size={22} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Ente Yatra</h1>
                            <p className="text-xs text-white/70">Fleet Management</p>
                        </div>
                    </div>

                    {/* Hero Content */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-4xl font-bold text-white leading-tight">
                                Manage your<br />
                                entire fleet in<br />
                                <span className="text-emerald-200">one place.</span>
                            </h2>
                            <p className="mt-4 text-white/70 text-lg max-w-md">
                                Real-time tracking, ticketing, route management, and comprehensive analytics — all from a single dashboard.
                            </p>
                        </div>

                        {/* Feature Pills */}
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

                    {/* Footer */}
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
                        <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
                        <p className="text-slate-500 mt-1.5 text-sm">Sign in to your admin account to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
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

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center space-x-2 text-slate-500 cursor-pointer">
                                <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 w-4 h-4" />
                                <span>Remember me</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 flex items-center justify-center space-x-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>

                        <div className="text-center">
                            <span className="text-sm text-slate-500">Don't have an account? </span>
                            <Link to="/register" className="text-sm text-primary-600 hover:text-primary-700 font-semibold">
                                Create Account
                            </Link>
                        </div>
                    </form>

                    <p className="text-center text-xs text-slate-400 mt-8">Protected by Ente Yatra Secure System</p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;

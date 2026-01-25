import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bus, Map, Ticket, Users, LogOut, Menu, X, FileText } from 'lucide-react';
import { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarItem = ({ icon: Icon, label, path, active, onClick }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={clsx(
                "flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200",
                active
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30 font-medium"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
        >
            <Icon size={20} className={active ? "text-white" : "text-slate-400"} />
            <span>{label}</span>
            {active && (
                <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-0 w-1 h-8 bg-white rounded-l-full opacity-20"
                />
            )}
        </motion.div>
    );
};

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useContext(AuthContext);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Bus, label: 'Buses', path: '/buses' },
        { icon: Map, label: 'Trips & Routes', path: '/trips' },
        { icon: Ticket, label: 'Tickets', path: '/tickets' },
        { icon: Users, label: 'Users', path: '/users', adminOnly: true },
        { icon: Map, label: 'Master Data', path: '/master', adminOnly: true }, // Reusing Map icon for Towns/Fares for now
        { icon: FileText, label: 'Reports', path: '/reports' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const filteredMenu = menuItems.filter(item => !item.adminOnly || (user?.isAdmin || user?.role === 'Admin'));

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={clsx(
                    "fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center transform rotate-12">
                            <Bus className="text-white" size={20} />
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
                            Yatra<span className="text-slate-800">Admin</span>
                        </h1>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {filteredMenu.map((item) => (
                        <SidebarItem
                            key={item.path}
                            icon={item.icon}
                            label={item.label}
                            path={item.path}
                            active={location.pathname === item.path}
                            onClick={() => {
                                navigate(item.path);
                                setIsMobileMenuOpen(false);
                            }}
                        />
                    ))}
                </div>

                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center p-3 mb-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.role || 'Admin'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 overflow-y-auto">
                {/* Top Bar (Mobile) */}
                <div className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-30">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-500">
                        <Menu size={24} />
                    </button>
                    <span className="font-semibold text-slate-700">Dashboard</span>
                    <div className="w-8" />
                </div>

                <div className="p-4 lg:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;

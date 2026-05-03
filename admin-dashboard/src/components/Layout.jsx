import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bus, Map, Ticket, Users, LogOut, Menu, X, FileText, Database, ChevronLeft, Bell, Search, ClipboardList, Settings as SettingsIcon } from 'lucide-react';
import { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarItem = ({ icon: Icon, label, path, active, onClick, collapsed }) => {
    return (
        <motion.div
            whileHover={{ x: collapsed ? 0 : 3 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            title={collapsed ? label : undefined}
            className={clsx(
                "group flex items-center px-3 py-2.5 mx-1.5 rounded-xl cursor-pointer transition-all duration-200 relative overflow-hidden",
                collapsed ? "justify-center" : "space-x-3",
                active
                    ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25"
                    : "text-slate-500 hover:bg-slate-50/80 hover:text-slate-700"
            )}
        >
            <Icon size={19} className={clsx(
                "shrink-0 transition-colors",
                active ? "text-white" : "text-slate-400 group-hover:text-primary-500"
            )} />
            {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
            {active && (
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
        </motion.div>
    );
};

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useContext(AuthContext);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Bus, label: 'Buses', path: '/buses' },
        { icon: Map, label: 'Trips & Routes', path: '/trips' },
        { icon: ClipboardList, label: 'Bookings', path: '/bookings' },
        { icon: Ticket, label: 'Tickets', path: '/tickets' },
        { icon: Users, label: 'Users', path: '/users', adminOnly: true },
        { icon: Database, label: 'Master Data', path: '/master', adminOnly: true },
        { icon: FileText, label: 'Reports', path: '/reports' },
        { icon: SettingsIcon, label: 'Settings', path: '/settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const filteredMenu = menuItems.filter(item => !item.adminOnly || (user?.isAdmin || user?.role === 'Admin'));

    const currentPage = menuItems.find(item => item.path === location.pathname);

    return (
        <div className="min-h-screen bg-slate-50/50 flex font-sans text-slate-900">

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                animate={{ width: collapsed ? 72 : 260 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className={clsx(
                    "fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-slate-100 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-sm",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
                style={{ width: collapsed ? 72 : 260 }}
            >
                {/* Logo */}
                <div className={clsx(
                    "flex items-center border-b border-slate-100 shrink-0",
                    collapsed ? "justify-center p-4 h-16" : "justify-between p-5 h-16"
                )}>
                    {!collapsed && (
                        <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md shadow-primary-500/30">
                                <Bus size={16} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-slate-900 leading-none">Ente Yatra</h1>
                                <p className="text-[10px] text-slate-400 font-medium">Admin Panel</p>
                            </div>
                        </div>
                    )}
                    {collapsed && (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md shadow-primary-500/30">
                            <Bus size={16} className="text-white" />
                        </div>
                    )}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Menu Label */}
                {!collapsed && (
                    <div className="px-5 pt-5 pb-1">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Menu</p>
                    </div>
                )}

                {/* Navigation */}
                <div className={clsx(
                    "flex-1 py-2 space-y-0.5 overflow-y-auto custom-scrollbar",
                    collapsed ? "px-1 pt-4" : "px-2"
                )}>
                    {filteredMenu.map((item) => (
                        <SidebarItem
                            key={item.path}
                            icon={item.icon}
                            label={item.label}
                            path={item.path}
                            active={location.pathname === item.path}
                            collapsed={collapsed}
                            onClick={() => {
                                navigate(item.path);
                                setIsMobileMenuOpen(false);
                            }}
                        />
                    ))}
                </div>

                {/* User Panel */}
                <div className="border-t border-slate-100 p-3 shrink-0">
                    {!collapsed ? (
                        <>
                            <div className="flex items-center p-2.5 mb-2 rounded-xl bg-slate-50/80">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt={user.name} className="w-9 h-9 rounded-lg object-cover shadow-sm" />
                                ) : (
                                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="ml-2.5 overflow-hidden flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                                    <p className="text-[11px] text-slate-400 truncate">{user?.role || 'Admin'}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center space-x-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-xs font-medium"
                            >
                                <LogOut size={14} />
                                <span>Sign Out</span>
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center space-y-2">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt={user.name} className="w-9 h-9 rounded-lg object-cover shadow-sm" title={user.name} />
                            ) : (
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold shadow-sm" title={user?.name}>
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <button
                                onClick={handleLogout}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Sign Out"
                            >
                                <LogOut size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 flex flex-col">
                {/* Top Header Bar */}
                <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shrink-0">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => {
                                if (window.innerWidth < 1024) {
                                    setIsMobileMenuOpen(true);
                                } else {
                                    setCollapsed(!collapsed);
                                }
                            }}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} className="hidden lg:block" />}
                            <Menu size={20} className="lg:hidden" />
                        </button>
                        <div className="hidden sm:block">
                            <h2 className="text-base font-semibold text-slate-800">{currentPage?.label || 'Dashboard'}</h2>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                            <Bell size={19} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"></span>
                        </button>
                        <div className="hidden md:flex items-center space-x-2 pl-2 border-l border-slate-100 ml-1">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt={user.name} className="w-8 h-8 rounded-lg object-cover shadow-sm" />
                            ) : (
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="hidden lg:block">
                                <p className="text-sm font-medium text-slate-700 leading-none">{user?.name}</p>
                                <p className="text-[11px] text-slate-400">{user?.role || 'Admin'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-4 lg:p-6 xl:p-8 max-w-[1400px] w-full mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;

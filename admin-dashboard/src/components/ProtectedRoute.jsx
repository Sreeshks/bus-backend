import { Outlet, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';
import { Bus } from 'lucide-react';

const LoadingScreen = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-xl shadow-primary-500/30 animate-pulse-glow">
                <Bus size={28} className="text-white" />
            </div>
            <div className="absolute -inset-3 rounded-3xl border-2 border-primary-200 animate-spin-slow opacity-40"></div>
        </div>
        <div className="mt-6 flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <p className="mt-3 text-sm text-slate-400 font-medium">Loading Ente Yatra...</p>
    </div>
);

const ProtectedRoute = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <LoadingScreen />;

    return user ? <Layout><Outlet /></Layout> : <Navigate to="/login" />;
};

export default ProtectedRoute;

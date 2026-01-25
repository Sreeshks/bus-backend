import { useNavigate, Outlet, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';

const ProtectedRoute = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    return user ? <Layout><Outlet /></Layout> : <Navigate to="/login" />;
};

export default ProtectedRoute;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Buses from './pages/Buses';
import Trips from './pages/Trips';
import Tickets from './pages/Tickets';
import MasterData from './pages/MasterData';
import Users from './pages/Users';
import Reports from './pages/Reports';

function App() {

  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/buses" element={<Buses />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/master" element={<MasterData />} />
            <Route path="/users" element={<Users />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

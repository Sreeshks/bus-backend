import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                const userData = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    accessToken: firebaseUser.accessToken
                };
                setUser(userData);
                localStorage.setItem('yatra_user', JSON.stringify(userData));
            } else {
                const storedUser = localStorage.getItem('yatra_user');
                if (storedUser && !auth.currentUser) {
                    // This handles cases where user was logged in via email/pass but not firebase
                    setUser(JSON.parse(storedUser));
                } else {
                    setUser(null);
                    localStorage.removeItem('yatra_user');
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('yatra_user', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;
            
            // Sync with backend
            const { data } = await api.post('/auth/google', {
                name: firebaseUser.displayName,
                email: firebaseUser.email,
                photoURL: firebaseUser.photoURL,
                uid: firebaseUser.uid
            });

            setUser(data);
            localStorage.setItem('yatra_user', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            console.error("Google login error:", error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Google login failed'
            };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            localStorage.removeItem('yatra_user');
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, signInWithGoogle, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;

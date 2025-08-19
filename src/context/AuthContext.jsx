import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const base_url = "https://dos-expence.onrender.com/api/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const name = localStorage.getItem('name');
        const userId = localStorage.getItem('userId');

        if (token && role && name) {
            setCurrentUser({ token, role, name, userId });
        }

        setLoading(false);
    }, []);

    // Admin Registration
    const registerAdmin = async (email, phone, password) => {
        try {
            setError('');
            const { data } = await axios.post(`${base_url}/admin/register`, {
                email, phone, password
            });
            return data;
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
            throw err;
        }
    };

    // Admin Login
    const adminLogin = async (emailOrPhone, password) => {
        try {
            setError('');
            const { data } = await axios.post(`${base_url}/admin/login`, {
                emailOrPhone, password
            });

            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('userId', data._id);
            localStorage.setItem('name', data.name); // ✅ Fix added here

            setCurrentUser({
                token: data.token,
                role: data.role,
                name: data.name,
                userId: data._id
            });

            return data;
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
            throw err;
        }
    };

    // Create User (by Admin)
    const createUser = async (name, pin) => {
        try {
            setError('');
            const token = localStorage.getItem('token');

            const { data } = await axios.post(`${base_url}/admin/create-user`, {
                name, pin
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return data;
        } catch (err) {
            setError(err.response?.data?.error || 'User creation failed');
            throw err;
        }
    };

    // User Login
    const userLogin = async (name, pin) => {
        try {
            setError('');
            const { data } = await axios.post(`${base_url}/user/login`, {
                name, pin
            });

            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('name', data.name);
            localStorage.setItem('userId', data._id);

            setCurrentUser({
                token: data.token,
                role: data.role,
                name: data.name,
                userId: data._id
            });

            return data;
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
            throw err;
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('name');
        localStorage.removeItem('userId');
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        loading,
        error,
        registerAdmin,
        adminLogin,
        createUser,
        userLogin,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

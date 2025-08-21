import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, apiUtils } from '../services/apiService';

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
            const data = await authAPI.registerAdmin(email, phone, password);
            return data;
        } catch (err) {
            const { message } = apiUtils.handleError(err);
            setError(message);
            throw err;
        }
    };

    // Admin Login
    const adminLogin = async (emailOrPhone, password) => {
        try {
            setError('');
            const data = await authAPI.adminLogin(emailOrPhone, password);

            // Set session data using utility function
            apiUtils.setSession(data);

            setCurrentUser({
                token: data.token,
                role: data.role,
                name: data.name,
                userId: data._id
            });

            return data;
        } catch (err) {
            const { message } = apiUtils.handleError(err);
            setError(message);
            throw err;
        }
    };

    // Create User (by Admin)
    const createUser = async (name, pin) => {
        try {
            setError('');
            const data = await authAPI.createUser(name, pin);
            return data;
        } catch (err) {
            const { message } = apiUtils.handleError(err);
            setError(message);
            throw err;
        }
    };

    // User Login
    const userLogin = async (name, pin) => {
        try {
            setError('');
            const data = await authAPI.userLogin(name, pin);

            // Set session data using utility function
            apiUtils.setSession(data);

            setCurrentUser({
                token: data.token,
                role: data.role,
                name: data.name,
                userId: data._id
            });

            return data;
        } catch (err) {
            const { message } = apiUtils.handleError(err);
            setError(message);
            throw err;
        }
    };

    // Logout
    const logout = () => {
        apiUtils.clearSession();
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

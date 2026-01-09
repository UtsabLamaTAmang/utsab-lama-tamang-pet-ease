import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI, tokenManager, userManager } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is logged in on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = tokenManager.getToken();
            const savedUser = userManager.getUser();

            if (token && savedUser) {
                // Verify token is still valid
                const response = await authAPI.getMe();
                setUser(response.user);
                userManager.setUser(response.user);
            }
        } catch (err) {
            // Token invalid or expired
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            setLoading(true);
            const response = await authAPI.login(email, password);

            tokenManager.setToken(response.token);
            userManager.setUser(response.user);
            setUser(response.user);

            return { success: true, user: response.user };
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Login failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const register = async (fullName, email, phone, password) => {
        try {
            console.log("AuthContext: calling register API");
            setError(null);
            // Do not set global loading here to prevent PublicRoute from unmounting Signup
            // setLoading(true); 
            const response = await authAPI.register(fullName, email, phone, password);
            console.log("AuthContext: register API successful", response);

            // Don't set user/token yet, wait for OTP verification
            return { success: true, message: response.message, email: response.email };
        } catch (err) {
            console.error("AuthContext: register API failed", err);
            const errorMessage = err.response?.data?.message || err.message || "Registration failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
        // finally { setLoading(false); }
    };

    const verifyOTP = async (email, code) => {
        try {
            setError(null);
            setLoading(true);
            const response = await authAPI.verifyOTP(email, code);

            tokenManager.setToken(response.token);
            userManager.setUser(response.user);
            setUser(response.user);

            return { success: true, user: response.user };
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Verification failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const resendOTP = async (email) => {
        try {
            setError(null);
            const response = await authAPI.resendOTP(email);
            return { success: true, message: response.message };
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Resend failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        tokenManager.removeToken();
        userManager.removeUser();
        setUser(null);
        setError(null);
    };

    const updateProfile = async (fullName, phone) => {
        try {
            setError(null);
            const response = await authAPI.updateProfile(fullName, phone);
            setUser(response.user);
            userManager.setUser(response.user);
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Update failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        verifyOTP,
        resendOTP,
        logout,
        updateProfile,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

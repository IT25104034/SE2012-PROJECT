import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    loginUser,
    registerUser,
    getCurrentUser,
    logoutUser,
} from "../services/authService.js";


const AuthContext = createContext(null);


export function AuthProvider({ children }) {

    const [user, setUser] =
        useState(null);

    const [checkingSession, setCheckingSession] =
        useState(true);


    // Check existing backend session when app loads
    useEffect(() => {

        async function checkSession() {

            try {

                const currentUser =
                    await getCurrentUser();

                setUser(currentUser);

            } catch {

                setUser(null);

            } finally {

                setCheckingSession(false);

            }
        }

        checkSession();

    }, []);


    // LOGIN
    async function login(credentials) {

        const loggedInUser =
            await loginUser(credentials);

        setUser(loggedInUser);

        return loggedInUser;
    }


    // REGISTER
    async function register(details) {

        return await registerUser(details);
    }


    // LOGOUT
    async function logout() {

        try {

            await logoutUser();

        } finally {

            setUser(null);

        }
    }


    const isAuthenticated =
        Boolean(user);

    const isAdmin =
        user?.role === "ADMIN";


    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isAdmin,
                checkingSession,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {

    const context =
        useContext(AuthContext);

    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}
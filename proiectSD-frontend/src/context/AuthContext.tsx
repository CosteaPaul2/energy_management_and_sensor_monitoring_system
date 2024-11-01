import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { UserWithId } from "../interfaces/UserWithId";
import { CITY_URL } from "../data/urls";

interface AuthProviderProps {
    children: ReactNode;
}

export function useAuth() {
    return useContext(AuthContext);
}
interface AuthContextInterface {
    user: UserWithId | null;
    signUp: (username: string, name: string, address: string, age: number, password: string) => Promise<void>;
    signIn: (username: string, password: string) => Promise<void>;
    logout: () => void;
    hasRole: (role: string) => boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextInterface>({
    user: null,
    signUp: async () => {},
    signIn: async () => {},
    logout: () => {},
    hasRole: () => false,
    isLoading: false,
});

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<UserWithId | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const fetchedUser = await fetchUserInfo();
            if (fetchedUser) {
                setUser(fetchedUser);
                console.log(`Here is the fetched user: ${JSON.stringify(fetchedUser)}`);
            }
            setIsLoading(false);
        };
        initializeAuth();
    }, []);

    const fetchUserInfo = async (): Promise<UserWithId | null> => {
        try {
            const token = Cookies.get("jwtToken");
            console.log("Fetched JWT Token:", token);
            if (!token) {
                return null;
            }

            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const response = await axios.get(`${CITY_URL}/auth/info`, config);
            const user: UserWithId = {
                id: response.data.id,
                username: response.data.username,
                name: response.data.name,
                age: response.data.age,
                roles: response.data.roles,
            };

            console.log('Constructed User Object:', user);
            return user;

        } catch (err) {
            console.error("Error fetching user info:", err);
            return null;
        }
    };

    const hasRole = (role: string): boolean => {
        return user?.roles?.includes(role) || false;
    };

    const signIn = async (username: string, password: string) => {
        try {
            const response = await axios.post(`${CITY_URL}/auth/login`, { username, password });
            console.log(response);
            const token = response.data.access_token;
            if (token) {
                Cookies.set("jwtToken", token);
                const fetchedUser = await fetchUserInfo();
                if (fetchedUser) {
                    setUser(fetchedUser);
                }
            } else {
                console.error("Login failed: No token received");
            }
        } catch (err) {
            console.error("Error during sign-in:", err);
        }
    };

    const signUp = async (username: string, name: string, address: string, age: number, password: string) => {
        try {
            const response = await axios.post(`${CITY_URL}/auth/register`, { username, name, address, age, password });
            const token = response.data.access_token;
            if (token) {
                Cookies.set("jwtToken", token);
                const fetchedUser = await fetchUserInfo();
                if (fetchedUser) {
                    setUser(fetchedUser);
                }
            } else {
                console.error("Sign-up failed: No token received");
            }
        } catch (err) {
            console.error("Error during sign-up:", err);
        }
    };

    const logout = () => {
        Cookies.remove("jwtToken");
        setUser(null);
    };

    const value: AuthContextInterface = {
        user,
        signUp,
        signIn,
        logout,
        hasRole,
        isLoading, 
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

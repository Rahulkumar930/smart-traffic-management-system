import { createContext, useContext, useEffect, useState } from "react";
import { getMe, loginUser, registerUser } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("smart_traffic_token");

    if (!token) {
      setLoading(false);
      return;
    }

    getMe()
      .then((response) => {
        setUser(response.user);
      })
      .catch(() => {
        localStorage.removeItem("smart_traffic_token");
        localStorage.removeItem("smart_traffic_user");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const response = await loginUser({
      email,
      password,
    });

    localStorage.setItem("smart_traffic_token", response.token);
    localStorage.setItem(
      "smart_traffic_user",
      JSON.stringify(response.user)
    );

    setUser(response.user);

    return response;
  };

  const register = async (data) => {
    const response = await registerUser(data);

    localStorage.setItem("smart_traffic_token", response.token);
    localStorage.setItem(
      "smart_traffic_user",
      JSON.stringify(response.user)
    );

    setUser(response.user);

    return response;
  };

  const logout = () => {
    localStorage.removeItem("smart_traffic_token");
    localStorage.removeItem("smart_traffic_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
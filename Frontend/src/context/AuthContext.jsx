import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "electra_user";

export const AuthProvider = ({ children }) => {
  // Load the user IMMEDIATELY when AuthProvider is created.
  // This prevents the refresh -> user=null -> /login problem.
  const [user, setUserState] = useState(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY);

      if (!savedUser) {
        return null;
      }

      const parsedUser = JSON.parse(savedUser);

      if (!parsedUser || !parsedUser.email) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return parsedUser;
    } catch (error) {
      console.error("Failed to restore user:", error);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Keep localStorage synchronized with the current user
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // Login / update user
  const setUser = (userData) => {
    if (!userData) {
      setUserState(null);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const normalizedUser = {
      user_id: userData.user_id ?? userData.id ?? null,
      name: userData.name ?? "",
      email: userData.email ?? "",
      password: userData.password ?? "",
      picture: userData.picture ?? null,
      theme: userData.theme ?? "system",
    };

    setUserState(normalizedUser);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(normalizedUser)
    );
  };

  // Logout
  const logout = () => {
    setUserState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};

export default AuthProvider;
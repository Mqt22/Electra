import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "electra_user";
const ADMIN_STORAGE_KEY = "electra_admin";

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(() => {
    try {
      // First check normal user
      const savedUser = localStorage.getItem(STORAGE_KEY);

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);

        if (parsedUser?.email) {
          return parsedUser;
        }
      }

      // If no normal user, check admin
      const savedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);

      if (savedAdmin) {
        const admin = JSON.parse(savedAdmin);

        if (admin?.user_id && admin?.name) {
          return {
            user_id: admin.user_id,
            name: admin.name,
            email: admin.email ?? "",
            password: "",
            picture: admin.picture ?? null,
            theme: admin.theme ?? "system",
            isAdmin: true,
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Failed to restore authentication:", error);
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Don't overwrite admin authentication
    if (user?.isAdmin) {
      return;
    }

    if (user) {
      localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(user)
      );
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

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
      isAdmin: false,
    };

    setUserState(normalizedUser);

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(normalizedUser)
    );
  };

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
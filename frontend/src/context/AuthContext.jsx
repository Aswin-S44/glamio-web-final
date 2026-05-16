import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { BASE_URL } from "../constants/urls";

const AuthContext = createContext(null);

const normalizeAuthUser = (rawUser) => {
  if (!rawUser) {
    return null;
  }

  const shop = rawUser.shop ?? rawUser.shopProfile ?? null;
  const name = rawUser.name ?? rawUser.username ?? "";
  const picture = rawUser.picture ?? rawUser.profileImage ?? "";
  const userType =
    rawUser.userType ??
    (shop ? "shop" : rawUser.role === "SHOP_OWNER" ? "shop" : "customer");

  return {
    ...rawUser,
    name,
    username: rawUser.username ?? name,
    picture,
    profileImage: rawUser.profileImage ?? picture,
    shop,
    shopProfile: shop,
    role: rawUser.role ?? (shop ? "SHOP_OWNER" : "CUSTOMER"),
    userType,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/auth/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      if (!res.ok) throw new Error("Session expired or invalid");

      const data = await res.json();
      setUser(normalizeAuthUser(data));
      setError(null);
    } catch (err) {
      setError(err.message);
      setUser(null);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const setAuthenticatedUser = useCallback((authData) => {
    console.log("authData-------------", authData);
    if (authData?.data?.token) {
      localStorage.setItem("token", authData.token);
    }

    setUser(normalizeAuthUser(authData?.user ?? authData));
    setError(null);
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        isShopOwner: user?.role === "SHOP_OWNER",
        shop: user?.shop || null,
        setAuthenticatedUser,
        refreshProfile: fetchProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};

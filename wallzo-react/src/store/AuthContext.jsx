import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('wallzo_token'));
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    const init = async () => {
      if (token) {
        try {
          const data = await authAPI.getMe();
          setUser(data.user);
        } catch {
          // Token invalid/expired
          localStorage.removeItem('wallzo_token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const saveAuth = (userData, newToken) => {
    setUser(userData);
    setToken(newToken);
    localStorage.setItem('wallzo_token', newToken);
  };

  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      saveAuth(data.user, data.token);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await authAPI.register(name, email, password);
      saveAuth(data.user, data.token);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('wallzo_token');
  };

  const updateProfile = async (updates) => {
    try {
      const data = await authAPI.updateProfile(updates);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const toggleWishlist = useCallback(async (productId) => {
    if (!user) {
      toast.error('Please sign in to save to wishlist');
      return;
    }
    try {
      const data = await authAPI.toggleWishlist(productId);
      setUser(prev => ({ ...prev, wishlist: data.wishlist }));
    } catch (err) {
      toast.error('Could not update wishlist');
    }
  }, [user]);

  const isInWishlist = useCallback((productId) => {
    if (!user?.wishlist) return false;
    return user.wishlist.some(id => id === productId || id._id === productId || id.toString?.() === productId);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile,
      toggleWishlist,
      isInWishlist,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

import { createContext, useContext, useReducer, useEffect } from 'react';

const WishlistContext = createContext();

const loadWishlist = () => {
  try {
    const saved = localStorage.getItem('wallzo_wishlist');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const wishlistReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_WISHLIST': {
      const productId = action.payload;
      if (state.includes(productId)) {
        return state.filter(id => id !== productId);
      }
      return [...state, productId];
    }
    case 'CLEAR_WISHLIST':
      return [];
    default:
      return state;
  }
};

export function WishlistProvider({ children }) {
  const [wishlist, dispatch] = useReducer(wishlistReducer, [], loadWishlist);

  useEffect(() => {
    localStorage.setItem('wallzo_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (productId) => {
    dispatch({ type: 'TOGGLE_WISHLIST', payload: productId });
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};

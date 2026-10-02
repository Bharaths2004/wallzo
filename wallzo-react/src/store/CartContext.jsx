import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Load cart from localStorage
const loadCart = () => {
  try {
    const saved = localStorage.getItem('wallzo_cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, variant } = action.payload;
      const existingIndex = state.findIndex(
        item => item.productId === product.id && item.sku === variant.sku
      );

      if (existingIndex >= 0) {
        const updated = [...state];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(updated[existingIndex].quantity + 1, variant.stock)
        };
        return updated;
      }

      return [...state, {
        productId: product.id,
        name: product.name,
        image: product.images[0],
        size: variant.size,
        sku: variant.sku,
        price: variant.price,
        stock: variant.stock,
        quantity: 1
      }];
    }

    case 'REMOVE_FROM_CART':
      return state.filter(item => item.sku !== action.payload);

    case 'UPDATE_QUANTITY': {
      const { sku, quantity } = action.payload;
      if (quantity <= 0) {
        return state.filter(item => item.sku !== sku);
      }
      return state.map(item =>
        item.sku === sku
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      );
    }

    case 'CLEAR_CART':
      return [];

    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], loadCart);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('wallzo_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, variant) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, variant } });
  };

  const removeFromCart = (sku) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: sku });
  };

  const updateQuantity = (sku, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { sku, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

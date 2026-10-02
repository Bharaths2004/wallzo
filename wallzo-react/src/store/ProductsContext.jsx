import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { productsAPI } from '../services/api';
import { products as mockProducts } from '../data/products'; // fallback

const ProductsContext = createContext(null);
export const useProducts = () => useContext(ProductsContext);

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMock, setUsingMock] = useState(false);

  const normalizeProduct = (p) => ({
    ...p,
    id: p._id || p.id,
    images: p.images?.length ? p.images : ['https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80'],
  });

  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await productsAPI.getAll(params);
      setProducts((data.products || []).map(normalizeProduct));
      setUsingMock(false);
      setError(null);
    } catch (err) {
      // Fallback to mock data if backend not available
      console.warn('Backend unavailable, using mock data:', err.message);
      setProducts(mockProducts.map(p => ({ ...p, id: p.id })));
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const getProductBySlug = useCallback(async (slug) => {
    try {
      if (usingMock) {
        return mockProducts.find(p => p.slug === slug) || null;
      }
      const data = await productsAPI.getBySlug(slug);
      return normalizeProduct(data.product);
    } catch {
      return mockProducts.find(p => p.slug === slug) || null;
    }
  }, [usingMock]);

  return (
    <ProductsContext.Provider value={{ products, loading, error, usingMock, fetchProducts, getProductBySlug }}>
      {children}
    </ProductsContext.Provider>
  );
};

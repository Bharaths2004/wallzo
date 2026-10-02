import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Grid3X3, LayoutGrid, X } from 'lucide-react';
import ProductCard from '../components/shop/ProductCard';
import { products, categories } from '../data/products';
import './Products.css';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [gridCols, setGridCols] = useState(4);
  const [showFilters, setShowFilters] = useState(false);

  const categoryParam = searchParams.get('category') || 'all';
  const sortParam = searchParams.get('sort') || 'default';
  const searchParam = searchParams.get('search') || '';

  const updateParams = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all' && value !== 'default') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchParam) {
      const query = searchParam.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.tags.some(t => t.includes(query)) ||
        p.subCategory.includes(query)
      );
    }

    // Category filter
    if (categoryParam !== 'all') {
      result = result.filter(p => p.subCategory === categoryParam);
    }

    // Sort
    switch (sortParam) {
      case 'price-low':
        result.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price-high':
        result.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'trending':
        result.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
        break;
      default:
        break;
    }

    return result;
  }, [categoryParam, sortParam, searchParam]);

  const activeFiltersCount = [
    categoryParam !== 'all' ? 1 : 0,
    sortParam !== 'default' ? 1 : 0,
    searchParam ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="products-page">
      <div className="container">
        {/* Page Header */}
        <motion.div
          className="products-page__header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="products-page__title">
              {searchParam ? `Search: "${searchParam}"` :
               categoryParam !== 'all' ? `${categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)} Collection` :
               'All Posters'}
            </h1>
            <p className="products-page__count">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="products-page__toolbar">
            <button
              className={`products-page__filter-toggle ${showFilters ? 'products-page__filter-toggle--active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="products-page__filter-count">{activeFiltersCount}</span>
              )}
            </button>

            <div className="products-page__grid-toggle">
              <button
                className={`products-page__grid-btn ${gridCols === 3 ? 'products-page__grid-btn--active' : ''}`}
                onClick={() => setGridCols(3)}
                aria-label="3 columns"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                className={`products-page__grid-btn ${gridCols === 4 ? 'products-page__grid-btn--active' : ''}`}
                onClick={() => setGridCols(4)}
                aria-label="4 columns"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Filters Bar */}
        {showFilters && (
          <motion.div
            className="products-page__filters"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="products-page__filter-group">
              <label className="products-page__filter-label">Category</label>
              <div className="products-page__filter-chips">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`products-page__chip ${categoryParam === cat.id ? 'products-page__chip--active' : ''}`}
                    onClick={() => updateParams('category', cat.id)}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="products-page__filter-group">
              <label className="products-page__filter-label">Sort By</label>
              <select
                className="products-page__select"
                value={sortParam}
                onChange={(e) => updateParams('sort', e.target.value)}
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
                <option value="trending">Trending</option>
              </select>
            </div>

            {activeFiltersCount > 0 && (
              <button
                className="products-page__clear-filters"
                onClick={() => setSearchParams({})}
              >
                <X size={14} /> Clear All Filters
              </button>
            )}
          </motion.div>
        )}

        {/* Active Filters Tags */}
        {activeFiltersCount > 0 && !showFilters && (
          <div className="products-page__active-tags">
            {categoryParam !== 'all' && (
              <span className="products-page__tag">
                {categoryParam}
                <button onClick={() => updateParams('category', 'all')}>
                  <X size={12} />
                </button>
              </span>
            )}
            {sortParam !== 'default' && (
              <span className="products-page__tag">
                {sortParam.replace('-', ' ')}
                <button onClick={() => updateParams('sort', 'default')}>
                  <X size={12} />
                </button>
              </span>
            )}
            {searchParam && (
              <span className="products-page__tag">
                "{searchParam}"
                <button onClick={() => updateParams('search', '')}>
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div
            className="products-page__grid"
            style={{ '--grid-cols': gridCols }}
          >
            {filteredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="products-page__empty">
            <span className="products-page__empty-icon">🔍</span>
            <h3>No products found</h3>
            <p>Try adjusting your filters or search query</p>
            <button
              className="products-page__empty-btn"
              onClick={() => setSearchParams({})}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

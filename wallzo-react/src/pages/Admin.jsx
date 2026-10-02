import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Settings,
  TrendingUp, AlertTriangle, BarChart3, Plus, Edit, Trash2,
  Eye, X, Check, Clock, Upload, Save, Shield, RefreshCw,
  Download, ChevronDown, Loader
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { adminAPI, productsAPI, ordersAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Admin.css';

const statusColors = {
  pending: 'var(--color-warning)',
  processing: 'var(--color-info)',
  shipped: 'var(--color-accent-primary)',
  delivered: 'var(--color-success)',
  cancelled: 'var(--color-danger)'
};

// Product Form Modal
function ProductModal({ product, onClose, onSaved, isSuperAdmin }) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || 'posters',
    subCategory: product?.subCategory || 'anime',
    tags: product?.tags?.join(', ') || '',
    isNew: product?.isNew || false,
    isTrending: product?.isTrending || false,
    status: product?.status || 'active',
    variants: product?.variants || [
      { size: 'A4', sku: '', stock: 0, price: 299 },
      { size: 'A3', sku: '', stock: 0, price: 499 },
      { size: 'A2', sku: '', stock: 0, price: 799 }
    ],
  });
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState(product?.images || []);
  const [removedImages, setRemovedImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImages(prev => [...prev, ...files]);
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (url, idx) => {
    if (url.startsWith('/uploads/') || url.startsWith('https://')) {
      setRemovedImages(prev => [...prev, url]);
    }
    setPreviewUrls(prev => prev.filter((_, i) => i !== idx));
    if (idx >= (product?.images?.length || 0)) {
      const newIdx = idx - (product?.images?.length || 0);
      setImages(prev => prev.filter((_, i) => i !== newIdx));
    }
  };

  const updateVariant = (idx, field, value) => {
    setForm(prev => {
      const variants = [...prev.variants];
      variants[idx] = { ...variants[idx], [field]: field === 'price' || field === 'stock' ? Number(value) : value };
      return { ...prev, variants };
    });
  };

  const handleSave = async () => {
    if (!form.name || !form.description || !form.subCategory) {
      toast.error('Name, description, and sub-category are required.');
      return;
    }
    const hasNoStock = form.variants.every(v => v.stock === 0);
    if (images.length === 0 && previewUrls.length === 0) {
      toast.error('At least one image is required.');
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('category', form.category);
      fd.append('subCategory', form.subCategory);
      fd.append('tags', form.tags);
      fd.append('isNew', form.isNew);
      fd.append('isTrending', form.isTrending);
      fd.append('status', form.status);
      fd.append('variants', JSON.stringify(form.variants));
      if (removedImages.length) fd.append('removeImages', JSON.stringify(removedImages));
      images.forEach(img => fd.append('images', img));

      let result;
      if (isEdit) {
        result = await productsAPI.update(product._id || product.id, fd);
      } else {
        result = await productsAPI.create(fd);
      }

      const isPending = result.pendingAction;
      toast.success(isPending
        ? '✅ Submitted for Super Admin approval'
        : `✅ Product ${isEdit ? 'updated' : 'created'} successfully!`
      );
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal__overlay" onClick={onClose}>
      <motion.div
        className="admin-modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="admin-modal__header">
          <h2>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          {!isSuperAdmin && (
            <span className="admin-modal__note">⚠️ Changes will be submitted for Super Admin approval</span>
          )}
          <button onClick={onClose} className="admin-modal__close"><X size={20} /></button>
        </div>

        <div className="admin-modal__body">
          {/* Images */}
          <div className="admin-modal__section">
            <label className="admin-modal__label">Product Images *</label>
            <div className="admin-modal__images">
              {previewUrls.map((url, i) => (
                <div key={i} className="admin-modal__image-preview">
                  <img src={url} alt={`preview-${i}`} />
                  <button type="button" className="admin-modal__remove-img" onClick={() => removeImage(url, i)}>
                    <X size={12} />
                  </button>
                </div>
              ))}
              {previewUrls.length < 6 && (
                <button type="button" className="admin-modal__add-img" onClick={() => fileRef.current.click()}>
                  <Upload size={20} />
                  <span>Add Image</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleImageSelect} />
          </div>

          {/* Basic Info */}
          <div className="admin-modal__grid">
            <div className="admin-modal__field admin-modal__field--full">
              <label>Product Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Akira Neo-Tokyo" />
            </div>
            <div className="admin-modal__field admin-modal__field--full">
              <label>Description *</label>
              <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Product description..." />
            </div>
            <div className="admin-modal__field">
              <label>Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option value="posters">Posters</option>
                <option value="accessories">Accessories</option>
                <option value="clothing">Clothing</option>
              </select>
            </div>
            <div className="admin-modal__field">
              <label>Sub-Category *</label>
              <select value={form.subCategory} onChange={e => setForm({...form, subCategory: e.target.value})}>
                <option value="anime">Anime</option>
                <option value="retro">Retro</option>
                <option value="minimal">Minimal</option>
                <option value="street-art">Street Art</option>
                <option value="rings">Rings</option>
                <option value="chains">Chains</option>
                <option value="tshirts">T-Shirts</option>
                <option value="hoodies">Hoodies</option>
              </select>
            </div>
            <div className="admin-modal__field admin-modal__field--full">
              <label>Tags (comma separated)</label>
              <input type="text" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="anime, poster, art" />
            </div>
          </div>

          {/* Variants */}
          <div className="admin-modal__section">
            <label className="admin-modal__label">Variants (Size / SKU / Stock / Price)</label>
            <div className="admin-modal__variants">
              {form.variants.map((v, i) => (
                <div key={i} className="admin-modal__variant-row">
                  <span className="admin-modal__variant-size">{v.size}</span>
                  <input type="text" placeholder="SKU (e.g. PROD-A4)"
                    value={v.sku} onChange={e => updateVariant(i, 'sku', e.target.value)} />
                  <input type="number" placeholder="Stock" min={0}
                    value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)} />
                  <input type="number" placeholder="Price ₹" min={0}
                    value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          {/* Flags */}
          <div className="admin-modal__flags">
            <label className="admin-modal__checkbox">
              <input type="checkbox" checked={form.isNew} onChange={e => setForm({...form, isNew: e.target.checked})} />
              Mark as New
            </label>
            <label className="admin-modal__checkbox">
              <input type="checkbox" checked={form.isTrending} onChange={e => setForm({...form, isTrending: e.target.checked})} />
              Mark as Trending
            </label>
            <div className="admin-modal__field">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        <div className="admin-modal__footer">
          <button className="admin-modal__cancel" onClick={onClose}>Cancel</button>
          <button className="admin-modal__save" onClick={handleSave} disabled={saving}>
            {saving ? <><Loader size={16} className="spin" /> Saving...</> : <><Save size={16} /> {isEdit ? 'Update Product' : 'Add Product'}</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingActions, setPendingActions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productModal, setProductModal] = useState(null); // null | 'new' | product object
  const [deletingId, setDeletingId] = useState(null);

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super_admin')) {
    navigate('/login');
    return null;
  }

  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadTabData = async (tab) => {
    setLoading(true);
    try {
      switch (tab) {
        case 'dashboard': {
          const data = await adminAPI.getStats();
          setStats(data.stats);
          break;
        }
        case 'products': {
          const data = await productsAPI.getAllAdmin();
          setProducts(data.products || []);
          break;
        }
        case 'orders': {
          const data = await ordersAPI.getAllAdmin();
          setOrders(data.orders || []);
          break;
        }
        case 'users': {
          if (isSuperAdmin) {
            const data = await adminAPI.getUsers();
            setUsers(data.users || []);
          }
          break;
        }
        case 'pending': {
          if (isSuperAdmin) {
            const data = await adminAPI.getPendingActions();
            setPendingActions(data.actions || []);
          }
          break;
        }
        case 'analytics': {
          if (isSuperAdmin) {
            const data = await adminAPI.getAnalytics();
            setAnalytics(data.analytics);
          }
          break;
        }
      }
    } catch (err) {
      toast.error(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This action cannot be undone.`)) return;
    setDeletingId(product._id);
    try {
      const result = await productsAPI.delete(product._id);
      toast.success(result.pendingAction ? 'Delete request submitted for approval' : 'Product deleted');
      await loadTabData('products');
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus, `Status changed to ${newStatus}`);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      toast.success('Order status updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleApproveAction = async (actionId) => {
    try {
      await adminAPI.approveAction(actionId, 'Approved by Super Admin');
      toast.success('Action approved and executed!');
      await loadTabData('pending');
      await loadTabData('products');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRejectAction = async (actionId) => {
    const note = window.prompt('Reason for rejection (optional):') || 'Rejected';
    try {
      await adminAPI.rejectAction(actionId, note);
      toast.success('Action rejected');
      await loadTabData('pending');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success('Role updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    ...(isSuperAdmin ? [
      { id: 'pending', label: 'Pending', icon: Clock, badge: pendingActions.length },
      { id: 'users', label: 'Users', icon: Users },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ] : []),
  ];

  return (
    <div className="admin">
      {/* Product Modal */}
      <AnimatePresence>
        {productModal !== null && (
          <ProductModal
            product={productModal === 'new' ? null : productModal}
            isSuperAdmin={isSuperAdmin}
            onClose={() => setProductModal(null)}
            onSaved={() => loadTabData('products')}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="admin__sidebar">
        <div className="admin__sidebar-header">
          <span className="admin__sidebar-logo">W</span>
          <div>
            <h3 className="admin__sidebar-title">Wallzo Admin</h3>
            <span className="admin__sidebar-role">
              {isSuperAdmin ? '🛡️ Super Admin' : '⚙️ Admin'}
            </span>
          </div>
        </div>
        <nav className="admin__nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`admin__nav-item ${activeTab === tab.id ? 'admin__nav-item--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
              {tab.badge > 0 && <span className="admin__nav-badge">{tab.badge}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin__main">
        <div className="admin__header">
          <h1 className="admin__page-title">{tabs.find(t => t.id === activeTab)?.label}</h1>
          <div className="admin__header-actions">
            <button className="admin__refresh-btn" onClick={() => loadTabData(activeTab)} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
            </button>
            <div className="admin__user-info">
              <span className="admin__user-avatar">{user?.avatar}</span>
              <span className="admin__user-name">{user?.name}</span>
            </div>
          </div>
        </div>

        {loading && <div className="admin__loading"><Loader size={32} className="spin" /> Loading...</div>}

        {!loading && (
          <>
            {/* === DASHBOARD === */}
            {activeTab === 'dashboard' && stats && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="admin__stats-grid">
                  <div className="admin__stat-card admin__stat-card--revenue">
                    <TrendingUp size={28} />
                    <div>
                      <p className="admin__stat-label">Total Revenue</p>
                      <p className="admin__stat-value">₹{stats.totalRevenue?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="admin__stat-card admin__stat-card--orders">
                    <ShoppingCart size={28} />
                    <div>
                      <p className="admin__stat-label">Total Orders</p>
                      <p className="admin__stat-value">{stats.totalOrders}</p>
                    </div>
                  </div>
                  <div className="admin__stat-card admin__stat-card--products">
                    <Package size={28} />
                    <div>
                      <p className="admin__stat-label">Products</p>
                      <p className="admin__stat-value">{stats.totalProducts}</p>
                    </div>
                  </div>
                  <div className="admin__stat-card admin__stat-card--alerts">
                    <AlertTriangle size={28} />
                    <div>
                      <p className="admin__stat-label">Pending Approvals</p>
                      <p className="admin__stat-value">{stats.pendingActions}</p>
                    </div>
                  </div>
                </div>

                <div className="admin__section">
                  <h2 className="admin__section-title">Recent Orders</h2>
                  <div className="admin__table-wrap">
                    <table className="admin__table">
                      <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                      <tbody>
                        {stats.recentOrders?.map(o => (
                          <tr key={o._id}>
                            <td><strong>{o.orderId}</strong></td>
                            <td>{o.user?.name || 'N/A'}</td>
                            <td>₹{o.total}</td>
                            <td><span className={`admin__status admin__status--${o.status}`}>{o.status}</span></td>
                            <td className="admin__muted">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {stats.lowStockProducts?.length > 0 && (
                  <div className="admin__section">
                    <h2 className="admin__section-title">⚠️ Low Stock Alerts</h2>
                    <div className="admin__alert-list">
                      {stats.lowStockProducts.map(p => (
                        <div key={p._id} className="admin__alert-item">
                          <img src={p.images?.[0]} alt={p.name} className="admin__alert-img" />
                          <div>
                            <p className="admin__alert-name">{p.name}</p>
                            <p className="admin__alert-stock">
                              {p.variants?.filter(v => v.stock <= 10).map(v => `${v.size}: ${v.stock} left`).join(' · ')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* === PRODUCTS === */}
            {activeTab === 'products' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="admin__toolbar">
                  <button className="admin__action-btn admin__action-btn--primary" onClick={() => setProductModal('new')}>
                    <Plus size={16} /> Add Product {!isSuperAdmin && '(Submit for Approval)'}
                  </button>
                </div>
                <div className="admin__table-wrap">
                  <table className="admin__table">
                    <thead>
                      <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {products.map(p => {
                        const totalStock = p.variants?.reduce((s, v) => s + v.stock, 0) || 0;
                        return (
                          <tr key={p._id}>
                            <td><img src={p.images?.[0]} alt={p.name} className="admin__product-thumb" /></td>
                            <td><strong>{p.name}</strong><div className="admin__muted" style={{fontSize:11}}>{p.slug}</div></td>
                            <td className="admin__muted">{p.subCategory}</td>
                            <td>₹{p.basePrice}</td>
                            <td><span className={`admin__stock ${totalStock === 0 ? 'admin__stock--oos' : totalStock <= 10 ? 'admin__stock--low' : ''}`}>{totalStock}</span></td>
                            <td>
                              <span className={`admin__status admin__status--${p.approvalStatus === 'approved' ? 'active' : p.approvalStatus === 'pending' ? 'pending' : 'cancelled'}`}>
                                {p.approvalStatus === 'approved' ? p.status : p.approvalStatus}
                              </span>
                            </td>
                            <td>
                              <div className="admin__row-actions">
                                <button className="admin__row-btn" title="Edit" onClick={() => setProductModal(p)}><Edit size={14} /></button>
                                {(isSuperAdmin || true) && (
                                  <button
                                    className="admin__row-btn admin__row-btn--danger"
                                    title="Delete"
                                    disabled={deletingId === p._id}
                                    onClick={() => handleDeleteProduct(p)}
                                  >
                                    {deletingId === p._id ? <Loader size={14} className="spin" /> : <Trash2 size={14} />}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {products.length === 0 && (
                        <tr><td colSpan={7} style={{textAlign:'center', padding:40, color:'var(--color-text-muted)'}}>No products yet. Click "Add Product" to get started.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* === ORDERS === */}
            {activeTab === 'orders' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="admin__table-wrap">
                  <table className="admin__table">
                    <thead>
                      <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o._id}>
                          <td><strong>{o.orderId}</strong></td>
                          <td>{o.user?.name}<div className="admin__muted" style={{fontSize:11}}>{o.user?.email}</div></td>
                          <td>{o.items?.length} item(s)</td>
                          <td>₹{o.total}</td>
                          <td><span className={`admin__status admin__status--${o.paymentStatus === 'paid' ? 'delivered' : 'pending'}`}>{o.paymentStatus}</span></td>
                          <td>
                            <select className="admin__status-select" value={o.status}
                              onChange={e => handleOrderStatusChange(o._id, e.target.value)}>
                              {['pending','processing','shipped','delivered','cancelled'].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                          <td className="admin__muted">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr><td colSpan={7} style={{textAlign:'center', padding:40, color:'var(--color-text-muted)'}}>No orders yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* === PENDING ACTIONS (Super Admin) === */}
            {activeTab === 'pending' && isSuperAdmin && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {pendingActions.length === 0 ? (
                  <div className="admin__empty-state">
                    <Check size={48} style={{color:'var(--color-success)', marginBottom:16}} />
                    <h3>All caught up!</h3>
                    <p>No pending actions to review.</p>
                  </div>
                ) : (
                  <div className="admin__pending-list">
                    {pendingActions.map(action => (
                      <div key={action._id} className="admin__pending-card">
                        <div className="admin__pending-header">
                          <span className="admin__pending-type">{action.type.replace('_', ' ')}</span>
                          <span className="admin__muted">
                            by {action.submittedBy?.name} ({action.submittedBy?.role}) •{' '}
                            {new Date(action.submittedAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <div className="admin__pending-payload">
                          <pre>{JSON.stringify(action.payload, null, 2).slice(0, 400)}...</pre>
                        </div>
                        <div className="admin__pending-actions">
                          <button className="admin__approve-btn" onClick={() => handleApproveAction(action._id)}>
                            <Check size={14} /> Approve
                          </button>
                          <button className="admin__reject-btn" onClick={() => handleRejectAction(action._id)}>
                            <X size={14} /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* === USERS (Super Admin) === */}
            {activeTab === 'users' && isSuperAdmin && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="admin__table-wrap">
                  <table className="admin__table">
                    <thead><tr><th>Avatar</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id}>
                          <td><span className="admin__user-circle">{u.avatar}</span></td>
                          <td><strong>{u.name}</strong></td>
                          <td className="admin__muted">{u.email}</td>
                          <td>
                            <select className="admin__status-select" value={u.role}
                              onChange={e => handleRoleChange(u._id, e.target.value)}
                              disabled={u._id === user._id}>
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                              <option value="super_admin">Super Admin</option>
                            </select>
                          </td>
                          <td>
                            <span className={`admin__status admin__status--${u.isActive ? 'active' : 'cancelled'}`}>
                              {u.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td>
                            <button className="admin__row-btn" title={u.isActive ? 'Deactivate' : 'Activate'}
                              onClick={async () => { await adminAPI.toggleUserStatus(u._id); loadTabData('users'); }}>
                              <Shield size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* === ANALYTICS (Super Admin) === */}
            {activeTab === 'analytics' && isSuperAdmin && analytics && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="admin__analytics">
                  <div className="admin__analytics-card">
                    <h3>Orders by Status</h3>
                    <div className="admin__status-chart">
                      {analytics.ordersByStatus?.map(item => (
                        <div key={item._id} className="admin__status-bar">
                          <span className="admin__status-label">{item._id}</span>
                          <div className="admin__status-bar-fill" style={{ '--w': `${Math.min(100, item.count * 20)}%`, '--color': statusColors[item._id] || 'var(--color-text-muted)' }} />
                          <span className="admin__status-count">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="admin__analytics-card">
                    <h3>Top Selling Products</h3>
                    <div className="admin__top-products">
                      {analytics.topProducts?.map((p, i) => (
                        <div key={p._id} className="admin__top-product">
                          <span className="admin__rank">#{i + 1}</span>
                          <div><p>{p.name}</p><p className="admin__muted">{p.totalSold} sold</p></div>
                        </div>
                      ))}
                      {analytics.topProducts?.length === 0 && <p className="admin__muted">No sales data yet</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

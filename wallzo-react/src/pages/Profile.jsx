import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Shield, LogOut, Save } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import toast from 'react-hot-toast';
import './Profile.css';

export default function Profile() {
  const { user, isAuthenticated, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) { navigate('/login'); return null; }

  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [newAddress, setNewAddress] = useState({ label: '', line1: '', city: '', state: '', pincode: '', phone: '' });
  const [showAddressForm, setShowAddressForm] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(form);
    toast.success('Profile updated!', {
      style: { background: '#141414', color: '#fff', border: '1px solid rgba(255,214,0,0.2)' },
      iconTheme: { primary: '#FFD600', secondary: '#0A0A0A' }
    });
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    const addresses = [...(user.addresses || []), { ...newAddress, id: 'a' + Date.now() }];
    updateProfile({ addresses });
    setNewAddress({ label: '', line1: '', city: '', state: '', pincode: '', phone: '' });
    setShowAddressForm(false);
    toast.success('Address added!');
  };

  const roleBadge = {
    super_admin: { label: 'Super Admin', color: 'var(--color-accent-primary)' },
    admin: { label: 'Admin', color: 'var(--color-info)' },
    user: { label: 'Customer', color: 'var(--color-success)' }
  };

  const badge = roleBadge[user.role];

  return (
    <div className="profile-page container">
      <motion.h1 className="profile-page__title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        My Profile
      </motion.h1>

      <div className="profile-page__layout">
        {/* Sidebar */}
        <div className="profile-page__sidebar">
          <div className="profile-page__avatar-section">
            <div className="profile-page__avatar">{user.avatar}</div>
            <h2 className="profile-page__name">{user.name}</h2>
            <p className="profile-page__email">{user.email}</p>
            <span className="profile-page__role" style={{ '--role-color': badge.color }}>
              <Shield size={12} /> {badge.label}
            </span>
          </div>
          <button className="profile-page__logout" onClick={() => { logout(); navigate('/'); }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Main Content */}
        <div className="profile-page__content">
          {/* Profile Form */}
          <div className="profile-page__card">
            <h3 className="profile-page__card-title"><User size={18} /> Personal Info</h3>
            <form className="profile-page__form" onSubmit={handleSave}>
              <div className="profile-page__field">
                <label>Full Name</label>
                <input
                  type="text" value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>
              <div className="profile-page__field">
                <label>Email</label>
                <input type="email" value={form.email} disabled />
              </div>
              <button type="submit" className="profile-page__save-btn">
                <Save size={16} /> Save Changes
              </button>
            </form>
          </div>

          {/* Addresses */}
          <div className="profile-page__card">
            <div className="profile-page__card-header">
              <h3 className="profile-page__card-title"><MapPin size={18} /> Saved Addresses</h3>
              <button className="profile-page__add-btn" onClick={() => setShowAddressForm(!showAddressForm)}>
                + Add New
              </button>
            </div>

            {showAddressForm && (
              <form className="profile-page__address-form" onSubmit={handleAddAddress}>
                <input placeholder="Label (Home, Office...)" value={newAddress.label}
                  onChange={e => setNewAddress({...newAddress, label: e.target.value})} required />
                <input placeholder="Address Line 1" value={newAddress.line1}
                  onChange={e => setNewAddress({...newAddress, line1: e.target.value})} required />
                <div className="profile-page__field-row">
                  <input placeholder="City" value={newAddress.city}
                    onChange={e => setNewAddress({...newAddress, city: e.target.value})} required />
                  <input placeholder="State" value={newAddress.state}
                    onChange={e => setNewAddress({...newAddress, state: e.target.value})} required />
                </div>
                <div className="profile-page__field-row">
                  <input placeholder="Pincode" value={newAddress.pincode}
                    onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} required />
                  <input placeholder="Phone" value={newAddress.phone}
                    onChange={e => setNewAddress({...newAddress, phone: e.target.value})} required />
                </div>
                <button type="submit" className="profile-page__save-btn">Save Address</button>
              </form>
            )}

            {user.addresses?.length > 0 ? (
              <div className="profile-page__addresses">
                {user.addresses.map(addr => (
                  <div key={addr.id} className="profile-page__address">
                    <span className="profile-page__address-label">{addr.label}</span>
                    <p>{addr.line1}</p>
                    <p>{addr.city}, {addr.state} — {addr.pincode}</p>
                    <p>{addr.phone}</p>
                  </div>
                ))}
              </div>
            ) : !showAddressForm && (
              <p className="profile-page__no-data">No saved addresses</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

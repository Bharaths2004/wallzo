import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      const result = login(form.email, form.password);
      if (result.success) {
        toast.success(`Welcome back, ${result.user.name}!`, {
          style: { background: '#141414', color: '#fff', border: '1px solid rgba(255,214,0,0.2)' },
          iconTheme: { primary: '#FFD600', secondary: '#0A0A0A' }
        });
        navigate('/');
      } else {
        toast.error(result.error);
      }
    } else {
      if (!form.name) { toast.error('Name is required'); return; }
      const result = register(form.name, form.email, form.password);
      if (result.success) {
        toast.success('Account created! Welcome to Wallzo 🎉');
        navigate('/');
      } else {
        toast.error(result.error);
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__bg">
        <div className="auth-page__glow" />
      </div>

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-card__header">
          <Link to="/" className="auth-card__logo">
            <span className="auth-card__logo-icon">W</span>
            <span className="auth-card__logo-text">WALLZO</span>
          </Link>
          <h1 className="auth-card__title">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="auth-card__subtitle">
            {isLogin ? 'Sign in to continue shopping' : 'Join the art revolution'}
          </p>
        </div>

        <form className="auth-card__form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="auth-card__field">
              <User size={16} className="auth-card__field-icon" />
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>
          )}
          <div className="auth-card__field">
            <Mail size={16} className="auth-card__field-icon" />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              required
            />
          </div>
          <div className="auth-card__field">
            <Lock size={16} className="auth-card__field-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              required
            />
            <button
              type="button"
              className="auth-card__toggle-pw"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button type="submit" className="auth-card__submit">
            {isLogin ? 'Sign In' : 'Create Account'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-card__footer">
          <p>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button onClick={() => setIsLogin(!isLogin)} className="auth-card__switch">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        {isLogin && (
          <div className="auth-card__demo">
            <p className="auth-card__demo-title">Demo Accounts (password: wallzo123)</p>
            <div className="auth-card__demo-accounts">
              <button onClick={() => setForm({ name: '', email: 'bharath@wallzo.in', password: 'wallzo123' })}>
                🛡️ Super Admin
              </button>
              <button onClick={() => setForm({ name: '', email: 'admin@wallzo.in', password: 'wallzo123' })}>
                ⚙️ Admin
              </button>
              <button onClick={() => setForm({ name: '', email: 'user@wallzo.in', password: 'wallzo123' })}>
                👤 User
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

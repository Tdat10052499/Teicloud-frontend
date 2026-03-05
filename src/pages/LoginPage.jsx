import React, { useState } from 'react';
import { Mail, Lock, Github, ArrowRight, LayoutDashboard, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase'; // Đảm bảo file này đã cấu hình URL và Anon Key

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();

  // 1. XỬ LÝ ĐĂNG NHẬP BẰNG EMAIL & PASSWORD
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      // Việt hóa thông báo lỗi phổ biến
      let message = error.message;
      if (message === 'Invalid login credentials') {
        message = 'Email hoặc mật khẩu không chính xác.';
      } else if (message === 'Email not confirmed') {
        message = 'Vui lòng xác thực email trước khi đăng nhập.';
      }
      setErrorMsg(message);
      setLoading(false);
    } else {
      // Thành công: App.jsx sẽ tự nhận diện session và chuyển vào /app
      navigate('/app');
    }
  };

  // 2. XỬ LÝ ĐĂNG NHẬP GITHUB (OAuth)
  const handleGithubLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin + '/app',
      }
    });
    if (error) setErrorMsg("Lỗi GitHub: " + error.message);
  };

  // 3. XỬ LÝ ĐĂNG NHẬP GOOGLE (OAuth)
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        redirectTo: window.location.origin + '/app',
      }
    });
    if (error) setErrorMsg("Lỗi Google: " + error.message);
  };

  return (
    <div className="auth-layout">
      {/* Khối Logo thương hiệu TeiCloud */}
      <div style={{ position: 'absolute', top: '40px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
        <LayoutDashboard color="var(--tei-cyan)" size={32} />
        TeiCloud
      </div>

      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 className="auth-title">Chào mừng trở lại</h2>
          <p className="auth-subtitle">Đăng nhập để tiếp tục quản lý dự án của bạn.</p>
        </div>

        {/* CÁC NÚT ĐĂNG NHẬP MẠNG XÃ HỘI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button className="btn-social btn-github" onClick={handleGithubLogin}>
            <Github size={18} /> Tiếp tục với GitHub
          </button>
          
          <button className="btn-social btn-google" onClick={handleGoogleLogin}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 15.02 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Tiếp tục với Google
          </button>
        </div>

        <div className="auth-divider">hoặc sử dụng email</div>

        {/* BIỂU MẪU ĐĂNG NHẬP TRUYỀN THỐNG */}
        <form onSubmit={handleLogin}>
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--tei-error)', color: 'var(--tei-error)', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', textAlign: 'center' }}
            >
              {errorMsg}
            </motion.div>
          )}

          <div className="tei-form-group">
            <label className="tei-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input 
                type="email" 
                required 
                className="tei-input" 
                style={{ paddingLeft: '40px' }} 
                placeholder="teichi@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={loading}
              />
            </div>
          </div>

          <div className="tei-form-group" style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="tei-label">Mật khẩu</label>
              <Link to="/forgot-password" style={{ fontSize: '12px', textDecoration: 'none' }} className="auth-link">Quên mật khẩu?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input 
                type="password" 
                required 
                className="tei-input" 
                style={{ paddingLeft: '40px' }} 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="tei-btn" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Đăng nhập'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Chưa có tài khoản? <Link to="/register" className="auth-link">Đăng ký ngay</Link>
        </p>
      </motion.div>
    </div>
  );
}
import React, { useState } from 'react';
import { Mail, Lock, Github, ArrowRight, LayoutDashboard, Loader2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

export default function RegisterPage() {
  const [username, setUsername] = useState(''); // Thêm state cho Tên tài khoản
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(''); 

    // GỌI API SUPABASE ĐỂ TẠO TÀI KHOẢN (Kèm theo Metadata)
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          display_name: username, // Lưu tên tài khoản vào dữ liệu cá nhân của user
        }
      }
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      // Vì chúng ta đang tắt tính năng Confirm Email (như đã thống nhất), 
      // User sẽ được tự động đăng nhập và có session ngay lập tức.
      alert("🎉 Đăng ký thành công! Chào mừng bạn đến với TeiCloud.");
      navigate('/app'); // Chuyển thẳng vào Dashboard luôn cho xịn
    }
  };

  return (
    <div className="auth-layout">
      {/* Khối Logo ở ngoài Form */}
      <div style={{ position: 'absolute', top: '40px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
        <LayoutDashboard color="var(--tei-cyan)" size={32} />
        TeiCloud
      </div>

      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.3 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 className="auth-title">Tạo tài khoản mới</h2>
          <p className="auth-subtitle">Tham gia TeiCloud để trải nghiệm PaaS siêu tốc.</p>
        </div>

        <button className="btn-social btn-github">
          <Github size={18} /> Đăng ký nhanh với GitHub
        </button>
        <button className="btn-social btn-google">
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 15.02 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Đăng ký nhanh với Google
        </button>

        <div className="auth-divider">hoặc đăng ký bằng email</div>

        <form onSubmit={handleRegister}>
          
          {errorMsg && (
            <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--tei-error)', color: 'var(--tei-error)', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
              {errorMsg}
            </div>
          )}

          {/* TRƯỜNG NHẬP TÊN TÀI KHOẢN MỚI THÊM VÀO */}
          <div className="tei-form-group">
            <label className="tei-label">Tên tài khoản <span>*</span></label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input 
                type="text" 
                required 
                className="tei-input" 
                style={{ paddingLeft: '40px' }} 
                placeholder="teichi" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                disabled={loading} 
              />
            </div>
          </div>

          <div className="tei-form-group">
            <label className="tei-label">Địa chỉ Email <span>*</span></label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input 
                type="email" 
                required 
                className="tei-input" 
                style={{ paddingLeft: '40px' }} 
                placeholder="email@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={loading} 
              />
            </div>
          </div>

          <div className="tei-form-group" style={{ marginBottom: '30px' }}>
            <label className="tei-label">Tạo mật khẩu <span>*</span></label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input 
                type="password" 
                required 
                className="tei-input" 
                style={{ paddingLeft: '40px' }} 
                placeholder="Tối thiểu 6 ký tự" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                disabled={loading} 
              />
            </div>
          </div>

          <button type="submit" className="tei-btn" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Tạo tài khoản'}
            {!loading && <ArrowRight size={18} />}
          </button>
          
          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Bằng việc đăng ký, bạn đồng ý với Điều khoản dịch vụ của chúng tôi.
          </p>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Đã có tài khoản? <Link to="/login" className="auth-link">Đăng nhập</Link>
        </p>
      </motion.div>
    </div>
  );
}
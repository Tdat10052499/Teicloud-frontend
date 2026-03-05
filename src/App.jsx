import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Rocket, Globe, BookOpen, LayoutDashboard, User, LogOut, ChevronRight, Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { supabase } from './supabase'; 
import './index.css'; 

// Import các trang chức năng
import DeployPage from './pages/DeployPage';
import WebsitesPage from './pages/WebsitesPage';
import GuidePage from './pages/GuidePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

// ==========================================
// 1. LAYOUT CHO DASHBOARD (CÓ SIDEBAR & USER INFO)
// ==========================================
function DashboardLayout({ children, session }) {
  const navigate = useNavigate();

  // Trích xuất thông tin người dùng từ Session của Supabase
  const user = session?.user;
  const email = user?.email || 'Guest';
  // Ưu tiên lấy display_name từ metadata, nếu không có thì lấy phần đầu của email
  const displayName = user?.user_metadata?.display_name || email.split('@')[0];
  const avatarChar = displayName.charAt(0).toUpperCase();
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  // Hàm xử lý Đăng xuất
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <LayoutDashboard color="var(--tei-cyan)" size={28} />
          TeiCloud
        </div>
        
        {/* Menu Điều hướng chính */}
        <nav className="sidebar-nav">
          <NavLink to="/app" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <Rocket size={20} /> Deploy
          </NavLink>
          <NavLink to="/app/websites" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <Globe size={20} /> Websites
          </NavLink>
          <NavLink to="/app/guide" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <BookOpen size={20} /> Hướng dẫn
          </NavLink>
        </nav>

        {/* --- KHU VỰC ACCOUNT (SIDEBAR FOOTER) --- */}
        <div className="sidebar-footer">
          <button className="user-profile-btn">
            <div className="user-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}} />
              ) : (
                avatarChar
              )}
            </div>
            <div className="user-info">
              <div className="user-name">{displayName}</div>
              <div className="user-email">{email}</div>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </button>

          {/* Menu sổ sang phải khi di chuột vào */}
          <div className="user-dropdown">
            <NavLink to="/app/profile" className="dropdown-item" style={{ textDecoration: 'none' }}>
              <User size={16} /> Thông tin tài khoản
            </NavLink>
            <button className="dropdown-item danger" onClick={handleLogout}>
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
        </div>
      </aside>
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

// ==========================================
// 2. HỆ THỐNG ĐIỀU HƯỚNG VÀ BẢO MẬT (ROUTE GUARD)
// ==========================================
function AppRoutes() {
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra phiên đăng nhập hiện tại khi khởi chạy App
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Lắng nghe các sự kiện thay đổi trạng thái Auth (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Màn hình loading khi đang xác thực
  if (loading) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems:'center', justifyContent: 'center', backgroundColor: 'var(--dark-bg)'}}>
        <Loader2 size={32} className="animate-spin" color="var(--tei-cyan)" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* LUỒNG ĐĂNG NHẬP / ĐĂNG KÝ */}
        <Route path="/login" element={session ? <Navigate to="/app" replace /> : <LoginPage />} />
        <Route path="/register" element={session ? <Navigate to="/app" replace /> : <RegisterPage />} />

        {/* LUỒNG DASHBOARD (BẢO VỆ BỞI SESSION) */}
        <Route path="/app/*" element={
          session ? (
            <DashboardLayout session={session}>
              <Routes>
                <Route path="/" element={<DeployPage />} />
                <Route path="/websites" element={<WebsitesPage />} />
                <Route path="/guide" element={<GuidePage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </DashboardLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        {/* Mặc định đẩy về Login nếu không khớp Route nào */}
        <Route path="*" element={<Navigate to={session ? "/app" : "/login"} replace />} />

      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
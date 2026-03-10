import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Rocket, Globe, BookOpen, LayoutDashboard, User, LogOut, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from './supabase'; 
import './index.css'; 

import CliAuthPage from './pages/CliAuthPage';
import DeployPage from './pages/DeployPage';
import WebsitesPage from './pages/WebsitesPage';
import GuidePage from './pages/GuidePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

function DashboardLayout({ children, session }) {
  const navigate = useNavigate();
  const location = useLocation();

  const user = session?.user;
  const email = user?.email || 'Guest';
  const displayName = user?.user_metadata?.display_name || email.split('@')[0];
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const avatarChar = displayName.charAt(0).toUpperCase();

  // Tự động mở menu Hướng dẫn nếu đường dẫn đang nằm trong khu vực /guide
  const [isGuideOpen, setIsGuideOpen] = useState(location.pathname.includes('/app/guide'));

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
        
        <nav className="sidebar-nav">
          <NavLink to="/app" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <Rocket size={20} /> Deploy
          </NavLink>
          
          <NavLink to="/app/websites" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <Globe size={20} /> Websites
          </NavLink>
          
          {/* MENU HƯỚNG DẪN DẠNG DROPDOWN */}
          <div className="nav-group">
            <div 
              className={`nav-link ${location.pathname.includes('/app/guide') ? 'active' : ''}`}
              onClick={() => setIsGuideOpen(!isGuideOpen)}
              style={{ cursor: 'pointer' }}
            >
              <BookOpen size={20} /> Hướng dẫn
              <ChevronDown 
                size={16} 
                style={{ 
                  marginLeft: 'auto', 
                  transform: isGuideOpen ? 'rotate(180deg)' : 'rotate(0)', 
                  transition: 'transform 0.3s ease' 
                }} 
              />
            </div>
            
            <AnimatePresence>
              {isGuideOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="sub-nav-list">
                    <NavLink to="/app/guide/overview" className={({ isActive }) => isActive ? "sub-nav-link active" : "sub-nav-link"}>
                      Tổng quan
                    </NavLink>
                    <NavLink to="/app/guide/ui" className={({ isActive }) => isActive ? "sub-nav-link active" : "sub-nav-link"}>
                      Deploy bằng UI
                    </NavLink>
                    <NavLink to="/app/guide/cli" className={({ isActive }) => isActive ? "sub-nav-link active" : "sub-nav-link"}>
                      Deploy bằng Terminal
                    </NavLink>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* ... (Phần sidebar-footer giữ nguyên như cũ) ... */}
        <div className="sidebar-footer">
          <button className="user-profile-btn">
            <div className="user-avatar" style={avatarUrl ? { background: 'none' } : {}}>
              {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}} /> : <span>{avatarChar}</span>}
            </div> 
            <div className="user-info">
              <div className="user-name">{displayName}</div>
              <div className="user-email">{email}</div>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </button>
          <div className="user-dropdown">
            <NavLink to="/app/profile" className="dropdown-item"><User size={16} /> Thông tin tài khoản</NavLink>
            <button className="dropdown-item danger" onClick={handleLogout}><LogOut size={16} /> Đăng xuất</button>
          </div>
        </div>
      </aside>
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="auth-layout" style={{ background: 'var(--dark-bg)' }}><Loader2 size={32} className="animate-spin" color="var(--tei-cyan)" /></div>;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={session ? <Navigate to="/app" replace /> : <LoginPage />} />
        <Route path="/register" element={session ? <Navigate to="/app" replace /> : <RegisterPage />} />
        <Route path="/cli-auth" element={<CliAuthPage />} />

        <Route path="/app/*" element={ session ? (
            <DashboardLayout session={session}>
              <Routes>
                <Route path="/" element={<DeployPage />} />
                <Route path="/websites" element={<WebsitesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                
                {/* HỆ THỐNG ROUTE CHO GUIDE */}
                <Route path="/guide" element={<Navigate to="/app/guide/overview" replace />} />
                <Route path="/guide/:sectionId" element={<GuidePage />} />
              </Routes>
            </DashboardLayout>
          ) : <Navigate to="/login" replace />
        } />
        <Route path="*" element={<Navigate to={session ? "/app" : "/login"} replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() { return <Router><AppRoutes /></Router>; }
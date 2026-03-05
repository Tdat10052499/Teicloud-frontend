import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Rocket, Globe, BookOpen, LayoutDashboard } from 'lucide-react';
import DeployPage from './pages/DeployPage';
import WebsitesPage from './pages/WebsitesPage';
import GuidePage from './pages/GuidePage';

function App() {
  return (
    <Router>
      <div className="app-layout">
        
        {/* --- THANH ĐIỀU HƯỚNG BÊN TRÁI (SIDEBAR) --- */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <LayoutDashboard color="var(--tei-cyan)" size={28} />
            TeiCloud
          </div>
          
          <nav className="sidebar-nav">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <Rocket size={20} /> Deploy
            </NavLink>
            
            <NavLink to="/websites" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <Globe size={20} /> Websites
            </NavLink>
            
            <NavLink to="/guide" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <BookOpen size={20} /> Hướng dẫn
            </NavLink>
          </nav>
        </aside>

        {/* --- KHU VỰC NỘI DUNG CHÍNH (MAIN CONTENT) --- */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DeployPage />} />
            <Route path="/websites" element={<WebsitesPage />} />
            <Route path="/guide" element={<GuidePage />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;
import React, { useState, useEffect, useRef } from 'react';
import { Globe, Plus, Search, ExternalLink, MoreVertical, Trash2, Loader2, Zap, Copy, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function WebsitesPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // State cho các tính năng quản lý
  const [openMenuId, setOpenMenuId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  
  // State cho Modal Xóa dự án
  const [deleteModal, setDeleteModal] = useState({ show: false, project: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Đóng menu khi click ra ngoài
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Lỗi lấy danh sách:', error.message);
    } finally {
      setLoading(false);
    }
  }

  // Chức năng Copy URL
  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    setToastMsg('Đã copy đường dẫn!');
    setOpenMenuId(null);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Chức năng Xóa dự án
  const handleDeleteProject = async () => {
    if (!deleteModal.project) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', deleteModal.project.id);

      if (error) throw error;
      
      // Xóa thành công, cập nhật lại danh sách UI
      setProjects(projects.filter(p => p.id !== deleteModal.project.id));
      setToastMsg('Đã xóa dự án thành công.');
      setTimeout(() => setToastMsg(''), 3000);
    } catch (error) {
      alert("Lỗi khi xóa: " + error.message);
    } finally {
      setIsDeleting(false);
      setDeleteModal({ show: false, project: null });
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingBottom: '50px' }}>
      
      {/* HEADER */}
      <div className="page-header-flex">
        <div>
          <h2 className="page-title">Dự án của bạn</h2>
          <p className="page-subtitle">Quản lý và theo dõi trạng thái các website đang thực thi.</p>
        </div>
        <button className="tei-btn btn-new-project" onClick={() => navigate('/app')}>
          <Plus size={18} /> Deploy dự án mới
        </button>
      </div>

      {/* THANH TÌM KIẾM & THÔNG BÁO TOAST */}
      <div className="controls-bar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Tìm kiếm dự án..." 
            className="tei-input search-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <AnimatePresence>
          {toastMsg && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="toast-notification">
              <CheckCircle2 size={16} /> {toastMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

{/* DANH SÁCH DỰ ÁN */}
      {loading ? (
        <div className="loading-container"><Loader2 className="animate-spin" size={40} color="var(--tei-cyan)" /></div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrapper">
            <Globe size={48} color="var(--tei-cyan)" style={{ opacity: 0.5 }} />
          </div>
          <h3>Không gian làm việc trống</h3>
          <p className="page-subtitle" style={{ maxWidth: '400px', margin: '0 auto 24px auto' }}>
            Bạn chưa có website nào hoạt động. Hãy đưa mã nguồn của bạn lên hệ thống đám mây ngay hôm nay!
          </p>
          <button className="tei-btn" onClick={() => navigate('/app')} style={{ width: 'auto', padding: '12px 28px' }}>
            <Plus size={18} /> Triển khai dự án đầu tiên
          </button>
        </div>
      ) : (
        <div className="project-grid" ref={menuRef}>
          {filteredProjects.map((project) => (
            <div key={project.id} className="project-card">
              
              {/* PHẦN MỚI: COVER ẢNH CHỤP WEBSITE */}
              <div className="project-card-cover">
                {/* Gọi API Thum.io để lấy ảnh chụp website */}
                {/* Dùng API mShots của WordPress hoàn toàn miễn phí */}
                <img 
                  src={`https://s.wordpress.com/mshots/v1/${encodeURIComponent(project.url)}?w=800`} 
                  alt={`Screenshot of ${project.name}`}
                  className="project-screenshot"
                  onError={(e) => {
                    // Nếu web chưa load kịp hoặc lỗi, hiển thị nền dự phòng
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                {/* Nền dự phòng (Fallback) */}
                <div className="fallback-cover" style={{ display: 'none' }}>
                  <Globe size={40} color="var(--tei-cyan)" opacity={0.3} />
                </div>

                {/* Nút 3 chấm được đưa lên góc trên của ảnh */}
                <div className="menu-trigger-container">
                  <button className="icon-btn cover-menu-btn" onClick={() => setOpenMenuId(openMenuId === project.id ? null : project.id)}>
                    <MoreVertical size={18} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {openMenuId === project.id && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card-dropdown">
                        <button className="dropdown-action" onClick={() => window.open(project.url, '_blank')}>
                          <ExternalLink size={14} /> Truy cập Website
                        </button>
                        <button className="dropdown-action" onClick={() => copyToClipboard(project.url)}>
                          <Copy size={14} /> Copy đường dẫn
                        </button>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-action danger" onClick={() => { setDeleteModal({ show: true, project }); setOpenMenuId(null); }}>
                          <Trash2 size={14} /> Xóa dự án
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* THÔNG TIN DỰ ÁN NẰM BÊN DƯỚI */}
              <div className="project-card-info">
                <div className="project-card-body">
                  <h3>{project.name}</h3>
                  <a href={project.url} target="_blank" rel="noreferrer" className="project-url">
                    {project.url.replace('https://', '')}
                  </a>
                </div>

                <div className="project-card-footer">
                  <span className={`status-badge ${project.status}`}>
                    <span className="status-dot"></span>
                    {project.status.toUpperCase()}
                  </span>
                  <span className="project-date">
                    {new Date(project.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA */}
      <AnimatePresence>
        {deleteModal.show && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="tei-modal">
              <div className="modal-icon warning"><AlertTriangle size={24} /></div>
              <h3>Xóa dự án này?</h3>
              <p>Bạn đang chuẩn bị xóa dự án <b>{deleteModal.project?.name}</b>. Hành động này không thể hoàn tác và website sẽ ngừng hoạt động ngay lập tức.</p>
              
              <div className="modal-actions">
                <button className="tei-btn btn-outline" onClick={() => setDeleteModal({ show: false, project: null })} disabled={isDeleting}>Hủy bỏ</button>
                <button className="tei-btn btn-danger" onClick={handleDeleteProject} disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />} Xóa vĩnh viễn
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
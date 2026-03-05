import React from 'react';
import { Clock } from 'lucide-react';

export default function WebsitesPage() {
  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Tiêu đề trang */}
      <h2 className="page-title">Quản lý Website</h2>
      <p className="page-subtitle">Danh sách các dự án bạn đã triển khai trên TeiCloud.</p>

      {/* Card Website mẫu */}
      <div className="tei-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
        <div>
          <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '8px' }}>my-awesome-web</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
            <Clock size={14} /> Deploy 2 giờ trước
          </div>
        </div>
        <div>
          <span className="tei-status success" style={{ padding: '6px 12px', marginTop: 0, fontWeight: 'bold' }}>Active</span>
        </div>
      </div>
    </div>
  );
}
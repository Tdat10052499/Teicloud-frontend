import React from 'react';
import { motion } from 'framer-motion';

export default function GuidePage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{ maxWidth: '800px' }}
    >
      <h2 className="page-title">Hướng dẫn sử dụng</h2>
      <p className="page-subtitle">Làm quen với hệ thống TeiCloud PaaS chỉ trong 3 bước.</p>

      <div className="tei-card">
        <h3 style={{ color: 'var(--tei-cyan)', marginBottom: '12px', fontSize: '18px' }}>1. Chuẩn bị mã nguồn</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
          Hệ thống hỗ trợ deploy các trang web tĩnh hoặc các framework đã build. Bạn cần nén toàn bộ mã nguồn thành một file <strong style={{ color: '#fff' }}>.zip</strong>.
        </p>

        <h3 style={{ color: 'var(--tei-cyan)', marginBottom: '12px', fontSize: '18px' }}>2. Đặt tên dự án</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
          Tên dự án sẽ trở thành đường dẫn website của bạn. Chỉ được phép chứa chữ cái thường, số và dấu gạch ngang.
        </p>

        <h3 style={{ color: 'var(--tei-cyan)', marginBottom: '12px', fontSize: '18px' }}>3. Theo dõi tiến trình</h3>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Quá trình khởi tạo và đồng bộ mã nguồn lên mạng lưới toàn cầu của Cloudflare sẽ mất khoảng <strong style={{ color: 'var(--tei-success)'}}>30 đến 60 giây</strong>.
        </p>
      </div>
    </motion.div>
  );
}
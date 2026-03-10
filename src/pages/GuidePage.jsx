import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Terminal, MousePointerClick, Info, Copy, Check, BookOpen } from 'lucide-react';

// Component hiển thị khối mã nguồn với tính năng Copy
const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="doc-code-block">
      <div className="code-header">
        <span className="code-lang">{language}</span>
        <button className="code-copy-btn" onClick={handleCopy}>
          {copied ? <Check size={14} color="var(--tei-success)" /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
};

export default function GuidePage() {
  const { sectionId } = useParams();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="guide-container">
      
      {/* 1. TỔNG QUAN */}
      {sectionId === 'overview' && (
        <div className="doc-content">
          <div className="doc-badge"><BookOpen size={16} /> Giới thiệu</div>
          <h1 className="doc-title">Tổng quan về TeiCloud</h1>
          <p className="doc-text">
            TeiCloud là nền tảng Platform as a Service (PaaS) được thiết kế tối ưu, giúp các lập trình viên 
            triển khai mã nguồn web tĩnh (HTML/CSS/JS, React, Vue) lên mạng lưới Edge toàn cầu một cách nhanh chóng và tự động.
          </p>
          
          <div className="doc-callout info">
            <Info size={20} className="callout-icon" />
            <div>
              <strong>Lưu ý quan trọng:</strong> Hiện tại hệ thống hỗ trợ tốt nhất cho các dự án Frontend tĩnh. Bạn có thể chọn triển khai nhanh chóng qua giao diện (UI) hoặc sử dụng công cụ dòng lệnh (TeiCloud CLI) dành cho quy trình làm việc chuyên nghiệp.
            </div>
          </div>
        </div>
      )}

      {/* 2. HƯỚNG DẪN DEPLOY BẰNG UI */}
      {sectionId === 'ui' && (
        <div className="doc-content">
          <div className="doc-badge"><MousePointerClick size={16} /> Hướng dẫn Giao diện</div>
          <h1 className="doc-title">Triển khai bằng Drag & Drop</h1>
          <p className="doc-text">Phương pháp đơn giản nhất để đưa dự án của bạn lên mạng lưới là sử dụng giao diện Kéo & Thả (Drag and Drop) trực tiếp tại trang Deploy.</p>
          
          <h3 className="doc-heading">Các bước thực hiện</h3>
          <ol className="doc-steps">
            <li>
              <strong>Chuẩn bị mã nguồn:</strong> Gom tất cả các file trong thư mục dự án của bạn (chắc chắn phải có file <code>index.html</code> ở cấp ngoài cùng) và nén chúng lại thành một file <code>.zip</code>.
            </li>
            <li>
              <strong>Truy cập trang Deploy:</strong> Chuyển sang thẻ Deploy trên thanh menu bên trái.
            </li>
            <li>
              <strong>Cấu hình và Tải lên:</strong> Nhập tên định danh cho dự án của bạn (chỉ dùng chữ thường và dấu gạch ngang). Kéo thả file <code>.zip</code> vừa tạo vào khu vực tải lên.
            </li>
            <li>
              <strong>Thực thi:</strong> Nhấn <b>Chạy Pipeline</b> và chờ hệ thống xử lý, giải nén và cấu hình SSL tự động trong khoảng 60 giây.
            </li>
          </ol>
        </div>
      )}

      {/* 3. HƯỚNG DẪN DEPLOY BẰNG TERMINAL (CLI) */}
      {sectionId === 'cli' && (
        <div className="doc-content">
          <div className="doc-badge"><Terminal size={16} /> Hướng dẫn CLI</div>
          <h1 className="doc-title">Triển khai bằng TeiCloud CLI</h1>
          <p className="doc-text">
            Dành cho các nhà phát triển muốn tích hợp TeiCloud vào quy trình làm việc trên Terminal hoặc hệ thống CI/CD, bộ công cụ <b>TeiCloud CLI</b> được xây dựng trên nền tảng Node.js sẽ là sự lựa chọn tối ưu.
          </p>

          <h3 className="doc-heading">1. Cài đặt công cụ</h3>
          <p className="doc-text">Bạn cần cài đặt Node.js trên máy tính, sau đó mở Terminal và chạy lệnh sau để cài đặt TeiCloud CLI toàn cầu:</p>
          <CodeBlock language="bash" code="npm install -g teicloud-cli" />

          <h3 className="doc-heading">2. Xác thực tài khoản</h3>
          <p className="doc-text">Trước khi triển khai, bạn cần đăng nhập tài khoản của mình thông qua CLI:</p>
          <CodeBlock language="bash" code="teicloud login" />
          <p className="doc-text">Lệnh này sẽ mở một cửa sổ trình duyệt để bạn xác nhận cấp quyền cho CLI.</p>

          <h3 className="doc-heading">3. Triển khai dự án</h3>
          <p className="doc-text">Di chuyển Terminal vào thư mục chứa mã nguồn dự án của bạn và chạy lệnh triển khai:</p>
          <CodeBlock language="bash" code="teicloud deploy" />
          
          <div className="doc-callout info" style={{ marginTop: '24px' }}>
            <Info size={20} className="callout-icon" />
            <div>
              Hệ thống sẽ tự động đóng gói dự án của bạn tại máy local, đẩy lên máy chủ backend của TeiCloud và trả về một đường dẫn (URL) trực tiếp ngay trên Terminal.
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}
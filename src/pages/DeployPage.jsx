import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, FileCode2, PlayCircle, FolderArchive, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const BACKEND_URL = "http://localhost:3000"; 

export default function DeployPage() {
  const [file, setFile] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ text: '', type: '' });
  const [liveUrl, setLiveUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false); // Trạng thái kéo thả

  // --- CÁC HÀM XỬ LÝ KÉO THẢ (DRAG & DROP) ---
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true); // Đổi màu khung khi kéo file vào
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false); // Trả lại màu cũ khi kéo file ra
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Lấy file đầu tiên được thả vào
    const droppedFile = e.dataTransfer.files[0];
    
    // Kiểm tra xem có đúng là file .zip không
    if (droppedFile && droppedFile.name.endsWith('.zip')) {
      setFile(droppedFile);
    } else {
      alert("Vui lòng chỉ kéo thả định dạng file .zip!");
    }
  };

  // --- HÀM DEPLOY ---
  const handleDeploy = async () => {
    if (!projectName.trim()) return alert("Vui lòng nhập tên dự án!");
    if (!file) return alert("Vui lòng cung cấp mã nguồn (.zip)!");

    setLoading(true);
    setStatus({ text: '>_ Đang thiết lập môi trường...', type: 'info' });
    setLiveUrl('');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectName', projectName.trim().toLowerCase().replace(/\s+/g, '-'));

    try {
      await axios.post(`${BACKEND_URL}/upload`, formData);
      setStatus({ text: '>_ Đang tải mã nguồn lên hệ thống...', type: 'info' });
      startPolling();
    } catch (error) {
      setStatus({ text: `[LỖI]: ${error.response?.data?.error || error.message}`, type: 'error' });
      setLoading(false);
    }
  };

  const startPolling = () => {
    const safeName = projectName.trim().toLowerCase().replace(/\s+/g, '-');
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/status/${safeName}`);
        
        if (res.data.status === 'in_progress') {
          setStatus({ text: '>_ Building -> Testing -> Publishing...', type: 'info' });
        } else if (res.data.status === 'completed' && res.data.conclusion === 'success') {
          setLiveUrl(res.data.url);
          setStatus({ text: '>_ Triển khai thành công!', type: 'success' });
          setLoading(false);
          clearInterval(interval);
        } else if (res.data.conclusion === 'failure') {
          setStatus({ text: '[LỖI]: Quá trình Build thất bại.', type: 'error' });
          setLoading(false);
          clearInterval(interval);
        }
      } catch (e) {}
    }, 5000);
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <h2 className="page-title">Deploy Website</h2>
      <p className="page-subtitle">Cấu hình và triển khai dự án của bạn lên mạng lưới toàn cầu.</p>

      <div className="tei-card">
        <div className="tei-header">
          <FileCode2 size={18} color="var(--tei-cyan)" /> Package Configuration
        </div>

        <div className="tei-form-group">
          <label className="tei-label">Project Name <span>*</span></label>
          <input 
            type="text" 
            className="tei-input"
            placeholder="/ten-du-an-cua-ban"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <div className="tei-hint">ⓘ Đường dẫn URL chính thức (chỉ dùng chữ thường, số và dấu gạch ngang)</div>
        </div>

        <div className="tei-form-group" style={{ marginBottom: 0 }}>
          <label className="tei-label">Source Code (.zip) <span>*</span></label>
          
          {/* KHU VỰC KÉO THẢ */}
          <label 
            className={`tei-file-box ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <span className="tei-file-text" style={{ color: file ? 'var(--tei-success)' : isDragging ? 'var(--tei-success)' : '' }}>
              {file ? file.name : isDragging ? 'Thả file vào đây...' : 'Kéo thả file .zip vào đây (hoặc click)'}
            </span>
            <FolderArchive size={20} color={isDragging || file ? "var(--tei-success)" : "var(--tei-cyan)"} />
            
            {/* Thẻ input được ẩn đi, vẫn giữ để làm phương án dự phòng nếu người dùng cố tình click */}
            <input type="file" accept=".zip" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
          </label>

        </div>
      </div>

      <div className="tei-card highlight-card">
        <div className="tei-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlayCircle size={18} color="var(--tei-success)" /> One-Click Workflow
          </div>
        </div>
        <button onClick={handleDeploy} disabled={loading} className="tei-btn">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {loading ? 'Processing...' : 'Build -> Test -> Publish >'}
        </button>
      </div>

      {status.text && (
        <div className={`tei-status ${status.type}`}>
          {status.type === 'info' && <Loader2 size={18} className="animate-spin" />}
          {status.type === 'success' && <CheckCircle2 size={18} />}
          {status.type === 'error' && <XCircle size={18} />}
          {status.text}
        </div>
      )}

      {liveUrl && (
        <div style={{ marginTop: '15px', padding: '16px', backgroundColor: 'var(--dark-bg)', border: '1px dashed var(--tei-success)', borderRadius: '8px' }}>
          <span style={{ color: 'var(--tei-success)', fontFamily: 'var(--font-mono)', fontSize: '14px', marginRight: '8px' }}>URL:</span>
          <a href={liveUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)', fontWeight: 'bold', textDecoration: 'none' }}>
            {liveUrl}
          </a>
        </div>
      )}

    </div>
  );
}
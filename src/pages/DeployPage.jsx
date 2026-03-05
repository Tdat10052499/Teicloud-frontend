import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Sparkles, FileCode2, PlayCircle, FolderArchive, Loader2, CheckCircle2, XCircle, Terminal, Ban, Globe, ArrowRight, BadgeCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';

const BACKEND_URL = "http://localhost:3000"; 

export default function DeployPage() {
  const [file, setFile] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState([]);
  const [liveUrl, setLiveUrl] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // CẬP NHẬT: Khởi tạo bộ đếm 60 giây
  const [countdown, setCountdown] = useState(60);
  const [isLinkReady, setIsLinkReady] = useState(false);

  const terminalRef = useRef(null);
  const pipelineRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const abortControllerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Logic đếm ngược 60s
  useEffect(() => {
    let timer;
    if (liveUrl && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsLinkReady(true);
    }
    return () => clearInterval(timer);
  }, [liveUrl, countdown]);

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [logs]);

  const addLog = (text, type = 'normal') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, { time, text, type }]);
  };

  const saveProjectToSupabase = async (finalUrl) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('projects').insert([{ 
        name: projectName.trim(), 
        url: finalUrl, 
        status: 'active',
        user_id: user.id 
      }]);
      addLog('Đã đồng bộ dự án thành công!', 'success');
    } catch (e) { addLog('Lỗi lưu Database', 'error'); }
  };

  const handleDeploy = async () => {
    if (!projectName.trim() || !file) return alert("Vui lòng nhập tên dự án và chọn file!");
    
    setIsDeploying(true);
    setHasError(false);
    setLiveUrl('');
    setCountdown(60); // CẬP NHẬT: Reset về 60s mỗi khi deploy mới
    setIsLinkReady(false);
    setLogs([]);
    setCurrentStep(1);
    abortControllerRef.current = new AbortController();

    addLog('Khởi chạy TeiCloud Pipeline...', 'info');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectName', projectName.trim().toLowerCase().replace(/\s+/g, '-'));

    try {
      await axios.post(`${BACKEND_URL}/upload`, formData, { signal: abortControllerRef.current.signal });
      setCurrentStep(2);
      addLog('Upload & Giải nén thành công!', 'success');
      setCurrentStep(3);
      addLog('Đang triển khai lên Cloudflare Edge...', 'info');
      startPolling();
    } catch (error) {
      setHasError(true);
      setCurrentStep(0);
      addLog('Lỗi Pipeline: ' + error.message, 'error');
    }
  };

  const startPolling = () => {
    const safeName = projectName.trim().toLowerCase().replace(/\s+/g, '-');
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/status/${safeName}`);
        if (res.data.status === 'completed' && res.data.conclusion === 'success') {
          clearInterval(pollingIntervalRef.current);
          setCurrentStep(4);
          setLiveUrl(res.data.url);
          await saveProjectToSupabase(res.data.url);
        } else if (res.data.conclusion === 'failure') {
          setHasError(true);
          clearInterval(pollingIntervalRef.current);
        }
      } catch (e) {}
    }, 5000);
  };

  const StepIcon = ({ num }) => {
    if (currentStep > num || currentStep === 4) return <CheckCircle2 size={16} color="var(--tei-success)" />;
    if (currentStep === num && !hasError) return <Loader2 size={16} className="animate-spin" color="var(--tei-cyan)" />;
    return <div className="step-num">{num}</div>;
  };

  return (
    <div className="deploy-container">
      <h2 className="page-title">Deploy Website</h2>
      
      <div className="tei-card">
        <div className="tei-header"><FileCode2 size={18} color="var(--tei-cyan)" /> Cấu hình dự án</div>
        <div className="tei-form-group">
          <label className="tei-label">Project Name</label>
          <input 
            type="text" 
            className="tei-input" 
            placeholder="ten-du-an-cua-ban"
            value={projectName} 
            onChange={(e) => setProjectName(e.target.value)} 
            disabled={isDeploying} 
          />
        </div>
        <div className="tei-form-group">
          <label className="tei-label">Source Code (.zip)</label>
          <div 
            className={`tei-file-box ${file ? 'active' : ''}`}
            onClick={() => !isDeploying && fileInputRef.current.click()}
          >
            <span>{file ? file.name : 'Click để chọn file .zip'}</span>
            <FolderArchive size={20} color={file ? "var(--tei-success)" : "var(--tei-cyan)"} />
            <input type="file" ref={fileInputRef} hidden accept=".zip" onChange={(e) => setFile(e.target.files[0])} />
          </div>
        </div>
        <button onClick={handleDeploy} disabled={isDeploying} className="tei-btn" style={{ marginTop: '20px' }}>
          {isDeploying ? <Loader2 className="animate-spin" /> : <Sparkles />} Chạy Pipeline
        </button>
      </div>

      {isDeploying && (
        <div className="tei-card pipeline-container" ref={pipelineRef}>
          <div className="tei-header"><Terminal size={18} /> Deployment Pipeline</div>
          
          <div className="pipeline-layout">
            <div className="pipeline-stepper">
              <div className={`step-item ${currentStep >= 1 ? 'active' : ''}`}><StepIcon num={1} /> <span>Khởi tạo</span></div>
              <div className={`step-item ${currentStep >= 2 ? 'active' : ''}`}><StepIcon num={2} /> <span>Đóng gói</span></div>
              <div className={`step-item ${currentStep >= 3 ? 'active' : ''}`}><StepIcon num={3} /> <span>Triển khai</span></div>
              <div className={`step-item ${currentStep === 4 ? 'active' : ''}`}><StepIcon num={4} /> <span>Hoàn tất</span></div>
            </div>

            <div className="terminal-box" ref={terminalRef}>
              {logs.map((log, i) => <div key={i} className={`terminal-line ${log.type}`}>{log.text}</div>)}
            </div>
          </div>

          <AnimatePresence>
            {liveUrl && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className={`final-status-card ${isLinkReady ? 'ready' : 'preparing'}`}
              >
                <div className="status-header">
                  {isLinkReady ? <BadgeCheck color="var(--tei-success)" size={24} /> : <Loader2 className="animate-spin" color="var(--tei-cyan)" size={24} />}
                  <span>{isLinkReady ? 'Website đã sẵn sàng!' : 'Đang tối ưu hóa mạng lưới toàn cầu...'}</span>
                </div>

                <div className="status-body">
                  <div className="url-display">
                    <Globe size={16} /> <span>{liveUrl}</span>
                  </div>
                  
                  {!isLinkReady ? (
                    <div className="hold-timer">
                      <div className="timer-ring">
                        <svg viewBox="0 0 36 36">
                          <path className="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path 
                            className="ring-progress" 
                            strokeDasharray={`${(countdown / 60) * 100}, 100`} 
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                          />
                        </svg>
                        <span className="timer-num">{countdown}s</span>
                      </div>
                      <p>Vui lòng đợi 60 giây để hệ thống kích hoạt SSL và lan tỏa DNS đến các máy chủ Edge trên toàn thế giới.</p>
                    </div>
                  ) : (
                    <div className="ready-actions">
                      <a href={liveUrl} target="_blank" rel="noreferrer" className="tei-btn btn-visit">
                        Truy cập ngay <ArrowRight size={18} />
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { Loader2, Terminal, CheckCircle } from 'lucide-react';

export default function CliAuthPage() {
  const [searchParams] = useSearchParams();
  const cliPort = searchParams.get('port'); // Lấy port mà CLI gửi lên (VD: 3456)
  
  const [status, setStatus] = useState('Đang kiểm tra phiên đăng nhập...');

  useEffect(() => {
    if (!cliPort) {
      setStatus('Lỗi: Không tìm thấy Port kết nối từ CLI.');
      return;
    }

    checkAuthAndRedirect();
  }, [cliPort]);

  const checkAuthAndRedirect = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      // Nếu chưa đăng nhập web, chuyển hướng ra trang Login (nhớ đính kèm port để quay lại)
      window.location.href = `/login?redirect=/cli-auth?port=${cliPort}`;
      return;
    }

    setStatus('Đang truyền dữ liệu xác thực về Terminal...');

    // Lấy Access Token của Supabase
    const token = session.access_token;
    const email = session.user.email;

    // GỌI NGƯỢC VỀ SERVER CỦA CLI ĐANG CHỜ Ở LOCALHOST
    window.location.href = `http://127.0.0.1:${cliPort}/callback?token=${token}&email=${email}`;
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--dark-bg)', color: '#fff' }}>
      <Terminal size={48} color="var(--tei-cyan)" style={{ marginBottom: '20px' }} />
      <h2>Xác thực TeiCloud CLI</h2>
      <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>{status}</p>
      
      {status.includes('Đang truyền') && (
        <Loader2 className="animate-spin" size={24} color="var(--tei-cyan)" style={{ marginTop: '20px' }} />
      )}
    </div>
  );
}
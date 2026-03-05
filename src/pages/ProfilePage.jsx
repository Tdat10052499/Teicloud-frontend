import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Camera, Save, Loader2, Fingerprint, Globe, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../supabase';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userData, setUserData] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [newName, setNewName] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef();

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserData(user);
        setNewName(user.user_metadata?.display_name || '');
        // Ưu tiên: Ảnh upload > Ảnh provider (Google/Github)
        setAvatarUrl(user.user_metadata?.avatar_url || user.user_metadata?.picture);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  // Hàm xử lý Upload ảnh lên Supabase Storage
  async function uploadAvatar(event) {
    try {
      setUpdating(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${userData.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload file lên bucket 'avatars'
      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Lấy URL công khai
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Cập nhật Metadata của User
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setMessage({ text: 'Cập nhật ảnh đại diện thành công!', type: 'success' });
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setUpdating(false);
    }
  }

  async function handleUpdateName(e) {
    e.preventDefault();
    setUpdating(true);
    const { error } = await supabase.auth.updateUser({
      data: { display_name: newName }
    });
    if (error) setMessage({ text: error.message, type: 'error' });
    else setMessage({ text: 'Đã cập nhật tên hiển thị!', type: 'success' });
    setUpdating(false);
  }

  if (loading) return <div className="loading-container"><Loader2 className="animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="profile-container">
      <h2 className="page-title">Cài đặt tài khoản</h2>
      
      <div className="profile-grid">
        {/* SECTION 1: AVATAR & IDENTITY */}
        <div className="tei-card profile-sidebar">
          <div className="avatar-wrapper">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="main-avatar" />
            ) : (
              <div className="main-avatar-placeholder">{newName?.charAt(0) || 'U'}</div>
            )}
            <button className="change-avatar-btn" onClick={() => fileInputRef.current.click()} disabled={updating}>
              <Camera size={16} />
            </button>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={uploadAvatar} />
          </div>
          <h3 style={{ marginTop: '15px', textAlign: 'center' }}>{newName || 'User'}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>ID: {userData?.id.slice(0, 8)}...</p>
        </div>

        {/* SECTION 2: SETTINGS FORM */}
        <div className="tei-card profile-main">
          <div className="tei-header"><Fingerprint size={18} /> Thông tin cá nhân</div>
          
          <form onSubmit={handleUpdateName}>
            {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}
            
            <div className="tei-form-group">
              <label className="tei-label">Địa chỉ Email</label>
              <input type="text" className="tei-input disabled" value={userData?.email} disabled />
            </div>

            <div className="tei-form-group">
              <label className="tei-label">Tên hiển thị</label>
              <input type="text" className="tei-input" value={newName} onChange={e => setNewName(e.target.value)} />
            </div>

            <button type="submit" className="tei-btn" disabled={updating}>
              {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Lưu thay đổi
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
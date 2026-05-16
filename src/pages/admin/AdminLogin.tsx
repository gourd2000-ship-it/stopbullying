import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

// For MVP, we use a simple hardcoded password. In production, use env vars.
const ADMIN_PASSWORD = 'admin'; // Replace with process.env.REACT_APP_ADMIN_PASSWORD ideally

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('admin_auth', 'true');
      navigate('/admin/dashboard');
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="admin-body" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="admin-card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'var(--color-admin-primary)', padding: '16px', borderRadius: '50%' }}>
            <Lock size={32} color="white" />
          </div>
        </div>
        
        <h1 style={{ color: 'var(--color-admin-text)', marginBottom: '8px', fontSize: '1.5rem' }}>관리자 로그인</h1>
        <p style={{ color: '#718096', marginBottom: '32px' }}>상담 기록을 확인하기 위해 로그인해주세요.</p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <input
              type="password"
              className="input-field"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              style={{ border: '1px solid #e2e8f0' }}
              required
            />
            {error && <p style={{ color: 'var(--color-danger)', fontSize: '0.9rem', marginTop: '8px', textAlign: 'left' }}>비밀번호가 일치하지 않습니다.</p>}
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', backgroundColor: 'var(--color-admin-primary)' }}
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}

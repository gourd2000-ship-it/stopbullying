import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const StudentLanding = () => {
  const [nickname, setNickname] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const navigate = useNavigate();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      navigate('/chat', { state: { nickname: nickname.trim() } });
    }
  };

  const handleTitleClick = () => {
    const newCount = clickCount + 1;
    if (newCount === 5) {
      navigate('/admin/login');
    } else {
      setClickCount(newCount);
      // Reset count after 3 seconds of inactivity
      setTimeout(() => setClickCount(0), 3000);
    }
  };

  return (
    <div className="container" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', padding: '32px', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
        <h1 
          onClick={handleTitleClick}
          style={{ marginBottom: '16px', color: 'var(--color-primary-dark)', fontSize: '1.8rem', cursor: 'default', userSelect: 'none' }}
        >
          마음 톡톡
        </h1>
        
        <p style={{ marginBottom: '12px', fontSize: '1.1rem', wordBreak: 'keep-all' }}>
          안녕. 여기는 네가 힘든 일을 편하게 말할 수 있는 곳이야.
        </p>
        <p style={{ marginBottom: '12px', fontSize: '1.1rem', wordBreak: 'keep-all' }}>
          이름 대신 별명으로 시작할 수 있어.
        </p>
        
        <div style={{ backgroundColor: 'var(--color-background)', padding: '16px', borderRadius: 'var(--border-radius-sm)', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '12px', textAlign: 'left' }}>
          <ShieldAlert size={24} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: '4px' }} />
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-light)', margin: 0 }}>
            네가 위험한 상황이라면 선생님이 빠르게 확인할 수 있도록 상담 내용이 관리자에게 전달될 수 있어.
          </p>
        </div>

        <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="사용할 별명을 적어줘"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            maxLength={10}
            style={{ textAlign: 'center' }}
          />
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', fontSize: '1.2rem', padding: '16px' }}
            disabled={!nickname.trim()}
          >
            상담 시작하기
          </button>
      </form>
    </div>
  </div>
);
};

export default StudentLanding;

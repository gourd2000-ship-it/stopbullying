import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../utils/db';
import type { ConsultationRecord } from '../../types';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [records, setRecords] = useState<ConsultationRecord[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth
    if (!localStorage.getItem('admin_auth')) {
      navigate('/admin/login');
      return;
    }
    
    setRecords(db.getConsultations());
  }, [navigate]);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case '낮음': return <span className="badge badge-low">낮음</span>;
      case '보통': return <span className="badge badge-medium">보통</span>;
      case '높음': return <span className="badge badge-high">높음</span>;
      case '긴급': return <span className="badge badge-emergency"><AlertCircle size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-top' }}/>긴급</span>;
      default: return <span className="badge badge-low">{level}</span>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '새 상담': return <AlertCircle size={16} color="var(--color-danger)" />;
      case '확인 중': return <Clock size={16} color="var(--color-warning)" />;
      case '조치 완료': return <CheckCircle size={16} color="var(--color-success)" />;
      default: return <Clock size={16} color="#cbd5e0" />;
    }
  };

  return (
    <div className="admin-body" style={{ minHeight: '100vh' }}>
      <div className="admin-container">
        <div className="flex justify-between items-center mb-4">
          <h1 style={{ fontSize: '1.8rem', color: 'var(--color-admin-text)' }}>상담 목록</h1>
          <button 
            className="btn" 
            style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', color: '#4a5568' }}
            onClick={() => { localStorage.removeItem('admin_auth'); navigate('/admin/login'); }}
          >
            로그아웃
          </button>
        </div>

        <div className="admin-card">
          {records.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
              아직 등록된 상담 기록이 없습니다.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>상태</th>
                    <th>상담 일시</th>
                    <th>학생 별명</th>
                    <th>위험도</th>
                    <th>긴급 안내</th>
                    <th>관리자 확인</th>
                    <th>상세</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(record => (
                    <tr key={record.id} style={{ backgroundColor: !record.isRead ? '#f0f4ff' : 'transparent', fontWeight: !record.isRead ? '600' : 'normal' }}>
                      <td>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(record.status)}
                          <span>{record.status}</span>
                        </div>
                      </td>
                      <td>{new Date(record.createdAt).toLocaleString('ko-KR')}</td>
                      <td>{record.summary.basicInfo.nickname}</td>
                      <td>{getRiskBadge(record.summary.riskLevel)}</td>
                      <td>
                        {record.summary.safety.emergencyGuideProvided ? 
                          <span style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>제공됨</span> : 
                          <span style={{ color: '#a0aec0' }}>-</span>
                        }
                      </td>
                      <td>{record.isRead ? '읽음' : <span style={{ color: 'var(--color-admin-primary)' }}>안 읽음</span>}</td>
                      <td>
                        <button 
                          className="btn" 
                          style={{ padding: '6px 12px', fontSize: '0.9rem', backgroundColor: 'var(--color-admin-primary)', color: 'white' }}
                          onClick={() => navigate(`/admin/consultation/${record.id}`)}
                        >
                          보기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

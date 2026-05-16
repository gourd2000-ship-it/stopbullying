import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../utils/db';
import type { ConsultationRecord, ConsultationStatus } from '../../types';
import { ArrowLeft, Save } from 'lucide-react';

export default function AdminDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ConsultationRecord | null>(null);
  const [memo, setMemo] = useState('');
  const [status, setStatus] = useState<ConsultationStatus>('새 상담');

  useEffect(() => {
    if (!localStorage.getItem('admin_auth')) {
      navigate('/admin/login');
      return;
    }

    if (id) {
      const data = db.getConsultationById(id);
      if (data) {
        db.markAsRead(id);
        const updatedData = db.getConsultationById(id); // Get fresh data after mark as read
        setRecord(updatedData);
        setMemo(updatedData?.summary.adminMemo || '');
        setStatus(updatedData?.status || '확인 중');
      }
    }
  }, [id, navigate]);

  const handleSave = () => {
    if (id) {
      db.updateMemo(id, memo);
      db.updateStatus(id, status);
      alert('저장되었습니다.');
      // Refresh
      setRecord(db.getConsultationById(id));
    }
  };

  if (!record) return <div className="admin-body" style={{ minHeight: '100vh', padding: '40px' }}>Loading...</div>;

  const { summary, chatHistory } = record;

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 style={{ fontSize: '1.1rem', color: 'var(--color-admin-text)', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px', marginTop: '24px' }}>
      {children}
    </h3>
  );

  const InfoRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div style={{ display: 'flex', marginBottom: '8px' }}>
      <div style={{ width: '150px', fontWeight: '600', color: '#4a5568' }}>{label}</div>
      <div style={{ flex: 1, color: '#2d3748' }}>{value || '-'}</div>
    </div>
  );

  return (
    <div className="admin-body" style={{ minHeight: '100vh', paddingBottom: '40px' }}>
      <div className="admin-container">
        <button 
          onClick={() => navigate('/admin/dashboard')} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', marginBottom: '24px', fontSize: '1rem' }}
        >
          <ArrowLeft size={20} /> 목록으로 돌아가기
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Left Column: Summary */}
          <div className="admin-card" style={{ height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--color-admin-text)' }}>상담 요약</h2>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value as ConsultationStatus)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                >
                  <option value="새 상담">새 상담</option>
                  <option value="확인 중">확인 중</option>
                  <option value="상담 필요">상담 필요</option>
                  <option value="조치 완료">조치 완료</option>
                  <option value="보류">보류</option>
                </select>
                <button className="btn btn-primary" style={{ padding: '8px 16px', display: 'flex', gap: '8px' }} onClick={handleSave}>
                  <Save size={16} /> 저장
                </button>
              </div>
            </div>

            <SectionTitle>1. 기본 정보</SectionTitle>
            <InfoRow label="상담 일시" value={new Date(record.createdAt).toLocaleString('ko-KR')} />
            <InfoRow label="학생 별명" value={summary.basicInfo.nickname} />
            <InfoRow label="위험도" value={
              <span className={`badge badge-${summary.riskLevel === '긴급' ? 'emergency' : summary.riskLevel === '높음' ? 'high' : summary.riskLevel === '보통' ? 'medium' : 'low'}`}>
                {summary.riskLevel}
              </span>
            } />

            <SectionTitle>2. 현재 안전 상태</SectionTitle>
            <InfoRow label="선택한 안전 상태" value={summary.safety.studentSelectedSafety} />
            <InfoRow label="긴급상황 여부" value={summary.safety.isEmergency ? '예' : '아니오'} />
            <InfoRow label="긴급 안내 제공" value={summary.safety.emergencyGuideProvided ? '예' : '아니오'} />

            <SectionTitle>3. 학생이 말한 주요 내용</SectionTitle>
            <InfoRow label="있었던 일" value={summary.mainContent.event} />
            <InfoRow label="일어난 시기" value={summary.mainContent.time} />
            <InfoRow label="장소" value={summary.mainContent.place} />
            <InfoRow label="관련 학생" value={summary.mainContent.involvedPeople} />
            <InfoRow label="반복 여부" value={summary.mainContent.isRepeated} />
            <InfoRow label="신체 피해 여부" value={summary.mainContent.physicalDamage} />
            <InfoRow label="정서적 어려움" value={summary.mainContent.emotionalDifficulty} />
            <InfoRow label="온라인 관련" value={summary.mainContent.isOnline} />

            <SectionTitle>4. 학생의 감정</SectionTitle>
            <InfoRow label="선택한 감정" value={summary.emotion.selectedEmotion} />

            <SectionTitle>5. 증거 및 알린 사람</SectionTitle>
            <InfoRow label="증거 유무" value={summary.mainContent.isOnline} /> {/* Evidence answer is stored here */}
            <InfoRow label="알린 적 없음" value={summary.alreadyTold.notToldYet} />

            <SectionTitle>6. 교사가 추가로 확인할 질문 (체크리스트)</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label><input type="checkbox" checked={summary.teacherQuestions.needsPhysicalTreatment} readOnly /> 신체적 피해나 치료가 필요한가?</label>
              <label><input type="checkbox" checked={summary.teacherQuestions.hasOnlineEvidence} readOnly /> 온라인 증거가 있는가?</label>
              <label><input type="checkbox" checked={summary.riskLevel === '긴급'} readOnly /> 즉시 분리 또는 보호 조치가 필요한가?</label>
              <label><input type="checkbox" checked={['높음', '긴급'].includes(summary.riskLevel)} readOnly /> 학교폭력 담당자에게 공유가 필요한가?</label>
            </div>

            <SectionTitle>7. 관리자 메모</SectionTitle>
            <textarea 
              value={memo} 
              onChange={(e) => setMemo(e.target.value)}
              style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', resize: 'vertical' }}
              placeholder="상담 내용을 확인하고 필요한 조치 사항을 기록하세요."
            />
            
            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#fff5f5', borderLeft: '4px solid #f56565', fontSize: '0.9rem', color: '#742a2a' }}>
              <strong>종합 메모:</strong><br />
              이 요약은 학생의 초기 상담 내용을 바탕으로 자동 생성된 참고자료입니다. 학교폭력 여부에 대한 최종 판단이 아닙니다. 담당자는 교육부 학교폭력 사안처리 가이드북과 학교 내부 절차에 따라 추가 확인이 필요합니다.
            </div>
          </div>

          {/* Right Column: Chat History */}
          <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-admin-text)', marginBottom: '20px' }}>전체 대화 내용</h2>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: '#f7fafc', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {chatHistory.map((msg, index) => (
                <div key={index} style={{ 
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.sender === 'user' ? 'var(--color-primary)' : msg.sender === 'system' ? 'var(--color-danger-light)' : 'white',
                  color: msg.sender === 'system' ? 'var(--color-danger)' : 'var(--color-text-main)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  maxWidth: '80%',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ fontSize: '0.8rem', color: msg.sender === 'system' ? 'inherit' : '#718096', marginBottom: '4px' }}>
                    {msg.sender === 'user' ? '학생' : msg.sender === 'bot' ? '챗봇' : '시스템'}
                  </div>
                  <div>
                    {msg.text.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

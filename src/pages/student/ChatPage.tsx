import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ChatMessage, ConsultationRecord } from '../../types';
import { db } from '../../utils/db';

const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const API_URL = '/api';

export default function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const nickname = location.state?.nickname || '친구';
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addBotMessage = (text: string) => {
    setMessages(prev => [...prev, { id: generateId(), sender: 'bot', text, timestamp: new Date().toISOString() }]);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, { id: generateId(), sender: 'user', text, timestamp: new Date().toISOString() }]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const hasInitialized = useRef(false);

  // Initial greeting
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initChat = async () => {
      const initialUserText = `안녕! 내 이름은 ${nickname}야.`;
      addUserMessage(initialUserText);
      setIsTyping(true);
      try {
        const response = await fetch(`${API_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: [{ text: initialUserText }], 
            history: [] 
          })
        });
        const data = await response.json();
        addBotMessage(data.text);
      } catch (error) {
        addBotMessage("안녕! 상담봇 마음샘이야. 지금 연결이 조금 불안정하네. 잠시 후에 다시 말해줄래?");
      } finally {
        setIsTyping(false);
      }
    };
    initChat();
  }, [nickname]);

  const handleUserInput = async (text: string) => {
    if (!text.trim() || isTyping || isEnded) return;
    
    addUserMessage(text);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, { sender: 'user', text }], 
          history: messages 
        })
      });
      const data = await response.json();
      
      let botText = data.text;
      
      // Check for end tag
      if (botText.includes('[END_CONSULTATION]')) {
        botText = botText.replace('[END_CONSULTATION]', '');
        addBotMessage(botText);
        setTimeout(finalizeChat, 1000);
      } else {
        addBotMessage(botText);
      }
      
      // Check for emergency phrases to show system alerts (Optional enhancement)
      if (botText.includes('112') || botText.includes('도움을 요청하세요')) {
         // Could trigger a more visible alert here
      }

    } catch (error) {
      addBotMessage("미안해, 잠시 생각을 정리하고 있어. 다시 한 번 말해줄래?");
    } finally {
      setIsTyping(false);
    }
  };

  const finalizeChat = async () => {
    setIsTyping(true);
    try {
      // Get summary from Gemini
      const response = await fetch(`${API_URL}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: messages })
      });
      const summaryData = await response.json();
      
      if (summaryData) {
        const record: ConsultationRecord = {
          id: generateId(),
          summary: {
            ...db.createEmptySummary(nickname),
            mainContent: {
              event: summaryData.event,
              time: summaryData.time,
              place: summaryData.place,
              involvedPeople: summaryData.involvedPeople,
              isRepeated: summaryData.isRepeated,
              physicalDamage: summaryData.physicalDamage,
              emotionalDifficulty: summaryData.emotionalDifficulty,
              isOnline: summaryData.isOnline,
              propertyDamage: "",
              sexualOrPhotoIssue: ""
            },
            safety: {
              studentSelectedSafety: "",
              isEmergency: summaryData.isEmergency,
              emergencyGuideProvided: messages.some(m => m.text.includes('112')),
              riskToday: summaryData.isEmergency
            },
            riskLevel: summaryData.riskLevel,
            alreadyTold: {
              parents: "", homeroomTeacher: "", counselor: "", friends: "",
              notToldYet: summaryData.alreadyTold
            }
          },
          chatHistory: messages,
          status: '새 상담',
          createdAt: new Date().toISOString(),
          isRead: false
        };
        db.saveConsultation(record);
      }
    } catch (error) {
      console.error("Failed to summarize:", error);
    } finally {
      setIsTyping(false);
      setIsEnded(true);
    }
  };

  return (
    <div className="container" style={{ padding: '0', backgroundColor: 'var(--color-background)' }}>
      <div style={{ padding: '16px 20px', backgroundColor: 'white', boxShadow: 'var(--shadow-sm)', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--color-primary-dark)' }}>마음샘과 대화하기</h2>
        <button 
           className="btn" 
           style={{ padding: '4px 12px', fontSize: '0.8rem', backgroundColor: '#f7fafc' }}
           onClick={() => { if(confirm('상담을 종료할까요?')) finalizeChat(); }}
        >
          상담 종료
        </button>
      </div>

      <div className="chat-window" style={{ padding: '20px' }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-bubble chat-bubble-${msg.sender}`}>
            {msg.text.split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </div>
        ))}
        {isTyping && (
          <div className="chat-bubble chat-bubble-bot" style={{ opacity: 0.6 }}>
            생각 중...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '16px', backgroundColor: 'white', borderTop: '1px solid #eee' }}>
        {isEnded ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '12px' }}>상담이 안전하게 종료되었습니다.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>처음으로 돌아가기</button>
          </div>
        ) : (
          <form 
            onSubmit={(e) => { e.preventDefault(); handleUserInput(inputText); }}
            style={{ display: 'flex', gap: '8px' }}
          >
            <input
              type="text"
              className="input-field"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isTyping ? "마음샘이 생각하고 있어요..." : "여기에 편하게 적어줘..."}
              style={{ padding: '12px', fontSize: '1rem' }}
              disabled={isTyping}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!inputText.trim() || isTyping}
              style={{ padding: '12px 20px' }}
            >
              전송
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

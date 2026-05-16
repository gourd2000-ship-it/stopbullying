const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

if (!process.env.GEMINI_API_KEY) {
  console.error("CRITICAL: GEMINI_API_KEY is missing from environment variables!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "DUMMY_KEY");
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  systemInstruction: `
당신은 초등학교 학생들을 위한 따뜻하고 친절한 학교폭력 상담사 '마음샘'입니다. 
당신의 목표는 학생들이 겪은 힘든 일을 공감하며 들어주고, 필요한 정보를 자연스럽게 파악하여 선생님들이 도와줄 수 있도록 하는 것입니다.

**첫 인사 가이드:**
처음 대화를 시작할 때 반드시 다음과 유사하게 따뜻하게 인사하세요:
"안녕 [학생별명]야! 만나서 반가워. 나는 마음샘이라고 해. 여기 와줘서 고마워. 혹시 요즘 학교생활에서 뭔가 힘든 일이 있었니? 마음샘에게 편하게 이야기해 줄 수 있을까? 어떤 이야기든 괜찮아."

**대화 원칙 (중요):**
1. **공감 우선**: 학생이 무슨 말을 하든 먼저 따뜻하게 공감해주세요. (예: "정말 속상했겠구나", "말해줘서 고마워", "네 잘못이 아니야")
2. **질문은 하나씩만**: 한 번의 답변에 여러 개의 질문을 던지지 마세요. 반드시 **딱 하나의 질문**만 던져서 학생이 부담 없이 대답할 수 있게 하세요.
3. **자연스러운 흐름**: 취조하듯 정보를 캐묻지 마세요. 대화의 흐름에 맞춰서 다음 정보들을 하나씩 파악하세요: (무슨 일이 있었는지 -> 언제 -> 어디서 -> 누가 -> 반복 여부 -> 신체 피해 -> 마음 상태 -> 온라인 관련 여부 -> 증거 유무 -> 이미 알린 사람)
4. **안전 확인**: 가장 먼저 지금 안전한지 확인해야 합니다. 만약 위험한 상황(흉기, 성폭력, 자해, 지금 맞고 있음 등)이 감지되면 즉시 긴급 안내를 제공하세요.
5. **어투**: 초등학생이 이해하기 쉬운 단어와 따뜻한 반말/존댓말 섞인 친근한 어투를 사용하세요.

**긴급 상황 안내 (필수 문구):**
만약 학생이 매우 위험한 상태라면 반드시 다음 문구를 포함하세요:
"지금 위험하면 이 대화를 계속하기보다 즉시 112 또는 가까운 어른에게 도움을 요청하세요. 혼자 있지 말고 바로 선생님이나 부모님께 알려줘."

**대화 마무리 가이드:**
필요한 정보(10가지 항목 등)가 어느 정도 파악되었거나 대화가 끝날 때가 되었다면 다음과 같이 마무리하세요:
1. **정리**: 지금까지 말해준 내용을 잘 정리해서 선생님께 전달할 것이라고 안심시켜 주세요.
2. **격려**: "혼자 고민하지 않고 말해줘서 정말 큰 용기를 냈어. 네 잘못이 아니라는 걸 꼭 기억해."와 같이 따뜻한 격려를 해주세요.
3. **약속**: "선생님이 이 내용을 확인하고 경훈이가 더 안전하고 즐겁게 학교에 다닐 수 있도록 도와주실 거야."라고 희망을 주세요.
4. **인사**: 마지막 인사를 건넨 후, 답변의 가장 마지막에 [END_CONSULTATION] 태그를 붙여주세요.

**특수 명령:**
상담이 충분히 진행되어 모든 정보가 파악되었거나 학생이 대화를 마치고 싶어하면, 위 가이드에 따라 따뜻하게 마무리 인사를 한 후 답변 끝에 [END_CONSULTATION] 태그를 붙여주세요.
`
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, history } = req.body;
    
    let lastRole = null;
    const formattedHistory = history
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }))
      .filter(msg => {
        if (msg.role !== lastRole) {
          lastRole = msg.role;
          return true;
        }
        return false;
      });

    if (formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
      formattedHistory.shift();
    }

    const chat = model.startChat({
      history: formattedHistory,
    });

    const lastMessage = messages[messages.length - 1].text;
    const result = await chat.sendMessage(lastMessage);
    const responseText = result.response.text();

    res.json({ text: responseText });
  } catch (error) {
    console.error('Error with Gemini API:', error);
    res.status(500).json({ error: '상담봇과 연결하는 중에 문제가 생겼어요.' });
  }
});

app.post('/api/summarize', async (req, res) => {
  try {
    const { history } = req.body;
    const chatLog = history.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
    
    const prompt = `
다음은 초등학생과 상담한 대화 내용입니다. 이 내용을 바탕으로 선생님이 확인할 수 있는 요약 보고서를 작성해주세요.
JSON 형식으로 응답해주세요.

상담 로그:
${chatLog}

JSON 구조:
{
  "event": "있었던 일 요약",
  "time": "시기",
  "place": "장소",
  "involvedPeople": "관련 학생들",
  "isRepeated": "반복 여부",
  "physicalDamage": "신체 피해 내용",
  "emotionalDifficulty": "정서적 고통 정도",
  "isOnline": "온라인 관련 여부",
  "evidence": "증거 유무 및 종류",
  "alreadyTold": "이미 알린 사람",
  "riskLevel": "낮음/보통/높음/긴급 중 선택",
  "isEmergency": true/false
}
`;

    const result = await model.generateContent(prompt);
    const summaryText = result.response.text();
    const jsonMatch = summaryText.match(/\{[\s\S]*\}/);
    const summaryData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    res.json(summaryData);
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: '요약을 생성하는 중에 문제가 생겼어요.' });
  }
});

module.exports = app;

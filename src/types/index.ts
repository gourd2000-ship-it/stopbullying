export type RiskLevel = '낮음' | '보통' | '높음' | '긴급';
export type ConsultationStatus = '새 상담' | '확인 중' | '상담 필요' | '조치 완료' | '보류';

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user' | 'system';
  text: string;
  timestamp: string;
}

export interface ConsultationSummary {
  basicInfo: {
    consultationId: string;
    date: string;
    nickname: string;
    realName?: string;
    gradeClass?: string;
    inputProvided: boolean;
  };
  safety: {
    studentSelectedSafety: string;
    isEmergency: boolean;
    emergencyGuideProvided: boolean;
    riskToday: boolean;
  };
  mainContent: {
    event: string;
    time: string;
    place: string;
    involvedPeople: string;
    isRepeated: string;
    isOnline: string;
    physicalDamage: string;
    emotionalDifficulty: string;
    propertyDamage: string;
    sexualOrPhotoIssue: string;
  };
  emotion: {
    selectedEmotion: string;
    expressedWords: string;
    supportNeeded: boolean;
  };
  evidence: {
    messages: string;
    photos: string;
    videos: string;
    comments: string;
    witnesses: string;
    others: string;
  };
  alreadyTold: {
    parents: string;
    homeroomTeacher: string;
    counselor: string;
    friends: string;
    notToldYet: string;
  };
  botGuided: {
    empathy: boolean;
    safetyCheck: boolean;
    emergencyGuide: boolean;
    tellTeacher: boolean;
    preserveEvidence: boolean;
    procedureGuide: boolean;
  };
  riskLevel: RiskLevel;
  teacherQuestions: {
    isSafeNow: boolean;
    needsPhysicalTreatment: boolean;
    mightMeetToday: boolean;
    isRepeated: boolean;
    hasOnlineEvidence: boolean;
    needsParentContact: boolean;
    needsImmediateSeparation: boolean;
    needsSharingWithViolenceManager: boolean;
  };
  adminMemo: string;
}

export interface ConsultationRecord {
  id: string;
  summary: ConsultationSummary;
  chatHistory: ChatMessage[];
  status: ConsultationStatus;
  createdAt: string;
  isRead: boolean;
}

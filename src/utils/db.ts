import type { ConsultationRecord, ConsultationSummary, ConsultationStatus } from '../types';

const DB_KEY = 'stop_bullying_consultations';

export const db = {
  getConsultations: (): ConsultationRecord[] => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  },

  getConsultationById: (id: string): ConsultationRecord | null => {
    const records = db.getConsultations();
    return records.find(r => r.id === id) || null;
  },

  saveConsultation: (record: ConsultationRecord): void => {
    const records = db.getConsultations();
    const existingIndex = records.findIndex(r => r.id === record.id);
    
    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }
    
    // Sort by newest first
    records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    localStorage.setItem(DB_KEY, JSON.stringify(records));
  },

  updateStatus: (id: string, status: ConsultationStatus): void => {
    const record = db.getConsultationById(id);
    if (record) {
      record.status = status;
      db.saveConsultation(record);
    }
  },

  updateMemo: (id: string, memo: string): void => {
    const record = db.getConsultationById(id);
    if (record) {
      record.summary.adminMemo = memo;
      db.saveConsultation(record);
    }
  },
  
  markAsRead: (id: string): void => {
    const record = db.getConsultationById(id);
    if (record && !record.isRead) {
      record.isRead = true;
      if (record.status === '새 상담') {
        record.status = '확인 중';
      }
      db.saveConsultation(record);
    }
  },

  // Helper to create an empty summary
  createEmptySummary: (nickname: string): ConsultationSummary => {
    return {
      basicInfo: {
        consultationId: '',
        date: new Date().toISOString(),
        nickname,
        inputProvided: false,
      },
      safety: {
        studentSelectedSafety: '',
        isEmergency: false,
        emergencyGuideProvided: false,
        riskToday: false,
      },
      mainContent: {
        event: '',
        time: '',
        place: '',
        involvedPeople: '',
        isRepeated: '',
        isOnline: '',
        physicalDamage: '',
        emotionalDifficulty: '',
        propertyDamage: '',
        sexualOrPhotoIssue: '',
      },
      emotion: {
        selectedEmotion: '',
        expressedWords: '',
        supportNeeded: false,
      },
      evidence: {
        messages: '',
        photos: '',
        videos: '',
        comments: '',
        witnesses: '',
        others: '',
      },
      alreadyTold: {
        parents: '',
        homeroomTeacher: '',
        counselor: '',
        friends: '',
        notToldYet: '',
      },
      botGuided: {
        empathy: true, // We always empathize
        safetyCheck: true,
        emergencyGuide: false,
        tellTeacher: false,
        preserveEvidence: false,
        procedureGuide: false,
      },
      riskLevel: '낮음',
      teacherQuestions: {
        isSafeNow: false,
        needsPhysicalTreatment: false,
        mightMeetToday: false,
        isRepeated: false,
        hasOnlineEvidence: false,
        needsParentContact: false,
        needsImmediateSeparation: false,
        needsSharingWithViolenceManager: false,
      },
      adminMemo: '',
    };
  }
};

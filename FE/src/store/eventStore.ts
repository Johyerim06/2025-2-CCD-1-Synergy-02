// 이벤트/알림 상태 관리 스토어
import { create } from 'zustand';
import { api, handleApiError } from '../api/api';

interface EventItem {
  eno: number;
  umno: number;
  name: string;
  time: string;
  hospital: string;
  category: string;
  description: string;
  question: string;
  candidate?: {
    answer: string;
    wrongs: string[];
  };
}

interface AIScript {
  script: string;
}

interface EventState {
  events: EventItem[];
  unreadCount: number; // 읽지 않은 알림 개수
  isLoading: boolean;
  lastUpdated: Date | null;
  fetchEvents: () => Promise<void>;
  getAIScript: (umno: number) => Promise<string>;
  updateEventStatus: (eno: number) => Promise<void>;
  markAsRead: (eno: number) => void;
  markAllAsRead: () => void;
  clearEvents: () => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  unreadCount: 0,
  isLoading: false,
  lastUpdated: null,

  // 이벤트 목록 조회 (00시 00분에 생성된 알림 데이터 포함)
  fetchEvents: async () => {
    try {
      set({ isLoading: true });
      const response = await api.event.getEvents();
      
      set({
        events: response.body.events || [],
        unreadCount: response.body.events?.filter((event: EventItem) => 
          // 읽지 않은 이벤트 개수 (필요시 status 필드 추가)
          true
        ).length || 0,
        lastUpdated: new Date(),
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // AI 스크립트 조회
  getAIScript: async (umno: number) => {
    try {
      const response = await api.event.getAIScript(umno);
      return response.body.script || '';
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // 이벤트 상태 업데이트 (읽음 처리 등)
  updateEventStatus: async (eno: number) => {
    try {
      set({ isLoading: true });
      await api.event.updateEventStatus(eno);
      
      // 상태 업데이트 후 이벤트 목록 다시 조회
      await get().fetchEvents();
      
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // 개별 이벤트 읽음 처리 (로컬 상태)
  markAsRead: (eno: number) => {
    const { events, unreadCount } = get();
    const updatedEvents = events.map(event =>
      event.eno === eno ? { ...event, isRead: true } : event
    );
    
    set({
      events: updatedEvents,
      unreadCount: Math.max(0, unreadCount - 1),
    });
  },

  // 모든 이벤트 읽음 처리 (로컬 상태)
  markAllAsRead: () => {
    const { events } = get();
    const updatedEvents = events.map(event => ({ ...event, isRead: true }));
    
    set({
      events: updatedEvents,
      unreadCount: 0,
    });
  },

  // 이벤트 데이터 초기화
  clearEvents: () => {
    set({
      events: [],
      unreadCount: 0,
      lastUpdated: null,
    });
  },
}));




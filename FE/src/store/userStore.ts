// 사용자 정보 상태 관리 스토어
import { create } from 'zustand';
import { api, handleApiError } from '../api/api';

interface UserInfo {
  name?: string;
  birth?: string;
  call?: string;
  // 추가 사용자 정보 필드
}

interface MedicationTime {
  utno?: number;
  type?: string;
  time?: string;
}

interface UserState {
  userInfo: UserInfo | null;
  medicationTimes: MedicationTime[];
  todayMedications: any[];
  isLoading: boolean;
  fetchUserInfo: () => Promise<void>;
  updateUserInfo: (data: Partial<UserInfo>) => Promise<void>;
  fetchMedicationTime: (type: string) => Promise<void>;
  setMedicationTime: (data: any) => Promise<void>;
  updateMedicationTime: (utno: number, data: any) => Promise<void>;
  fetchTodayMedications: () => Promise<void>;
  clearUserData: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  userInfo: null,
  medicationTimes: [],
  todayMedications: [],
  isLoading: false,

  // 사용자 정보 조회
  fetchUserInfo: async () => {
    try {
      set({ isLoading: true });
      const response = await api.user.getMyInfo();
      set({
        userInfo: response.body,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // 사용자 정보 수정
  updateUserInfo: async (data: Partial<UserInfo>) => {
    try {
      set({ isLoading: true });
      const response = await api.user.updateMyInfo(data);
      set({
        userInfo: response.body,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // 복약 시간 조회
  fetchMedicationTime: async (type: string) => {
    try {
      set({ isLoading: true });
      const response = await api.user.getMedicationTime(type);
      set({
        medicationTimes: [response.body],
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // 복약 시간 설정
  setMedicationTime: async (data: any) => {
    try {
      set({ isLoading: true });
      const response = await api.user.setMedicationTime(data);
      set({ isLoading: false });
      return response.body;
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // 복약 시간 수정
  updateMedicationTime: async (utno: number, data: any) => {
    try {
      set({ isLoading: true });
      const response = await api.user.updateMedicationTime(utno, data);
      set({ isLoading: false });
      return response.body;
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // 오늘의 복약 목록 조회
  fetchTodayMedications: async () => {
    try {
      set({ isLoading: true });
      const response = await api.user.getTodayMedications();
      set({
        todayMedications: response.body || [],
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // 사용자 데이터 초기화
  clearUserData: () => {
    set({
      userInfo: null,
      medicationTimes: [],
      todayMedications: [],
    });
  },
}));




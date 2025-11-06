// 부작용 상태 관리 스토어
import { create } from 'zustand';
import { api, handleApiError } from '../api/api';

interface ConditionState {
  isLoading: boolean;
  
  // 부작용 기록 생성
  createCondition: (effects: number[]) => Promise<void>;
}

export const useConditionStore = create<ConditionState>((set, get) => ({
  isLoading: false,

  // 부작용 기록 생성
  createCondition: async (effects: number[]) => {
    try {
      set({ isLoading: true });
      await api.condition.createCondition({ effects });
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },
}));


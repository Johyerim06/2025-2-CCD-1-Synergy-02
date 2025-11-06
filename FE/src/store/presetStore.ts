// 프리셋 상태 관리 스토어
import { create } from 'zustand';
import { api, handleApiError } from '../api/api';

interface MedicationTimePreset {
  times: number[];
}

interface SideEffectPreset {
  effects: { efno: number; name: string; image?: string }[];
}

interface PresetState {
  medicationTimePreset: MedicationTimePreset | null;
  sideEffectPreset: SideEffectPreset | null;
  isLoading: boolean;
  
  // 복약 시간 프리셋 조회
  fetchMedicationTimePreset: (type: string) => Promise<void>;
  
  // 부작용 프리셋 조회
  fetchSideEffectPreset: () => Promise<void>;
  
  // 데이터 초기화
  clearPresetData: () => void;
}

export const usePresetStore = create<PresetState>((set, get) => ({
  medicationTimePreset: null,
  sideEffectPreset: null,
  isLoading: false,

  // 복약 시간 프리셋 조회
  fetchMedicationTimePreset: async (type: string) => {
    try {
      set({ isLoading: true });
      const response = await api.preset.getMedicationTimePreset(type);
      set({
        medicationTimePreset: response.body,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // 부작용 프리셋 조회
  fetchSideEffectPreset: async () => {
    try {
      set({ isLoading: true });
      const response = await api.preset.getSideEffectPreset();
      set({
        sideEffectPreset: response.body,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // 데이터 초기화
  clearPresetData: () => {
    set({
      medicationTimePreset: null,
      sideEffectPreset: null,
    });
  },
}));



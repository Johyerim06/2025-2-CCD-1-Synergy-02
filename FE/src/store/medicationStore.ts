// 복약 정보 상태 관리 스토어
import { create } from 'zustand';
import { api, handleApiError } from '../api/api';

interface MedicationDetail {
  umno: number;
  hospital: string;
  category: string;
  taken: number;
  comb: string;
  medicines: any[];
}

interface MedicationSummary {
  umno: number;
  hospital: string;
  category: string;
  taken: number;
  medicines: any[];
}

interface MedicationState {
  medicationDetail: MedicationDetail | null;
  medicationSummary: MedicationSummary | null;
  combination: any | null;
  medicationTimes: any[];
  isLoading: boolean;
  
  // 복약 정보 등록 (OCR)
  createMedication: (img: string) => Promise<number>;
  
  // 복약 상세 정보 조회
  fetchMedicationDetail: (umno: number) => Promise<void>;
  
  // 복약 카테고리 수정
  updateMedicationCategory: (umno: number, category: string) => Promise<void>;
  
  // 복약 알림 시간 조합 조회
  fetchCombination: (umno: number) => Promise<void>;
  
  // 복약 알림 시간 조합 수정
  updateCombination: (umno: number, data: any) => Promise<void>;
  
  // 복약 정보 요약 조회
  fetchMedicationSummary: (umno: number) => Promise<void>;
  
  // 복약 알림 시간 목록 조회
  fetchMedicationTimes: (umno: number, type: string) => Promise<void>;
  
  // 복약 알림 시간 수정
  updateMedicationTime: (umno: number, atno: number, data: any) => Promise<void>;
  
  // 데이터 초기화
  clearMedicationData: () => void;
}

export const useMedicationStore = create<MedicationState>((set, get) => ({
  medicationDetail: null,
  medicationSummary: null,
  combination: null,
  medicationTimes: [],
  isLoading: false,

  // 복약 정보 등록 (OCR)
  createMedication: async (img: string) => {
    try {
      set({ isLoading: true });
      const response = await api.medication.createMedication(img);
      set({ isLoading: false });
      return response.body.umno;
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // 복약 상세 정보 조회
  fetchMedicationDetail: async (umno: number) => {
    try {
      set({ isLoading: true });
      const response = await api.medication.getMedicationDetail(umno);
      set({
        medicationDetail: response.body,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // 복약 카테고리 수정
  updateMedicationCategory: async (umno: number, category: string) => {
    try {
      set({ isLoading: true });
      const response = await api.medication.updateMedicationCategory(umno, { category });
      if (get().medicationDetail?.umno === umno) {
        set({
          medicationDetail: { ...get().medicationDetail!, category },
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // 복약 알림 시간 조합 조회
  fetchCombination: async (umno: number) => {
    try {
      set({ isLoading: true });
      const response = await api.medication.getCombination(umno);
      set({
        combination: response.body,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // 복약 알림 시간 조합 수정
  updateCombination: async (umno: number, data: any) => {
    try {
      set({ isLoading: true });
      const response = await api.medication.updateCombination(umno, data);
      set({
        combination: response.body,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // 복약 정보 요약 조회
  fetchMedicationSummary: async (umno: number) => {
    try {
      set({ isLoading: true });
      const response = await api.medication.getMedicationSummary(umno);
      set({
        medicationSummary: response.body,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // 복약 알림 시간 목록 조회
  fetchMedicationTimes: async (umno: number, type: string) => {
    try {
      set({ isLoading: true });
      const response = await api.medication.getMedicationTimes(umno, type);
      set({
        medicationTimes: response.body || [],
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // 복약 알림 시간 수정
  updateMedicationTime: async (umno: number, atno: number, data: any) => {
    try {
      set({ isLoading: true });
      const response = await api.medication.updateMedicationTime(umno, atno, data);
      set({ isLoading: false });
      return response.body;
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // 데이터 초기화
  clearMedicationData: () => {
    set({
      medicationDetail: null,
      medicationSummary: null,
      combination: null,
      medicationTimes: [],
    });
  },
}));



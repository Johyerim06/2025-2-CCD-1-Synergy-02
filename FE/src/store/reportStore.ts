// 리포트 상태 관리 스토어
import { create } from 'zustand';
import { api, handleApiError } from '../api/api';

interface ReportItem {
  rno: number;
  hospital: string;
  category: string;
  startDate: string;
  endDate: string;
}

interface ReportDetail {
  rno: number;
  hospital: string;
  category: string;
  taken: number;
  medicine: any[];
  cycle: any;
  effects: any[];
  description: string;
}

interface ReportSummary {
  rno: number;
  hospital: string;
  category: string;
  taken: number;
  startDate: string;
  endDate: string;
  colors: { date: string; color: string }[];
}

interface ReportState {
  reports: ReportItem[];
  reportDetail: ReportDetail | null;
  reportSummary: ReportSummary | null;
  isLoading: boolean;
  
  // 리포트 목록 조회
  fetchReports: () => Promise<void>;
  
  // 리포트 상세 조회
  fetchReportDetail: (rno: number) => Promise<void>;
  
  // 리포트 요약 조회
  fetchReportSummary: (rno: number) => Promise<void>;
  
  // 데이터 초기화
  clearReportData: () => void;
}

export const useReportStore = create<ReportState>((set, get) => ({
  reports: [],
  reportDetail: null,
  reportSummary: null,
  isLoading: false,

  // 리포트 목록 조회
  fetchReports: async () => {
    try {
      set({ isLoading: true });
      const response = await api.report.getReports();
      set({
        reports: response.body?.user_medicine_list || [],
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // 리포트 상세 조회
  fetchReportDetail: async (rno: number) => {
    try {
      set({ isLoading: true });
      const response = await api.report.getReportDetail(rno);
      set({
        reportDetail: response.body,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // 리포트 요약 조회
  fetchReportSummary: async (rno: number) => {
    try {
      set({ isLoading: true });
      const response = await api.report.getReportSummary(rno);
      set({
        reportSummary: response.body,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // 데이터 초기화
  clearReportData: () => {
    set({
      reports: [],
      reportDetail: null,
      reportSummary: null,
    });
  },
}));



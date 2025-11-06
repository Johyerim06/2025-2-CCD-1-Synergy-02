// API 클라이언트 설정
import axios, { AxiosInstance, AxiosError } from 'axios';
import { tokenStorage } from './tokenStorage';
import { BaseResponse, ApiError } from './types';

// 백엔드 서버 URL 설정 (개발 환경)
// TODO: 실제 서버 URL로 변경하세요
const BASE_URL = __DEV__ 
  ? 'http://localhost:8080' // 로컬 개발 서버
  : 'https://your-production-url.com'; // 프로덕션 서버

// axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: JWT 토큰을 헤더에 추가
apiClient.interceptors.request.use(
  async (config) => {
    const token = await tokenStorage.getToken();
    if (token) {
      // 백엔드에서 "Bearer " 접두사를 제거하므로 토큰만 전송
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리 및 토큰 저장
apiClient.interceptors.response.use(
  (response) => {
    // 응답 헤더에서 Authorization 토큰 추출하여 저장
    const token = response.headers.authorization || response.headers.Authorization;
    if (token) {
      tokenStorage.setToken(token);
    }
    return response;
  },
  async (error: AxiosError) => {
    // 401 에러 시 토큰 삭제
    if (error.response?.status === 401) {
      await tokenStorage.removeToken();
    }
    return Promise.reject(error);
  }
);

// API 함수들
export const api = {
  // 인증 관련
  auth: {
    // 로그인
    login: async (data: { name: string; birth: string; call: string }) => {
      const response = await apiClient.post<BaseResponse<{ uno: number }>>('/auth/login', data);
      return response.data;
    },
  },

  // 사용자 관련
  user: {
    // 회원가입
    signup: async (data: {
      name: string;
      birth: string;
      call: string;
      fcm: string;
    }) => {
      const response = await apiClient.post<BaseResponse<{ uno: number }>>('/users', data);
      return response.data;
    },

    // 내 정보 조회
    getMyInfo: async () => {
      const response = await apiClient.get<BaseResponse<any>>('/users/me');
      return response.data;
    },

    // 내 정보 수정
    updateMyInfo: async (data: any) => {
      const response = await apiClient.patch<BaseResponse<any>>('/users/me', data);
      return response.data;
    },

    // 회원 탈퇴
    deleteUser: async () => {
      const response = await apiClient.delete<BaseResponse<{ uno: number }>>('/users/me');
      return response.data;
    },

    // 복약 시간 설정
    setMedicationTime: async (data: any) => {
      const response = await apiClient.post<BaseResponse<any>>('/users/me/medication-times', data);
      return response.data;
    },

    // 복약 시간 조회
    getMedicationTime: async (type: string) => {
      const response = await apiClient.get<BaseResponse<any>>('/users/me/medication-times', {
        params: { type },
      });
      return response.data;
    },

    // 복약 시간 수정
    updateMedicationTime: async (utno: number, data: any) => {
      const response = await apiClient.patch<BaseResponse<any>>(
        `/users/me/medication-times/${utno}`,
        data
      );
      return response.data;
    },

    // 오늘의 복약 목록 조회
    getTodayMedications: async () => {
      const response = await apiClient.get<BaseResponse<any>>('/users/me/medications');
      return response.data;
    },
  },

  // 이벤트/알림 관련
  event: {
    // 이벤트 목록 조회 (00시 00분에 생성된 알림 데이터 포함)
    getEvents: async () => {
      const response = await apiClient.get<BaseResponse<any>>('/users/me/events');
      return response.data;
    },

    // AI 스크립트 조회
    getAIScript: async (umno: number) => {
      const response = await apiClient.get<BaseResponse<any>>(`/users/me/events/${umno}`);
      return response.data;
    },

    // 이벤트 상태 업데이트
    updateEventStatus: async (eno: number) => {
      const response = await apiClient.post<BaseResponse<any>>(`/users/me/events/${eno}`);
      return response.data;
    },
  },

  // 약물 관련
  medication: {
    // 복약 정보 등록 (이미지 업로드)
    createMedication: async (img: string) => {
      const response = await apiClient.post<BaseResponse<{ umno: number }>>('/users/me/medications', {
        img,
      });
      return response.data;
    },

    // 복약 상세 정보 조회
    getMedicationDetail: async (umno: number) => {
      const response = await apiClient.get<BaseResponse<any>>(`/users/me/medications/${umno}`);
      return response.data;
    },

    // 복약 카테고리 수정
    updateMedicationCategory: async (umno: number, data: { category: string }) => {
      const response = await apiClient.patch<BaseResponse<any>>(`/users/me/medications/${umno}`, data);
      return response.data;
    },

    // 복약 알림 시간 조합 조회
    getCombination: async (umno: number) => {
      const response = await apiClient.get<BaseResponse<any>>(`/users/me/medications/${umno}/combination`);
      return response.data;
    },

    // 복약 알림 시간 조합 수정
    updateCombination: async (umno: number, data: any) => {
      const response = await apiClient.put<BaseResponse<any>>(`/users/me/medications/${umno}/combination`, data);
      return response.data;
    },

    // 복약 정보 요약 조회
    getMedicationSummary: async (umno: number) => {
      const response = await apiClient.get<BaseResponse<any>>(`/users/me/medications/${umno}/summary`);
      return response.data;
    },

    // 복약 알림 시간 목록 조회
    getMedicationTimes: async (umno: number, type: string) => {
      const response = await apiClient.get<BaseResponse<any>>(`/users/me/medications/${umno}/times`, {
        params: { type },
      });
      return response.data;
    },

    // 복약 알림 시간 수정
    updateMedicationTime: async (umno: number, atno: number, data: any) => {
      const response = await apiClient.patch<BaseResponse<any>>(
        `/users/me/medications/${umno}/times/${atno}`,
        data
      );
      return response.data;
    },
  },

  // 부작용 관련
  condition: {
    // 부작용 기록 생성
    createCondition: async (data: { effects: number[] }) => {
      const response = await apiClient.post<BaseResponse<any>>('/users/me/side-effects', data);
      return response.data;
    },
  },

  // 리포트 관련
  report: {
    // 리포트 목록 조회
    getReports: async () => {
      const response = await apiClient.get<BaseResponse<any>>('/users/me/reports');
      return response.data;
    },

    // 리포트 상세 조회
    getReportDetail: async (rno: number) => {
      const response = await apiClient.get<BaseResponse<any>>(`/users/me/reports/${rno}`);
      return response.data;
    },

    // 리포트 요약 조회
    getReportSummary: async (rno: number) => {
      const response = await apiClient.get<BaseResponse<any>>(`/users/me/reports/${rno}/summary`);
      return response.data;
    },
  },

  // 프리셋 관련
  preset: {
    // 복약 시간 프리셋 조회
    getMedicationTimePreset: async (type: string) => {
      const response = await apiClient.get<BaseResponse<any>>('/medication-time-presets', {
        params: { type },
      });
      return response.data;
    },

    // 부작용 프리셋 조회
    getSideEffectPreset: async () => {
      const response = await apiClient.get<BaseResponse<any>>('/side-effects-presets');
      return response.data;
    },
  },
};

// 에러 처리 헬퍼 함수
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<BaseResponse<null>>;
    if (axiosError.response?.data) {
      return {
        message: axiosError.response.data.header?.resultMsg || '알 수 없는 오류가 발생했습니다.',
        resultCode: axiosError.response.data.header?.resultCode || 0,
        resultMsg: axiosError.response.data.header?.resultMsg || '알 수 없는 오류가 발생했습니다.',
      };
    }
    return {
      message: axiosError.message || '네트워크 오류가 발생했습니다.',
      resultCode: 0,
      resultMsg: axiosError.message || '네트워크 오류가 발생했습니다.',
    };
  }
  return {
    message: '알 수 없는 오류가 발생했습니다.',
    resultCode: 0,
    resultMsg: '알 수 없는 오류가 발생했습니다.',
  };
};

export default apiClient;


// 인증 상태 관리 스토어
import { create } from 'zustand';
import { tokenStorage } from '../api/tokenStorage';
import { api, handleApiError } from '../api/api';
import { getFCMToken as getFCMTokenFromService } from '../services/notificationService';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  uno: number | null;
  token: string | null;
  fcmToken: string | null;
  login: (name: string, birth: string, call: string) => Promise<void>;
  signup: (name: string, birth: string, call: string, fcm?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  getFCMToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  uno: null,
  token: null,
  fcmToken: null,

  // FCM 토큰 받아오기
  getFCMToken: async () => {
    try {
      const fcmToken = await getFCMTokenFromService();
      set({ fcmToken });
      return fcmToken;
    } catch (error) {
      console.error('FCM 토큰 받아오기 실패:', error);
      return null;
    }
  },

  // 로그인
  login: async (name: string, birth: string, call: string) => {
    try {
      set({ isLoading: true });
      
      // FCM 토큰 받아오기
      const fcmToken = await get().getFCMToken();
      
      const response = await api.auth.login({ name, birth, call });
      const token = await tokenStorage.getToken();
      
      set({
        isAuthenticated: true,
        uno: response.body.uno,
        token,
        fcmToken,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // 회원가입
  signup: async (name: string, birth: string, call: string, fcm?: string) => {
    try {
      set({ isLoading: true });
      
      // FCM 토큰 받아오기 (파라미터로 전달되지 않으면 자동으로 받아옴)
      const fcmToken = fcm || await get().getFCMToken();
      
      const response = await api.user.signup({ name, birth, call, fcm: fcmToken || '' });
      const token = await tokenStorage.getToken();
      
      set({
        isAuthenticated: true,
        uno: response.body.uno,
        token,
        fcmToken,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  // 로그아웃
  logout: async () => {
    await tokenStorage.removeToken();
    set({
      isAuthenticated: false,
      uno: null,
      token: null,
      fcmToken: null,
    });
  },

  // 인증 상태 확인
  checkAuth: async () => {
    const token = await tokenStorage.getToken();
    if (token) {
      try {
        // 토큰이 유효한지 확인하기 위해 내 정보 조회
        const response = await api.user.getMyInfo();
        // uno는 응답에서 추출하거나 별도로 관리해야 할 수 있습니다
        set({
          isAuthenticated: true,
          token,
          isLoading: false,
        });
      } catch (error) {
        // 토큰이 유효하지 않으면 로그아웃 처리
        await tokenStorage.removeToken();
        set({
          isAuthenticated: false,
          token: null,
          uno: null,
          isLoading: false,
        });
      }
    } else {
      set({
        isAuthenticated: false,
        token: null,
        uno: null,
        isLoading: false,
      });
    }
  },

  // 앱 초기화 시 인증 상태 확인
  initializeAuth: async () => {
    set({ isLoading: true });
    await get().checkAuth();
  },
}));




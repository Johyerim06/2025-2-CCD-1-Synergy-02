import axios, { AxiosResponse } from 'axios';
import { useAuthStore } from '../stores/authStore';


// react native 에서는 localhost 사용이 불가하여 테스트 시 ip 주소를 변수로 사용
const IP_ADDRESS = "000.000.000.000";

const getBaseUrl = () => {
  if (__DEV__) {

    return `http://${IP_ADDRESS}:8080`;
  }
  return 'https://your-production-url.com';
};

const BASE_URL = getBaseUrl();

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30초로 증가 (로딩이 오래 걸릴 수 있음)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - 요청 전 처리
apiClient.interceptors.request.use(
  (config) => {
    // 토큰이 있다면 헤더에 추가
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor - 응답 후 처리
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 회원가입/로그인 응답에서 토큰 추출하여 저장
    const authHeader = response.headers.authorization || response.headers.Authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      useAuthStore.getState().login(token);
    }
    
    return response;
  },
  (error) => {
    // 에러 처리
    if (error.response) {
      // 서버에서 응답이 온 경우
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // 인증 실패 - 로그인 화면으로 이동 등
          console.error('[API Error] Unauthorized');
          useAuthStore.getState().logout();
          // handleUnauthorized();
          break;
        case 403:
          console.error('[API Error] Forbidden');
          break;
        case 404:
          console.error('[API Error] Not Found');
          break;
        case 500:
          console.error('[API Error] Internal Server Error');
          break;
        default:
          console.error(`[API Error] ${status}`, data);
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      console.error('[API Error] No response received', error.request);
    } else {
      // 요청 설정 중 에러가 발생한 경우
      console.error('[API Error] Request setup error', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API 메서드들
export const api = {
  // GET 요청
  get: <T = any>(url: string, config?: any) => {
    return apiClient.get<T>(url, config);
  },

  // POST 요청
  post: <T = any>(url: string, data?: any, config?: any) => {
    return apiClient.post<T>(url, data, config);
  },

  // PUT 요청
  put: <T = any>(url: string, data?: any, config?: any) => {
    return apiClient.put<T>(url, data, config);
  },

  // PATCH 요청
  patch: <T = any>(url: string, data?: any, config?: any) => {
    return apiClient.patch<T>(url, data, config);
  },

  // DELETE 요청
  delete: <T = any>(url: string, config?: any) => {
    return apiClient.delete<T>(url, config);
  },
};

// 기본 export
export default apiClient;

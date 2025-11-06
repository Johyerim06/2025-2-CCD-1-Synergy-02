// API 응답 타입
export interface BaseResponse<T> {
  header: {
    resultCode: number;
    resultMsg: string;
  };
  body: T;
}

// API 에러 타입
export interface ApiError {
  message: string;
  resultCode: number;
  resultMsg: string;
}




import { api } from './api';
import { BaseResponse } from './types';

// 처방전 업로드 응답
export interface MedicationCreateResponse {
  umno: number;
  // 기타 응답 필드들 (백엔드 DTO에 맞게 추가 필요)
}

// 복약 상세 정보 - 약품 정보
export interface MedicationDetailMedicine {
  mdno: number;
  name: string;
  classification: string;
  image?: string;
  description?: string;
  information?: string;
  warning?: {
    title: string;
    items: string[];
  };
  materials?: Array<{
    mtno: number;
    name: string;
  }>;
}

// 복약 상세 정보 응답
export interface MedicationDetailResponse {
  umno: number;
  hospital: string;
  category: string;
  taken: number;
  comb: string; // "breakfast,lunch,dinner" 형식
  medicines: MedicationDetailMedicine[];
}

// 복약 카테고리 수정 요청
export interface MedicationCategoryUpdateRequest {
  category: string;
}

// 복약 카테고리 수정 응답
export interface MedicationCategoryUpdateResponse {
  umno: number;
  category: string;
}

// 복약 시간대 조합 수정 요청
export interface MedicationCombinationRequest {
  combination: string; // "breakfast,lunch,dinner" 형식
}

// 복약 시간대 조합 수정 응답
export interface MedicationCombinationResponse {
  acno: number;
  combination: string;
}

/**
 * 처방전/약봉투 이미지 업로드
 * POST /medications
 * @param mode "1" (처방전) 또는 "2" (약봉투)
 * @param imageUri 이미지 파일 URI
 */
export const uploadMedication = async (
  mode: '1' | '2',
  imageUri: string
): Promise<BaseResponse<MedicationCreateResponse>> => {
  try {
    // FormData 생성
    const formData = new FormData();
    
    // 이미지 파일을 FormData에 추가
    // React Native에서는 uri를 사용
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'medication.jpg',
    } as any);
    
    formData.append('mode', mode);

    const response = await api.post<BaseResponse<MedicationCreateResponse>>(
      '/medications',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // 타임아웃 증가 (이미지 업로드는 시간이 걸릴 수 있음)
        timeout: 60000, // 60초
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('처방전 업로드 실패:', error);
    throw error;
  }
};

/**
 * 복약 상세 정보 조회
 * GET /users/me/medications/{umno}
 */
export const getMedicationDetail = async (
  umno: number
): Promise<BaseResponse<MedicationDetailResponse>> => {
  try {
    const response = await api.get<BaseResponse<MedicationDetailResponse>>(
      `/users/me/medications/${umno}`
    );
    return response.data;
  } catch (error: any) {
    console.error('복약 상세 정보 조회 실패:', error);
    throw error;
  }
};

/**
 * 복약 카테고리 수정
 * PATCH /users/me/medications/{umno}
 */
export const updateMedicationCategory = async (
  umno: number,
  category: string
): Promise<BaseResponse<MedicationCategoryUpdateResponse>> => {
  try {
    const response = await api.patch<BaseResponse<MedicationCategoryUpdateResponse>>(
      `/users/me/medications/${umno}`,
      { category }
    );
    return response.data;
  } catch (error: any) {
    console.error('복약 카테고리 수정 실패:', error);
    throw error;
  }
};

/**
 * 복약 시간대 조합 수정
 * PUT /users/me/medications/{umno}/combination
 */
export const updateMedicationCombination = async (
  umno: number,
  combination: string
): Promise<BaseResponse<MedicationCombinationResponse>> => {
  try {
    const response = await api.put<BaseResponse<MedicationCombinationResponse>>(
      `/users/me/medications/${umno}/combination`,
      { combination }
    );
    return response.data;
  } catch (error: any) {
    console.error('복약 시간대 조합 수정 실패:', error);
    throw error;
  }
};


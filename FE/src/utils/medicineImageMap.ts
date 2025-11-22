/**
 * 약품 이미지 경로 매핑
 * 백엔드에서 받은 이미지 경로를 프론트엔드 assets 이미지로 변환
 */

// 약품명 -> 이미지 경로 매핑
// 주의: 실제 파일이 존재하는 경우에만 require()를 추가하세요.
// 파일이 없으면 빌드 타임 에러가 발생합니다.
const medicineImageMap: { [key: string]: any } = {
  // 예시: 백엔드에서 "타이레놀"을 받으면 assets/images/pillimages/타이레놀.png 사용
  // 이미지 파일이 추가되면 아래와 같이 매핑을 추가하세요:
  // '타이레놀': require('../../assets/images/pillimages/타이레놀.png'),
  // '게보린정': require('../../assets/images/pillimages/게보린정.png'),
  // '판콜에이내복액': require('../../assets/images/pillimages/판콜에이내복액.png'),
};

/**
 * 약품 이미지 소스 가져오기
 * @param imagePath 백엔드에서 받은 이미지 경로 (예: "타이레놀", "example1")
 * @returns require()로 로드할 이미지 소스 또는 기본 이미지
 */
export const getMedicineImageSource = (imagePath: string | null | undefined): any => {
  // 이미지 경로가 없으면 기본 이미지 반환
  if (!imagePath || imagePath.trim().length === 0) {
    return require('../../assets/images/PillImage.png');
  }
  
  const trimmedPath = imagePath.trim();
  
  // 매핑된 이미지가 있으면 반환
  if (medicineImageMap[trimmedPath]) {
    return medicineImageMap[trimmedPath];
  }
  
  // 매핑되지 않은 경우 기본 이미지 반환
  return require('../../assets/images/PillImage2.png');
};

/**
 * 약품 이미지가 assets에 있는지 확인
 * @param imagePath 백엔드에서 받은 이미지 경로
 * @returns boolean
 */
export const hasMedicineImage = (imagePath: string | null | undefined): boolean => {
  if (!imagePath || imagePath.trim().length === 0) {
    return false;
  }
  
  return medicineImageMap[imagePath.trim()] !== undefined;
};


import sys
import json
import uuid
import time
import requests
import os
import base64

NAVER_OCR_API_URL = os.environ.get("NAVER_OCR_API_URL")
NAVER_OCR_SECRET_KEY = os.environ.get("NAVER_OCR_SECRET_KEY")

INCIZORLENS_API_URL = os.environ.get("INCIZORLENS_API_URL")
INCIZORLENS_API_KEY = os.environ.get("INCIZORLENS_API_KEY")

def call_document_ocr(img_file):
    """
    (1번 모드) 처방전 OCR (IncizorLens API)
    """
    try:
        # 3. 이미지를 읽어서 Base64로 인코딩
        with open(img_file, "rb") as image_file:
            img_base64 = base64.b64encode(image_file.read()).decode('utf-8')

        file_format = os.path.splitext(img_file)[1][1:]
        if not file_format:
            file_format = 'png'

        # 4. API 가이드에 맞는 JSON Payload 생성
        payload = {
            "requestId": str(uuid.uuid4()),
            "version": "V2",
            "timestamp": int(round(time.time() * 1000)),
            "images": [
                {
                    "format": file_format,
                    "name": "prescription_image",
                    "data": img_base64
                }
            ]
        }

        # 5. 인증 헤더 설정
        headers = {
            "Content-Type": "application/json",
            "X-API-KEY": INCIZORLENS_API_KEY
        }

        # 6. JSON으로 API 호출
        response = requests.request("POST", INCIZORLENS_API_URL, headers=headers, json=payload)
        response.raise_for_status() # HTTP 에러 체크

        return json.loads(response.text.encode('utf8'))

    except Exception as e:
        print(f"Python Error in call_document_ocr (Mode 1): {e}", file=sys.stderr)
        return {"error": str(e)}

def call_template_ocr(img_file):
    try:
        # 파일 확장자 추출 (png, jpg 등)
        file_format = os.path.splitext(img_file)[1][1:] # .png -> png
        if not file_format:
            file_format = 'png' # 기본값

        # 1. API 요청 JSON 본문 (테스트 코드와 동일)
        request_json = {
            'images': [
                {
                    'format': file_format,
                    'name': 'pharmacy_img',
                    'templateIds': [39836] # (약봉투 템플릿 ID)
                }
            ],
            'requestId': str(uuid.uuid4()),
            'version': 'V1',
            'timestamp': int(round(time.time() * 1000))
        }

        # 2. multipart/form-data 준비
        payload = {'message': json.dumps(request_json).encode('UTF-8')}
        headers = {'X-OCR-SECRET': NAVER_OCR_SECRET_KEY}

        # 3. Java가 넘겨준 이미지 파일 경로(img_file)로 파일 열기
        with open(img_file, 'rb') as f:
            files = [('file', f)]

            # 4. OCR API 호출
            response = requests.request("POST", NAVER_OCR_API_URL, headers=headers, data=payload, files=files)

            # (HTTP 에러가 났는지 체크)
            response.raise_for_status()

        # 5. 성공 시, JSON 결과 반환
        return json.loads(response.text.encode('utf8'))

    except Exception as e:
        # (모든 에러는 stderr로 출력)
        print(f"Python Error in call_template_ocr: {e}", file=sys.stderr)
        return {"error": str(e)}


# CLI Interface
if __name__ == "__main__":

    if len(sys.argv) < 3:
        print(f"Usage: python {sys.argv[0]} <image_file_path> <mode>", file=sys.stderr)
        sys.exit(1)

    img_file = sys.argv[1]
    mode = sys.argv[2]

    if mode == "1":
        # 처방전 ocr
        output = call_document_ocr(img_file)
    elif mode == "2":
        # 약봉투 ocr
        output = call_template_ocr(img_file)
    else:
        print(f"Invalid mode: {mode}. Use '1' or '2'", file=sys.stderr)
        sys.exit(1)

    print(json.dumps(output, ensure_ascii=False))
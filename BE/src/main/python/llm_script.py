import os
import sys
import openai
import json
import base64

# --- 1. OpenAI API 키 설정 ---
openai.api_key = os.environ.get("OPENAI_API_KEY")

# --- 2. 작업별 함수 정의 ---
def match_medicines(ocr_names_json, db_meds_json):
    """
    [Mode 1] OCR 약품명과 DB 약품명을 매칭하여 mdno 리스트를 반환합니다.
    (Function Calling 사용)
    """

    function_name = "get_matching_mdnos"
    function_schema = {
        "name": function_name,
        "description": "OCR로 스캔한 약품명 리스트와 DB 약품명 리스트를 비교하여, 가장 일치하는 약품의 mdno를 순서대로 반환합니다.",
        "parameters": {
            "type": "object",
            "properties": {
                "mdnos": {
                    "type": "array",
                    "description": "DB의 mdno(Long) 리스트. OCR 리스트와 순서가 동일해야 함.",
                    "items": {"type": "integer"}
                }
            },
            "required": ["mdnos"]
        }
    }

    system_prompt = """
    당신은 약사 데이터 매칭 전문가입니다.
    사용자가 OCR로 스캔한 약품명 리스트와 DB의 약품명(mdno 포함) 리스트를 제공합니다.
    OCR 약품명은 이름이 잘리거나('···') 숫자가 붙어있을 수 있습니다.
    DB 리스트에서 각 OCR 약품명과 가장 일치하는 약품을 찾아, 해당 약품의 'mdno'를 순서대로 반환해야 합니다.
    반드시 'get_matching_mdnos' 함수를 호출하여 결과를 반환해주세요.
    """

    user_prompt = f"OCR로 스캔한 약품명 리스트: {ocr_names_json}\nDB 약품 리스트: {db_meds_json}"

    try:
        response = openai.chat.completions.create(
            model="gpt-4-0613",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            functions=[function_schema],
            function_call={"name": function_name}
        )

        arguments = response.choices[0].message.function_call.arguments
        result_dict = json.loads(arguments) # 예: {"mdnos": [13, ...]}
        return result_dict["mdnos"] # Java가 원하는 [13, ...] 리스트 반환

    except Exception as e:
        print(f"Error in match_medicines: {e}", file=sys.stderr)
        sys.exit(1)


def get_category(classifications_json):
    """
    [Mode 2] 약효 분류 리스트에서 대표 카테고리 1개를 생성합니다.
    (일반 Chat Completion 사용)
    """
    system_prompt = """
    당신은 약사입니다.
    사용자가 약효 분류 리스트를 제공합니다. (예: ["해열제", "콧물약"])
    이 리스트를 대표하는 하나의 '질병명' 또는 '카테고리'를 생성해주세요. (예: "감기약")
    답변은 오직 카테고리명 하나만 한국어로 말해야 합니다.
    절대 다른 설명이나 문장 부호를 붙이지 마세요.
    """

    user_prompt = f"약효 분류 리스트: {classifications_json}"

    try:
        response = openai.chat.completions.create(
            model="gpt-4-0613",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )
        result_text = response.choices[0].message.content.strip().replace('"', '')
        return result_text # 예: "당뇨약"

    except Exception as e:
        print(f"Error in get_category: {e}", file=sys.stderr)
        sys.exit(1)


def create_description(med_info, med_desc, warnings_json):
    """
    [Mode 3] 여러 정보를 조합하여 최종 복약 안내 문구를 생성합니다.
    (일반 Chat Completion 사용)
    """
    system_prompt = """
    당신은 환자에게 친절하게 설명하는 약사입니다.
    다음 정보들을 조합하여 환자가 이해하기 쉬운 하나의 자연스러운 복약 안내 문장을 생성해주세요.
    (예: 이 약은 ...이며, ...와 함께 복용 시 ...할 수 있으니 주의하세요.)
    답변은 오직 최종 안내 문구(한국어)만 말해야 합니다.
    절대 다른 설명이나 인사말을 붙이지 마세요.
    """

    user_prompt = (
        f"- 약품 정보: {med_info}\n"
        f"- 약품 설명: {med_desc}\n"
        f"- 병용섭취 주의사항: {warnings_json}"
    )

    try:
        response = openai.chat.completions.create(
            model="gpt-4-0613",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )
        result_text = response.choices[0].message.content.strip()
        return result_text

    except Exception as e:
        print(f"Error in create_description: {e}", file=sys.stderr)
        sys.exit(1)


def create_report_summary(report_json):
    """
    [Mode 4] 리포트 전체 데이터를 바탕으로 복약 순응도 + 부작용을 요약한 총평을 생성합니다.
    (일반 Chat Completion 사용)
    """

    system_prompt = """
    당신은 고령자 복약 관리를 돕는 약사입니다.
    사용자가 복약 기간, 복약 횟수, 실제 복용 횟수, 부작용 발생 현황이 정리된 리포트 데이터를 제공합니다.
    이 정보를 바탕으로 다음 내용을 포함한 한국어 총평을 3~5문장 정도로 작성하세요.

    - 전체 복약 순응도(잘 지켰는지, 어느 정도인지)
    - 자주 나타난 부작용과 주의할 점
    - 복약을 계속할 때의 간단한 조언 (예: 복약 시간 준수, 특정 증상 지속 시 병원 방문 권유 등)

    말투는 친절하지만 과도하게 가볍지 않게,
    보호자나 의료진이 읽어도 무리가 없도록 작성하세요.
    답변은 오직 총평 문장만 출력하고 다른 설명은 덧붙이지 마세요.
    """

    user_prompt = f"다음은 환자의 복약 리포트 데이터입니다:\n{report_json}"

    try:
        response = openai.chat.completions.create(
            model="gpt-4-0613",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )
        result_text = response.choices[0].message.content.strip()

        encoded = base64.b64encode(result_text.encode("utf-8")).decode("ascii")
        return encoded


    except Exception as e:
        print(f"Error in create_report_summary: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    try:
        mode = sys.argv[1]
        output = None

        if mode == "match_meds":
            ocr_names_json = sys.argv[2]
            db_meds_json = sys.argv[3]
            output = match_medicines(ocr_names_json, db_meds_json)

        elif mode == "category":
            classifications_json = sys.argv[2]
            output = get_category(classifications_json)

        elif mode == "description":
            med_info = sys.argv[2]
            med_desc = sys.argv[3]
            warnings_json = sys.argv[4]
            output = create_description(med_info, med_desc, warnings_json)

        elif mode == "report_summary":
            report_json = sys.argv[2]
            output = create_report_summary(report_json)

        else:
            print(f"Invalid mode: {mode}", file=sys.stderr)
            sys.exit(1)

        print(json.dumps(output, ensure_ascii=False))

    except Exception as e:
        print(f"Python script failed: {e}", file=sys.stderr)
        sys.exit(1)

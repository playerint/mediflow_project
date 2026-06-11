# RAG 답변 Claude 업그레이드 스킬

## 언제 사용하나
ANTHROPIC_API_KEY를 받은 후 LINE 봇 답변 품질을 올릴 때.

## 현재 상태
`ai-service/app/services/rag_service.py`의 `generate_answer()`가
검색된 문서를 그대로 반환 중 (LLM 생성 없음)

## 업그레이드 절차

### 1. 패키지 설치
```bash
cd ai-service
.venv\Scripts\activate
pip install anthropic
```

### 2. rag_service.py 수정
```python
import anthropic

async def generate_answer(query: str, context_docs: list) -> str:
    client = anthropic.Anthropic()  # ANTHROPIC_API_KEY 자동 읽음
    
    context = "\n".join([doc["content"] for doc in context_docs[:3]])
    
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",  # 빠르고 저렴한 모델
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": f"병원 정보:\n{context}\n\n질문: {query}\n\n일본어로 친절하게 답변해주세요."
        }]
    )
    return message.content[0].text
```

### 3. .env에 키 추가
```
ANTHROPIC_API_KEY=sk-ant-...
```

### 4. 테스트
```bash
curl -X POST http://localhost:8000/api/v1/rag/search \
  -H "Content-Type: application/json" \
  -d '{"query": "営業時間は？", "hospital_id": 1}'
```

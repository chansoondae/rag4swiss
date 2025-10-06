# 스위스 여행 RAG 챗봇 🇨🇭

마크다운 블로그 기반 스위스 여행 정보 제공 AI 도우미

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# Python 환경 설정
cd data_pipeline
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 환경 변수 설정
cp .env.example .env
# .env 파일에 API 키 입력

# Next.js 환경 설정
cd ../web
npm install
cp .env.example .env.local
# .env.local 파일에 API 키 입력
```

### 2. 데이터베이스 초기화

```bash
cd data_pipeline
python setup_db.py
```

### 3. 마크다운 파일 처리

`data_pipeline/markdown_files/` 디렉토리에 스위스 여행 관련 마크다운 파일을 추가한 후:

```bash
python process_markdown.py
```

### 4. 웹 애플리케이션 실행

```bash
cd ../web
npm run dev
```

http://localhost:3000 에서 확인

## 📁 프로젝트 구조

```
rag4swiss/
├── data_pipeline/          # Python 데이터 처리
│   ├── markdown_files/     # 원본 마크다운 파일
│   ├── requirements.txt    # Python 의존성
│   ├── config.py          # 설정 파일
│   ├── setup_db.py        # DB 초기화
│   ├── process_markdown.py # 메인 처리 스크립트
│   └── ...
├── web/                   # Next.js 웹 애플리케이션
│   ├── app/              # App Router
│   ├── components/       # React 컴포넌트
│   ├── lib/             # 유틸리티
│   └── ...
└── docs/                # 프로젝트 문서
```

## 🛠️ 기술 스택

- **Backend**: Python, LangChain, OpenAI, Supabase
- **Frontend**: Next.js 14, React, Tailwind CSS
- **Database**: PostgreSQL (Supabase) with pgvector

## 📝 사용법

1. **질문하기**: 웹 인터페이스에서 스위스 여행 관련 질문 입력
2. **답변 받기**: AI가 관련 문서를 검색하고 맞춤형 답변 제공
3. **출처 확인**: 답변과 함께 제공되는 출처 정보 확인

## 🔧 설정

### 필수 환경 변수

**data_pipeline/.env**
```bash
OPENAI_API_KEY=your-api-key
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

**web/.env.local**
```bash
OPENAI_API_KEY=your-api-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🧪 테스트

```bash
# 검색 기능 테스트
cd data_pipeline
python test_search.py

# 헬스체크
curl http://localhost:3000/api/health
```

## 📊 성능

- Vector 검색: < 200ms
- LLM 응답: 2-5초
- 총 응답 시간: < 6초

## 🔒 보안

- API 키는 서버 사이드에서만 사용
- Rate limiting 적용
- 입력 검증 및 sanitization

## 📈 확장 계획

- [ ] 더 많은 스위스 여행 컨텐츠 추가
- [ ] 이미지 검색 기능
- [ ] 여행 일정 추천 기능
- [ ] 다국어 지원

## 🤝 기여

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 라이선스

MIT License
# 스위스 여행 RAG 챗봇 🇨🇭

마크다운 블로그 기반 스위스 여행 정보 제공 AI 도우미
Glass Morphism 디자인의 현대적인 웹 인터페이스

## ✨ 주요 기능

- 🤖 **AI 기반 질문 답변**: OpenAI GPT-4를 활용한 자연스러운 대화
- 🔍 **벡터 검색**: Supabase pgvector를 이용한 의미 기반 문서 검색
- 📊 **관리자 대시보드**: 실시간 분석, 로그 관리, 성능 모니터링
- 💎 **Glass Morphism UI**: Framer Motion 애니메이션이 적용된 현대적 디자인
- 📱 **완전 반응형**: 모바일, 태블릿, 데스크탑 최적화

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone <repository-url>
cd rag4swiss
```

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 다음 SQL 실행:

```sql
-- pgvector extension 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 테이블 생성 (create_function.sql, create_chat_logs_table.sql 실행)
```

### 3. 환경 변수 설정

`web/.env.local` 파일 생성:

```bash
# OpenAI API Key
OPENAI_API_KEY=your-openai-api-key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Application Config
LLM_MODEL=gpt-4-turbo-preview
SEARCH_TOP_K=3
SIMILARITY_THRESHOLD=0.7
```

### 4. 데이터 파이프라인 (선택사항)

마크다운 파일로 데이터를 추가하려면:

```bash
cd data_pipeline
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python process_markdown.py
```

### 5. 웹 애플리케이션 실행

```bash
cd web
npm install
npm run dev
```

**접속:** http://localhost:3000

## 📁 프로젝트 구조

```
rag4swiss/
├── web/                          # Next.js 웹 애플리케이션
│   ├── app/
│   │   ├── page.js              # 메인 페이지 (Glass morphism)
│   │   ├── chat/                # 채팅 인터페이스
│   │   ├── admin/               # 관리자 대시보드
│   │   │   ├── layout.js        # 인증 레이아웃
│   │   │   └── page.js          # 대시보드 UI
│   │   └── api/                 # API Routes
│   │       ├── chat/            # 채팅 API
│   │       └── admin/           # 관리자 API
│   ├── components/              # React 컴포넌트
│   │   ├── MessageBubble.js
│   │   ├── InputBox.js
│   │   └── SourceCard.js
│   ├── lib/                     # 유틸리티
│   │   ├── openai.js
│   │   ├── supabase.js
│   │   └── utils.js
│   └── tailwind.config.js       # Tailwind 설정
├── data_pipeline/               # Python 데이터 처리
│   ├── markdown_files/          # 원본 마크다운
│   ├── process_markdown.py      # 벡터화 스크립트
│   └── requirements.txt
├── create_function.sql          # Supabase 함수
└── create_chat_logs_table.sql   # 로그 테이블
```

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, Tailwind CSS
- **Animation**: Framer Motion
- **Design**: Glass Morphism, 반응형 디자인

### Backend
- **AI**: OpenAI GPT-4 Turbo
- **Database**: Supabase (PostgreSQL + pgvector)
- **Vector Search**: Cosine similarity search
- **Authentication**: LocalStorage 기반 (admin)

### Infrastructure
- **Hosting**: Vercel (추천)
- **Database**: Supabase Cloud
- **API**: Next.js API Routes

## 📱 페이지 구조

### 1. 메인 페이지 (`/`)
- Glass morphism 디자인
- 샘플 질문 카드 (클릭 시 자동 질문)
- 주요 기능 소개
- CTA (Call-to-Action) 버튼

### 2. 채팅 페이지 (`/chat`)
- 실시간 AI 대화
- 메시지 버블 (사용자/AI 구분)
- 출처 표시 (similarity score 포함)
- 자동 스크롤

### 3. 관리자 대시보드 (`/admin`)
**비밀번호:** `swiss2024`

- 📊 전체 통계 (질문 수, 성공률, 평균 응답 시간)
- ⏱️ 성능 분석 (임베딩, 검색, LLM 시간)
- 🔥 인기 질문 TOP 10
- 📝 최근 질문 로그 (페이지네이션)
- 🔐 비밀번호 인증
- 🚪 로그아웃 기능

## 🔧 Supabase 설정 가이드

### 1. 테이블 및 함수 생성

Supabase Dashboard → SQL Editor에서 순서대로 실행:

#### Step 1: Vector Extension 활성화
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

#### Step 2: Travel Content 테이블 (데이터 파이프라인에서 자동 생성)
```sql
-- process_markdown.py 실행 시 자동 생성됨
```

#### Step 3: Vector 검색 함수
```sql
-- create_function.sql 파일의 내용 실행
-- 코사인 거리 기반 유사도 검색
```

#### Step 4: Chat Logs 테이블 및 RLS 정책
```sql
-- create_chat_logs_table.sql 파일의 내용 실행
-- 로그 저장 + Row Level Security 정책
```

### 2. 주요 Supabase 설정 확인사항

- ✅ `pgvector` extension 활성화
- ✅ `travel_content` 테이블 (embedding 컬럼 포함)
- ✅ `chat_logs` 테이블 (RLS 정책 포함)
- ✅ `match_travel_content` 함수 (벡터 검색)
- ✅ `chat_analytics` view (통계 집계)

## 📊 주요 기능 상세

### RAG (Retrieval-Augmented Generation) 플로우

1. **사용자 질문 입력** → OpenAI Embedding API
2. **벡터화** → Query embedding (1536차원)
3. **유사도 검색** → Supabase `match_travel_content` 함수
4. **컨텍스트 구성** → 상위 3개 문서 선택
5. **LLM 응답 생성** → GPT-4 Turbo + 컨텍스트
6. **답변 반환** → 출처 정보 포함

### 로깅 시스템

모든 대화는 `chat_logs` 테이블에 저장:
- 질문/답변 내용
- 검색 결과 및 유사도 점수
- 성능 메트릭 (응답 시간, 임베딩 시간 등)
- 사용자 정보 (IP, User Agent)
- 에러 발생 여부

## 🎨 디자인 시스템

### Glass Morphism 스타일
```css
backdrop-blur-lg bg-white/10 border border-white/20
```

### 색상 팔레트
- **배경**: `from-blue-900 via-purple-900 to-red-900`
- **Glass Cards**: `bg-white/10`, `border-white/20`
- **Accent**: Blue (500-300), Purple (500-300), Red (500-300)

### 애니메이션
- **Float**: 3s ease-in-out infinite (아이콘)
- **Fade In**: 0.5s ease-in-out (페이지 로드)
- **Slide Up**: 0.5s ease-out (카드)
- **Framer Motion**: scale, opacity transitions

## 🔒 보안 및 인증

### 관리자 인증
- **방식**: LocalStorage 기반 간단 인증
- **비밀번호**: `swiss2024` (코드: `admin/layout.js`)
- **보안 개선 권장**: 프로덕션에서는 NextAuth.js 또는 Supabase Auth 사용

### API 보안
- Server-side API keys (`.env.local`)
- CORS 설정
- Input validation

## 📈 성능 최적화

### 측정 지표
- **임베딩 생성**: ~500ms
- **벡터 검색**: ~200ms
- **LLM 응답**: 2-5초
- **총 응답 시간**: ~3-6초

### 최적화 팁
- Similarity threshold 조정 (0.7 → 0.6)
- Top K 결과 수 조정 (3 → 5)
- LLM 모델 변경 (gpt-4-turbo → gpt-3.5-turbo)

## 🚀 배포

### Vercel 배포 (추천)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
cd web
vercel

# 환경 변수 설정
vercel env add OPENAI_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 환경 변수 설정 (Vercel Dashboard)
- Production, Preview, Development 모두 설정 필요

## 🐛 문제 해결

### "vector type does not exist" 오류
→ Supabase에서 `CREATE EXTENSION vector;` 실행

### "row-level security policy" 오류
→ `create_chat_logs_table.sql` 의 RLS 정책 실행

### "operator does not exist: vector <=>" 오류
→ `create_function.sql` 업데이트 버전 실행 (코사인 거리)

## 📄 라이선스

MIT License
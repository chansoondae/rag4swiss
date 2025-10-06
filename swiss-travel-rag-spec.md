# 스위스 여행 RAG 프로젝트 기술 스펙

## 📋 프로젝트 개요

**프로젝트명**: 스위스 여행 RAG 챗봇  
**목적**: 마크다운 블로그 기반 스위스 여행 정보 제공  
**초기 데이터**: 마크다운 파일 10개  
**타겟**: 스위스 여행 계획자를 위한 AI 도우미

---

## 🏗️ 기술 스택

### Backend & Data Pipeline (Python)

```yaml
언어: Python 3.10+

주요 라이브러리:
  - langchain: 0.1.0              # RAG 파이프라인
  - langchain-openai: 0.0.5       # OpenAI 통합
  - openai: 1.12.0                # 임베딩 & LLM
  - supabase: 2.3.4               # DB 클라이언트
  - python-dotenv: 1.0.0          # 환경변수 관리
  - tiktoken: 0.6.0               # 토큰 계산
  - tqdm: 4.66.1                  # 진행률 표시

용도:
  1. 마크다운 파일 파싱 및 전처리
  2. 텍스트 청킹 (의미 단위 분할)
  3. 임베딩 벡터 생성
  4. Supabase Vector DB 업로드
  5. 주기적 컨텐츠 업데이트
```

### Frontend & API (Next.js)

```yaml
프레임워크: Next.js 14+ (App Router)
언어: JavaScript (ES6+)
스타일링: Tailwind CSS 3.4+

주요 라이브러리:
  - next: 14.1.0
  - react: 18.2.0
  - @supabase/supabase-js: 2.39.7  # DB 클라이언트
  - openai: 4.28.0                  # LLM API (서버 사이드만)

페이지 구조:
  /app
    /api
      /chat/route.js              # 채팅 API (POST)
      /health/route.js            # 헬스체크 (GET)
    /chat
      page.js                     # 채팅 인터페이스
    page.js                       # 랜딩 페이지
    layout.js                     # 전역 레이아웃
```

### Database (Supabase)

```yaml
데이터베이스: PostgreSQL 15+ with pgvector
호스팅: Supabase Cloud
플랜: Free Tier (초기) → Pro ($25/월)
리전: Seoul, Northeast Asia

확장 기능:
  - pgvector: Vector 검색
  - (선택) pg_trgm: 텍스트 유사도 검색
```

---

## 📁 프로젝트 구조

```
switzerland-travel-rag/
├── data_pipeline/                 # Python 데이터 처리
│   ├── venv/                      # Python 가상환경 (git ignore)
│   ├── markdown_files/            # 원본 마크다운 파일
│   │   ├── 01-rigi-mountain.md
│   │   ├── 02-jungfrau-guide.md
│   │   ├── 03-lucerne-city.md
│   │   └── ... (총 10개)
│   │
│   ├── .env                       # 환경변수 (git ignore)
│   ├── requirements.txt           # Python 의존성
│   ├── config.py                  # 설정 상수
│   ├── setup_db.py                # DB 초기화
│   ├── process_markdown.py        # 메인 처리 스크립트
│   ├── markdown_parser.py         # 마크다운 파싱 로직
│   ├── chunking.py                # 청킹 로직
│   ├── embedder.py                # 임베딩 생성
│   ├── uploader.py                # DB 업로드
│   ├── update_content.py          # 컨텐츠 업데이트
│   └── test_search.py             # 검색 테스트
│
├── web/                           # Next.js 웹 애플리케이션
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.js       # 채팅 API
│   │   │   └── health/
│   │   │       └── route.js       # 헬스체크
│   │   │
│   │   ├── chat/
│   │   │   └── page.js            # 채팅 페이지
│   │   │
│   │   ├── layout.js              # 전역 레이아웃
│   │   ├── page.js                # 랜딩 페이지
│   │   └── globals.css            # 전역 스타일
│   │
│   ├── components/
│   │   ├── ChatInterface.js       # 채팅 컨테이너
│   │   ├── MessageList.js         # 메시지 목록
│   │   ├── MessageBubble.js       # 개별 메시지
│   │   ├── InputBox.js            # 입력창
│   │   ├── SourceCard.js          # 출처 표시 카드
│   │   └── LoadingIndicator.js    # 로딩 표시
│   │
│   ├── lib/
│   │   ├── supabase.js            # Supabase 클라이언트
│   │   ├── openai.js              # OpenAI 클라이언트
│   │   └── utils.js               # 유틸리티 함수
│   │
│   ├── public/
│   │   ├── logo.svg
│   │   └── og-image.jpg
│   │
│   ├── .env.local                 # 환경변수 (git ignore)
│   ├── .gitignore
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── next.config.js
│
├── docs/
│   ├── SETUP.md                   # 설치 가이드
│   ├── ARCHITECTURE.md            # 아키텍처 문서
│   └── API.md                     # API 문서
│
├── .gitignore
└── README.md
```

---

## 🗄️ 데이터베이스 스키마

### 테이블 정의

```sql
-- pgvector 확장 활성화
create extension if not exists vector;

-- 메인 컨텐츠 테이블
create table travel_content (
  id bigserial primary key,
  
  -- 실제 컨텐츠
  content text not null,
  embedding vector(1536),
  
  -- 문서 메타데이터
  title text not null,
  file_name text not null,
  category text,                    -- 카테고리 (교통/숙박/음식/관광)
  
  -- 마크다운 구조
  section_title text,               -- 섹션 제목 (## 헤더)
  section_level int default 1,      -- 헤더 레벨 (1=h1, 2=h2, ...)
  
  -- 청킹 정보
  chunk_index int not null,         -- 현재 청크 인덱스
  total_chunks int not null,        -- 전체 청크 개수
  parent_chunk_id bigint,           -- 이전 청크 참조
  
  -- 최신성 관리
  last_updated timestamptz default now(),
  source_updated_at timestamptz,
  
  -- 추가 메타데이터
  tags text[],                      -- 태그 배열
  location text,                    -- 위치 정보
  estimated_reading_time int,       -- 예상 읽기 시간(초)
  
  -- 타임스탬프
  created_at timestamptz default now(),
  
  -- 외래키 제약
  constraint fk_parent_chunk 
    foreign key (parent_chunk_id) 
    references travel_content(id)
    on delete set null
);

-- 인덱스 생성
-- 1. Vector 검색용 HNSW 인덱스 (가장 중요!)
create index travel_content_embedding_idx 
on travel_content 
using hnsw (embedding vector_cosine_ops);

-- 2. 메타데이터 검색용 B-tree 인덱스
create index idx_category on travel_content(category);
create index idx_file_name on travel_content(file_name);
create index idx_last_updated on travel_content(last_updated desc);
create index idx_tags on travel_content using gin(tags);

-- 3. 청크 연결 조회용
create index idx_parent_chunk on travel_content(parent_chunk_id);
```

### Vector 검색 함수

```sql
-- 기본 Vector 검색 함수
create or replace function match_travel_content (
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 5,
  filter_category text default null
)
returns table (
  id bigint,
  content text,
  title text,
  file_name text,
  category text,
  section_title text,
  chunk_index int,
  total_chunks int,
  similarity float,
  created_at timestamptz
)
language plpgsql
as $$
begin
  return query
  select
    tc.id,
    tc.content,
    tc.title,
    tc.file_name,
    tc.category,
    tc.section_title,
    tc.chunk_index,
    tc.total_chunks,
    1 - (tc.embedding <=> query_embedding) as similarity,
    tc.created_at
  from travel_content tc
  where 
    (filter_category is null or tc.category = filter_category)
    and 1 - (tc.embedding <=> query_embedding) > match_threshold
  order by tc.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 확장된 컨텍스트 검색 함수 (앞뒤 청크 포함)
create or replace function match_with_context (
  query_embedding vector(1536),
  match_count int default 3,
  context_window int default 1
)
returns table (
  id bigint,
  content text,
  title text,
  file_name text,
  similarity float,
  is_main_match boolean
)
language plpgsql
as $$
begin
  return query
  with main_matches as (
    select 
      tc.id,
      tc.file_name,
      tc.chunk_index,
      1 - (tc.embedding <=> query_embedding) as sim
    from travel_content tc
    order by tc.embedding <=> query_embedding
    limit match_count
  ),
  expanded_matches as (
    select distinct
      tc.id,
      tc.content,
      tc.title,
      tc.file_name,
      tc.chunk_index,
      mm.sim as similarity,
      (tc.id = mm.id) as is_main_match
    from main_matches mm
    join travel_content tc 
      on tc.file_name = mm.file_name
      and tc.chunk_index between 
        mm.chunk_index - context_window 
        and mm.chunk_index + context_window
  )
  select 
    em.id,
    em.content,
    em.title,
    em.file_name,
    em.similarity,
    em.is_main_match
  from expanded_matches em
  order by em.file_name, em.chunk_index;
end;
$$;
```

---

## 🔄 데이터 플로우

### 1. 데이터 준비 단계 (Python)

```
마크다운 파일 (markdown_files/*.md)
    ↓
[1] markdown_parser.py
    - 프론트매터 파싱 (title, category, tags)
    - 섹션별 분리 (## 헤더 기준)
    - 코드 블록/이미지 처리
    ↓
[2] chunking.py
    - RecursiveCharacterTextSplitter 사용
    - 청크 크기: 800 tokens
    - 오버랩: 200 tokens
    - 의미 단위 유지 (문단, 문장)
    ↓
[3] embedder.py
    - OpenAI text-embedding-ada-002
    - 배치 처리 (100개씩)
    - Rate limit 고려 (3,000 RPM)
    ↓
[4] uploader.py
    - Supabase 업로드
    - 메타데이터 함께 저장
    - 진행률 표시 (tqdm)
    ↓
Supabase Vector DB
```

### 2. 사용자 요청 단계 (Next.js)

```
사용자 질문 입력
    ↓
[1] 프론트엔드 (ChatInterface.js)
    - fetch('/api/chat', { method: 'POST', body: { message } })
    ↓
[2] API Route (/api/chat/route.js)
    - 질문 임베딩 생성
    - Supabase match_travel_content() 호출
    - Top 3-5 관련 청크 검색
    ↓
[3] Context 구성
    - 검색된 청크들 조합
    - 출처 정보 포함
    - 프롬프트 템플릿 적용
    ↓
[4] OpenAI API 호출
    - 모델: gpt-4-turbo 또는 gpt-3.5-turbo
    - 스트리밍 응답 (선택)
    - Temperature: 0.7
    ↓
[5] 응답 반환
    - AI 답변
    - 출처 정보 (file_name, section_title)
    - 신뢰도 점수 (similarity)
    ↓
프론트엔드에 표시
```

---

## 🔧 환경변수 설정

### Python (.env)

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-...

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 설정
CHUNK_SIZE=800
CHUNK_OVERLAP=200
EMBEDDING_MODEL=text-embedding-ada-002
```

### Next.js (.env.local)

```bash
# OpenAI (서버 사이드 전용 - NEXT_PUBLIC_ 없음!)
OPENAI_API_KEY=sk-proj-...

# Supabase (클라이언트에서도 사용)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 설정
LLM_MODEL=gpt-4-turbo
SEARCH_TOP_K=3
SIMILARITY_THRESHOLD=0.7
```

**중요**: `OPENAI_API_KEY`는 `NEXT_PUBLIC_` 접두사 없이 설정하여 서버 사이드에서만 사용!

---

## 📦 의존성

### Python (requirements.txt)

```txt
# Core
langchain==0.1.0
langchain-community==0.0.13
langchain-openai==0.0.5
openai==1.12.0

# Database
supabase==2.3.4

# Utilities
python-dotenv==1.0.0
tiktoken==0.6.0
tqdm==4.66.1

# Markdown processing
markdown==3.5.2
python-frontmatter==1.0.1
```

### Next.js (package.json)

```json
{
  "name": "switzerland-travel-rag",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.7",
    "openai": "^4.28.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35"
  }
}
```

---

## 🎨 UI/UX 설계

### 채팅 인터페이스 (ChatInterface.js)

```
레이아웃:
┌─────────────────────────────────────┐
│  🇨🇭 스위스 여행 AI 도우미         │  ← 헤더
├─────────────────────────────────────┤
│                                     │
│  🤖 안녕하세요! 스위스 여행에      │  ← AI 메시지
│     관해 물어보세요                 │
│                                     │
│            리기산 가는 방법?  👤   │  ← 사용자 메시지
│                                     │
│  🤖 리기산은 두 가지 방법으로...    │  ← AI 응답
│     📄 출처: rigi-mountain.md       │  ← 출처 표시
│                                     │
│                                     │  ← 스크롤 가능 영역
├─────────────────────────────────────┤
│  💬 질문을 입력하세요...      [전송] │  ← 입력창
└─────────────────────────────────────┘

기능:
✅ 실시간 타이핑 효과 (스트리밍)
✅ 출처 표시 (클릭 시 원본 확인)
✅ 로딩 인디케이터 (점 3개 애니메이션)
✅ 자동 스크롤 (새 메시지 시 하단으로)
✅ 모바일 반응형
```

### 랜딩 페이지 (page.js)

```
섹션:
1. 히어로
   - 제목: "스위스 여행, AI에게 물어보세요"
   - 부제: "10개의 상세 가이드 기반 즉시 답변"
   - CTA 버튼: "지금 질문하기"

2. 예시 질문
   - "리기산 가는 방법?"
   - "융프라우요흐 티켓 가격은?"
   - "루체른에서 하루 일정 추천해줘"

3. 특징
   - ⚡ 즉시 답변
   - 📚 신뢰할 수 있는 정보
   - 🇨🇭 스위스 전문

4. CTA
   - "무료로 시작하기"
```

### 디자인 시스템 (Tailwind)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        swiss: {
          red: '#FF0000',
          white: '#FFFFFF',
          gray: '#F5F5F5'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  }
}
```

---

## 🧪 테스트 전략

### Python 테스트

```python
# test_search.py
def test_vector_search():
    """Vector 검색 기능 테스트"""
    query = "리기산 가는 방법"
    results = search_travel_content(query, top_k=3)
    
    assert len(results) > 0
    assert results[0]['similarity'] > 0.7
    assert 'content' in results[0]

def test_chunking():
    """청킹 로직 테스트"""
    text = "..." # 긴 텍스트
    chunks = chunk_text(text, chunk_size=800, overlap=200)
    
    assert len(chunks) > 0
    assert all(len(c) <= 1000 for c in chunks)
```

### Next.js 테스트

```javascript
// 수동 테스트 체크리스트
□ 채팅 메시지 전송
□ AI 응답 수신
□ 출처 표시 확인
□ 모바일 반응형
□ 로딩 상태 표시
□ 에러 핸들링
```

---

## 🚀 개발 워크플로우

### 초기 설정 (30분)

```bash
# 1. Supabase 프로젝트 생성
- https://supabase.com 가입
- New Project → Seoul 리전
- Free Tier 선택

# 2. Python 환경 설정
cd data_pipeline
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. 환경변수 설정
cp .env.example .env
# .env 파일 편집 (API 키 입력)

# 4. DB 초기화
python setup_db.py

# 5. 마크다운 파일 처리
python process_markdown.py

# 6. Next.js 설정
cd ../web
npm install
cp .env.example .env.local
# .env.local 파일 편집

# 7. 개발 서버 실행
npm run dev
```

### 개발 사이클

```
1. 마크다운 파일 추가/수정
   ↓
2. python process_markdown.py 실행
   ↓
3. 브라우저에서 테스트 (localhost:3000)
   ↓
4. 필요시 프롬프트/UI 수정
   ↓
5. 반복
```

---

## 📊 성능 목표 및 제약사항

### 성능 목표

```
응답 시간:
- Vector 검색: < 200ms
- 임베딩 생성: < 500ms
- LLM 응답: 2-5초
- 총 응답 시간: < 6초

정확도:
- Vector 검색 정확도: > 85%
- 답변 만족도: > 4.0/5.0
- 출처 정확성: 100%

확장성:
- 동시 사용자: 100명
- 문서 수: 100개까지
- 청크 수: 1,000개까지
```

### Supabase Free Tier 제약사항

```
제한사항:
- DB 저장소: 500MB
- 파일 저장소: 1GB  
- 월간 활성 사용자: 50,000명
- 월간 대역폭: 2GB
- 7일 비활성 시 일시 정지

예상 사용량 (10개 문서 기준):
- Vector DB: ~200MB ✅
- 월 사용자: ~500명 ✅
- 월 대역폭: ~500MB ✅

→ Free Tier로 충분!
```

---

## 💰 예상 비용

### 개발 단계 (테스트)

```
Supabase: $0 (Free Tier)
OpenAI:
  - 임베딩: $0.10 (100,000 토큰)
  - GPT-4: $3.00 (100 요청)
Vercel: $0 (Hobby)
─────────────────────
총: ~$3/월
```

### 프로덕션 (월 1,000명 사용자)

```
Supabase: $25 (Pro Plan)
OpenAI:
  - 임베딩: $1 (신규 컨텐츠)
  - GPT-4: $50 (1,000 요청 × $0.05)
Vercel: $0 (Hobby 충분)
─────────────────────
총: ~$76/월
```

---

## 🔐 보안 고려사항

### API 키 보안

```javascript
// ❌ 나쁜 예: 클라이언트에서 직접 사용
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY  // 노출됨!
})

// ✅ 좋은 예: API Route에서만 사용
// /app/api/chat/route.js
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY  // 서버 사이드만
})
```

### Rate Limiting

```javascript
// 간단한 Rate Limiting (IP 기반)
const requestCounts = new Map()

function checkRateLimit(ip) {
  const count = requestCounts.get(ip) || 0
  if (count > 10) {  // 10 requests/minute
    throw new Error('Too many requests')
  }
  requestCounts.set(ip, count + 1)
}
```

### 입력 검증

```javascript
// 사용자 입력 검증
function validateInput(message) {
  if (!message
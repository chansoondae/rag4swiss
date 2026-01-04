# 스위스 여행 RAG 챗봇 🇨🇭

스위스프렌즈 커뮤니티 데이터 기반 스위스 여행 정보 제공 AI 도우미
Glass Morphism 디자인의 현대적인 웹 인터페이스

## ✨ 주요 기능

- 🤖 **AI 기반 질문 답변**: OpenAI GPT-4를 활용한 자연스러운 대화
- 🔍 **벡터 검색**: Supabase pgvector를 이용한 의미 기반 문서 검색
- 📊 **관리자 대시보드**: 실시간 분석, 로그 관리, 성능 모니터링
- 📝 **콘텐츠 관리**: 스위스프렌즈 게시글 조회 및 필터링
- 👤 **작가별 페이지**: 작성자별 게시글 모음 및 본문/댓글 조회
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
2. SQL Editor에서 다음 테이블 생성:

```sql
-- pgvector extension 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 여행 콘텐츠 테이블 (create_function.sql, create_chat_logs_table.sql 실행)
-- 스위스프렌즈 콘텐츠 테이블 (swissfriends_content_all)
-- 게시글 본문 테이블 (swissfriends_post_contents)
-- 댓글 테이블 (swissfriends_post_comments)
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
│   │   ├── contents/            # 콘텐츠 관리
│   │   │   ├── page.js          # 전체 게시글 목록
│   │   │   └── [author]/        # 작가별 페이지
│   │   │       └── page.js      # 작가별 게시글 모음
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
- **Framework**: Next.js 16 (App Router)
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

### 3. 콘텐츠 페이지 (`/contents`)
**주요 기능:**
- 📁 카테고리 필터 (52개 카테고리, 펼치기/접기)
- 📅 날짜 범위 선택 (2025.01.01 ~ 2025.12.31 초기값)
- 🔍 정렬 기준 (최신순, 오래된순, 조회수 많은순, 댓글 많은순)
- 👤 작성자 제외 필터 (차가운순대 제외 옵션)
- 🔗 작성자 클릭 시 작가별 페이지 이동
- 📊 테이블 형식으로 게시글 조회

**카테고리 목록:**
- 질문게시판 (❓질문게시판 Q&A, 여행 질문 Q&A)
- 지역별 (★루체른★, ★인터라켄★, ★체르마트★)
- 주제별 (🧳짐싸기 꿀팁, 🍽️스위스 맛집 후기, 🏨스위스 숙소 후기 등)
- 국가별 (🇨🇭스위스, 🇫🇷프랑스, 🇮🇹이탈리아 등)
- 총 52개 카테고리

### 4. 작가별 페이지 (`/contents/[author]`)
**주요 기능:**
- 📝 작성자의 모든 게시글 표시
- 🔍 질문게시판 제외 필터
- 📄 불러오기/접기 버튼 (본문 및 댓글 표시)
- 📋 복사하기 버튼 (전체 게시글 정보 클립보드 복사)
- 💬 게시글별 댓글 표시

**카드 형식:**
- 제목 (URL 링크)
- 카테고리, 날짜, 조회수, 댓글수 (이모지 포함)
- 본문 내용 (펼침 시)
- 댓글 목록 (펼침 시)

**복사 기능:**
- 접힌 상태: 기본 정보만 복사
- 펼친 상태: 본문 + 댓글 포함 복사
- 질문게시판 제외 옵션 적용
- 구분선으로 게시글 구분

### 5. 관리자 대시보드 (`/admin`)
**비밀번호:** `swiss2024`

- 📊 전체 통계 (질문 수, 성공률, 평균 응답 시간)
- ⏱️ 성능 분석 (임베딩, 검색, LLM 시간)
- 🔥 인기 질문 TOP 10
- 📝 최근 질문 로그 (페이지네이션)
- 🔐 비밀번호 인증
- 🚪 로그아웃 기능

## 🗄️ 데이터베이스 스키마

### 1. 여행 콘텐츠 (`travel_content`)
- RAG 시스템용 벡터화된 여행 정보
- embedding 컬럼 (pgvector)

### 2. 스위스프렌즈 콘텐츠 (`swissfriends_content_all`)
```sql
- id: 게시글 ID
- category: 카테고리
- title: 제목
- author: 작성자
- date: 작성일
- view_count: 조회수
- comments: 댓글수
- url: 원본 URL
```

### 3. 게시글 본문 (`swissfriends_post_contents`)
```sql
- id: 게시글 ID (FK)
- title: 제목
- content: 본문 내용
```

### 4. 댓글 (`swissfriends_post_comments`)
```sql
- id: 댓글 ID
- post_id: 게시글 ID (FK)
- post_author: 게시글 작성자
- comment_author: 댓글 작성자
- comment_text: 댓글 내용
- comment_date: 댓글 작성일
- comment_order: 댓글 순서
```

### 5. 채팅 로그 (`chat_logs`)
- 모든 대화 기록 및 성능 메트릭

## 🔧 Supabase 설정 가이드

### 1. 테이블 및 함수 생성

Supabase Dashboard → SQL Editor에서 순서대로 실행:

#### Step 1: Vector Extension 활성화
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

#### Step 2: Travel Content 테이블
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
```

#### Step 5: 스위스프렌즈 테이블
- swissfriends_content_all (게시글 메타데이터)
- swissfriends_post_contents (게시글 본문)
- swissfriends_post_comments (댓글)

### 2. 주요 Supabase 설정 확인사항

- ✅ `pgvector` extension 활성화
- ✅ `travel_content` 테이블 (embedding 컬럼 포함)
- ✅ `chat_logs` 테이블 (RLS 정책 포함)
- ✅ `match_travel_content` 함수 (벡터 검색)
- ✅ `chat_analytics` view (통계 집계)
- ✅ 스위스프렌즈 관련 테이블 3개

## 📊 주요 기능 상세

### RAG (Retrieval-Augmented Generation) 플로우

1. **사용자 질문 입력** → OpenAI Embedding API
2. **벡터화** → Query embedding (1536차원)
3. **유사도 검색** → Supabase `match_travel_content` 함수
4. **컨텍스트 구성** → 상위 3개 문서 선택
5. **LLM 응답 생성** → GPT-4 Turbo + 컨텍스트
6. **답변 반환** → 출처 정보 포함

### 콘텐츠 관리 시스템

**필터링 옵션:**
- 카테고리별 (다중 선택, 전체선택/해제)
- 날짜 범위 (시작일 ~ 종료일)
- 작성자 제외 (특정 작성자 필터링)
- 정렬 기준 (날짜/조회수/댓글수)

**작가별 페이지:**
- 작성자의 모든 게시글 조회
- 본문 및 댓글 일괄 불러오기
- 질문게시판 제외 옵션
- 전체 내용 복사 기능

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
- **Buttons**: Gradient (blue-to-purple, green-to-emerald)

### 애니메이션
- **Float**: 3s ease-in-out infinite (아이콘)
- **Fade In**: 0.5s ease-in-out (페이지 로드)
- **Slide Up**: 0.5s ease-out (카드)
- **Framer Motion**: scale, opacity transitions

### UI 컴포넌트
- **체크박스**: 커스텀 디자인, 체크마크 애니메이션
- **카드**: Glass morphism, hover 효과
- **버튼**: 그라데이션, 그림자 효과
- **테이블**: 반응형, 천 단위 콤마, 날짜 포맷

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
- 콘텐츠 페이지: 서버 사이드 정렬 및 필터링

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

### 콘텐츠 페이지에서 데이터가 안 보임
→ Supabase에 스위스프렌즈 테이블 데이터 확인

## 📝 향후 개선 사항

- [ ] 실시간 검색 (타이핑하면 자동 검색)
- [ ] 북마크 기능
- [ ] 게시글 상세 페이지
- [ ] 댓글 작성 기능
- [ ] 사용자 인증 시스템
- [ ] 이미지 업로드 및 표시
- [ ] 다국어 지원

## 📄 라이선스

MIT License

# RAG 시스템 설계 문서
## Supabase 게시글 데이터 통합

### 1. 개요

기존 Markdown 파일 기반 RAG 시스템에 Supabase의 스위스프렌즈 커뮤니티 게시글 데이터를 통합합니다.

**목표:**
- 커뮤니티 게시글의 본문(content)과 댓글(comments)을 RAG 시스템에 포함
- 메타데이터(카테고리, 작성자, 날짜, 조회수 등)를 활용한 컨텍스트 검색
- 기존 Markdown 파일 처리 파이프라인과 통합된 구조

---

### 2. 데이터 소스 분석

#### 2.1 Supabase 테이블 구조

**swissfriends_content_all** (메타데이터 테이블)
```sql
- id: bigint (PK)
- category: text (카테고리)
- title: text (제목)
- author: text (작성자)
- date: timestamptz (작성일)
- view_count: int (조회수)
- comments: int (댓글 수)
- url: text (원본 URL)
- post_month: smallint (게시 월, 0-12)
- created_at: timestamptz
```

**swissfriends_post_contents** (본문 테이블)
```sql
- id: bigint (PK, FK to content_all)
- title: text
- content: text (게시글 본문)
- created_at: timestamptz
- updated_at: timestamptz
```

**swissfriends_post_comments** (댓글 테이블, 추정)
```sql
- id: bigint (PK)
- post_id: bigint (FK to content_all)
- author: text
- content: text
- created_at: timestamptz
```

---

### 3. RAG 시스템 아키텍처

#### 3.1 데이터 플로우

```
[Supabase DB]
    ├── swissfriends_content_all (메타데이터)
    ├── swissfriends_post_contents (본문)
    └── swissfriends_post_comments (댓글)
           ↓
    [데이터 추출 & 병합]
           ↓
    [청킹 & 임베딩 생성]
           ↓
    [Supabase Vector Store]
           ↓
    [RAG 검색 & 응답]
```

#### 3.2 통합 Vector Store 테이블

**travel_content** (기존 테이블 확장)
```sql
create table if not exists travel_content (
  id bigserial primary key,

  -- 실제 컨텐츠
  content text not null,
  embedding vector(1536),

  -- 문서 메타데이터
  title text not null,
  file_name text,  -- markdown 파일명 또는 'post_{id}'
  category text,

  -- 소스 구분
  source_type text not null,  -- 'markdown' | 'community_post' | 'community_comment'
  source_id bigint,  -- 원본 게시글/댓글 ID

  -- 마크다운 구조 (markdown 전용)
  section_title text,
  section_level int default 1,

  -- 커뮤니티 게시글 메타데이터
  author text,
  post_date timestamptz,
  view_count int,
  comment_count int,
  post_month smallint,
  original_url text,

  -- 청킹 정보
  chunk_index int not null,
  total_chunks int not null,
  parent_chunk_id bigint,

  -- 최신성 관리
  last_updated timestamptz default now(),
  source_updated_at timestamptz,

  -- 추가 메타데이터
  tags text[],
  location text,
  estimated_reading_time int,

  -- 타임스탬프
  created_at timestamptz default now(),

  -- 외래키 제약
  constraint fk_parent_chunk
    foreign key (parent_chunk_id)
    references travel_content(id)
    on delete set null
);

-- 인덱스 추가
create index if not exists idx_source_type on travel_content(source_type);
create index if not exists idx_source_id on travel_content(source_id);
create index if not exists idx_author on travel_content(author);
create index if not exists idx_post_date on travel_content(post_date desc);
create index if not exists idx_post_month on travel_content(post_month);
```

---

### 4. 데이터 처리 파이프라인

#### 4.1 폴더 구조

```
data_pipeline/
├── config.py                    # 설정 (기존)
├── chunking.py                  # 청킹 로직 (기존)
├── embedder.py                  # 임베딩 생성 (기존)
├── uploader.py                  # DB 업로드 (기존)
├── markdown_parser.py           # MD 파서 (기존)
├── process_markdown.py          # MD 처리 (기존)
│
├── supabase_fetcher.py          # NEW: Supabase 데이터 추출
├── post_processor.py            # NEW: 게시글 데이터 처리
├── comment_processor.py         # NEW: 댓글 데이터 처리
├── process_community_posts.py   # NEW: 커뮤니티 데이터 메인 스크립트
└── process_all.py               # NEW: 전체 통합 실행 스크립트
```

#### 4.2 새로운 모듈 설계

##### 4.2.1 supabase_fetcher.py

**역할:** Supabase에서 게시글/댓글 데이터 추출

```python
class SupabaseFetcher:
    def __init__(self):
        self.client = create_client(SUPABASE_URL, SUPABASE_KEY)

    def fetch_posts_with_content(self, limit=None, category=None):
        """
        게시글 메타데이터와 본문을 조인하여 가져오기

        Returns:
            List[Dict]: 게시글 정보
            [
                {
                    'id': 123,
                    'title': '제목',
                    'content': '본문',
                    'category': '카테고리',
                    'author': '작성자',
                    'date': datetime,
                    'view_count': 100,
                    'comment_count': 5,
                    'url': 'https://...',
                    'post_month': 3
                },
                ...
            ]
        """

    def fetch_comments_by_post(self, post_id):
        """
        특정 게시글의 댓글 가져오기

        Returns:
            List[Dict]: 댓글 리스트
        """

    def fetch_all_posts_with_comments(self):
        """
        모든 게시글과 댓글을 함께 가져오기
        """
```

##### 4.2.2 post_processor.py

**역할:** 게시글 데이터를 청킹 및 메타데이터 구성

```python
class PostProcessor:
    def __init__(self, chunker: TextChunker):
        self.chunker = chunker

    def process_post(self, post_data: Dict) -> List[Dict]:
        """
        게시글을 청킹하고 메타데이터 추가

        청킹 전략:
        1. 제목 + 본문을 하나의 문서로 처리
        2. CHUNK_SIZE에 따라 본문을 분할
        3. 각 청크에 게시글 메타데이터 포함

        Args:
            post_data: fetch_posts_with_content()의 결과 항목

        Returns:
            List[Dict]: 청크 리스트
            [
                {
                    'content': '청크 내용',
                    'chunk_index': 0,
                    'total_chunks': 3,
                    'source_type': 'community_post',
                    'source_id': 123,
                    'title': '게시글 제목',
                    'category': '카테고리',
                    'author': '작성자',
                    'post_date': datetime,
                    'view_count': 100,
                    'comment_count': 5,
                    'post_month': 3,
                    'original_url': 'https://...',
                    'tags': ['스위스', '여행'],
                    'file_name': 'post_123'
                },
                ...
            ]
        """

    def extract_tags_from_content(self, content: str) -> List[str]:
        """
        본문에서 태그 추출 (키워드 기반)
        예: 지역명, 관광지명 등
        """

    def estimate_reading_time(self, content: str) -> int:
        """
        읽기 시간 추정 (분 단위)
        """
```

##### 4.2.3 comment_processor.py

**역할:** 댓글 데이터 처리

```python
class CommentProcessor:
    def __init__(self, chunker: TextChunker):
        self.chunker = chunker

    def process_comments_for_post(
        self,
        post_id: int,
        post_title: str,
        comments: List[Dict],
        post_metadata: Dict
    ) -> List[Dict]:
        """
        게시글의 댓글들을 청킹

        청킹 전략:
        1. 댓글들을 시간순으로 정렬
        2. 여러 댓글을 하나의 청크로 묶기 (CHUNK_SIZE 고려)
        3. 청크가 너무 작으면 여러 댓글 병합
        4. 청크가 너무 크면 댓글 단위로 분할

        Args:
            post_id: 게시글 ID
            post_title: 게시글 제목 (컨텍스트용)
            comments: 댓글 리스트
            post_metadata: 게시글 메타데이터

        Returns:
            List[Dict]: 댓글 청크 리스트
            [
                {
                    'content': '댓글1\n댓글2\n...',
                    'chunk_index': 0,
                    'total_chunks': 2,
                    'source_type': 'community_comment',
                    'source_id': 123,  # post_id
                    'title': '게시글 제목 - 댓글',
                    'category': '카테고리',
                    'author': 'multiple',  # 여러 댓글 병합 시
                    'file_name': 'post_123_comments'
                },
                ...
            ]
        """

    def merge_comments(self, comments: List[Dict], max_tokens: int) -> List[str]:
        """
        댓글들을 토큰 제한에 맞춰 병합
        """
```

##### 4.2.4 process_community_posts.py

**역할:** 커뮤니티 데이터 처리 메인 스크립트

```python
def process_community_posts():
    """
    Supabase 커뮤니티 게시글/댓글 처리 메인 함수
    """

    # 1. 컴포넌트 초기화
    fetcher = SupabaseFetcher()
    chunker = TextChunker()
    post_processor = PostProcessor(chunker)
    comment_processor = CommentProcessor(chunker)
    embedder = EmbeddingGenerator()
    uploader = DatabaseUploader()

    # 2. 연결 테스트
    # ...

    # 3. 게시글 데이터 가져오기
    posts = fetcher.fetch_posts_with_content()

    # 4. 각 게시글 처리
    all_chunks = []

    for post in posts:
        # 4.1 게시글 본문 청킹
        post_chunks = post_processor.process_post(post)
        all_chunks.extend(post_chunks)

        # 4.2 댓글 가져오기 및 청킹
        comments = fetcher.fetch_comments_by_post(post['id'])
        if comments:
            comment_chunks = comment_processor.process_comments_for_post(
                post['id'],
                post['title'],
                comments,
                post_metadata={
                    'category': post['category'],
                    'author': post['author'],
                    'post_date': post['date']
                }
            )
            all_chunks.extend(comment_chunks)

    # 5. 임베딩 생성
    embedded_chunks = embedder.embed_chunks(all_chunks)

    # 6. DB 업로드
    uploader.upload_chunks(embedded_chunks)

    # 7. 관계 업데이트
    uploader.update_parent_chunk_ids(embedded_chunks)
```

##### 4.2.5 process_all.py

**역할:** 전체 파이프라인 통합 실행

```python
def process_all_sources():
    """
    Markdown 파일 + 커뮤니티 게시글 모두 처리
    """

    print("=" * 60)
    print("스위스 여행 RAG 시스템 - 전체 데이터 처리")
    print("=" * 60)

    # 1. Markdown 파일 처리
    print("\n[1/2] Markdown 파일 처리 중...")
    from process_markdown import process_markdown_files
    success_md = process_markdown_files()

    # 2. 커뮤니티 게시글 처리
    print("\n[2/2] 커뮤니티 게시글 처리 중...")
    from process_community_posts import process_community_posts
    success_posts = process_community_posts()

    # 3. 최종 통계
    if success_md and success_posts:
        uploader = DatabaseUploader()
        total_chunks = uploader.get_chunk_count()

        print("\n" + "=" * 60)
        print("처리 완료!")
        print(f"총 청크 수: {total_chunks}")
        print("=" * 60)

    return success_md and success_posts
```

---

### 5. 청킹 전략

#### 5.1 게시글 본문 청킹

```
게시글 구조:
┌─────────────────────────────────┐
│ [제목]                          │
│                                 │
│ [본문 - 파라그래프 1]           │
│ [본문 - 파라그래프 2]           │
│ ...                             │
└─────────────────────────────────┘

청킹 결과:
┌─────────────────────────────────┐
│ Chunk 0:                        │
│ 제목 + 본문 일부                │
│ (800 tokens)                    │
├─────────────────────────────────┤
│ Chunk 1:                        │
│ 본문 중간부                     │
│ (800 tokens, 200 overlap)       │
├─────────────────────────────────┤
│ Chunk 2:                        │
│ 본문 나머지                     │
│ (< 800 tokens)                  │
└─────────────────────────────────┘
```

**전략:**
- 제목을 첫 번째 청크에 포함하여 컨텍스트 제공
- RecursiveCharacterTextSplitter로 자연스러운 분할
- 200 토큰 오버랩으로 문맥 유지

#### 5.2 댓글 청킹

```
댓글 구조:
┌─────────────────────────────────┐
│ 댓글 1 (50 tokens)              │
│ 댓글 2 (30 tokens)              │
│ 댓글 3 (100 tokens)             │
│ ...                             │
│ 댓글 20 (40 tokens)             │
└─────────────────────────────────┘

청킹 결과:
┌─────────────────────────────────┐
│ Chunk 0:                        │
│ [게시글 제목 - 댓글]            │
│ 댓글 1-10 병합                  │
│ (750 tokens)                    │
├─────────────────────────────────┤
│ Chunk 1:                        │
│ [게시글 제목 - 댓글]            │
│ 댓글 11-20 병합                 │
│ (650 tokens)                    │
└─────────────────────────────────┘
```

**전략:**
- 짧은 댓글들을 병합하여 의미 있는 청크 생성
- 각 청크에 게시글 제목 포함 (검색 컨텍스트)
- 시간순 정렬 유지
- 너무 긴 댓글은 개별 청킹

---

### 6. 메타데이터 활용

#### 6.1 검색 필터링

```python
# 카테고리별 검색
def search_by_category(query: str, category: str):
    """
    특정 카테고리 내에서만 검색
    예: '여행팁' 카테고리의 질문/답변
    """

# 작성자별 검색
def search_by_author(query: str, author: str):
    """
    특정 작성자의 게시글/댓글 검색
    예: 전문가의 답변 우선 조회
    """

# 시간 범위 검색
def search_by_date_range(query: str, start_date, end_date):
    """
    특정 기간의 게시글 검색
    예: 최근 6개월 정보만
    """

# 인기도 가중치
def search_with_popularity_boost(query: str):
    """
    조회수/댓글 수 기반 가중치 적용
    similarity_score * (1 + log(view_count))
    """
```

#### 6.2 검색 함수 확장

```sql
create or replace function match_travel_content (
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 5,
  filter_category text default null,
  filter_source_type text default null,  -- NEW
  filter_author text default null,       -- NEW
  filter_post_month smallint default null, -- NEW
  min_view_count int default 0           -- NEW
)
returns table (
  id bigint,
  content text,
  title text,
  source_type text,
  category text,
  author text,
  view_count int,
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
    tc.source_type,
    tc.category,
    tc.author,
    tc.view_count,
    1 - (tc.embedding <=> query_embedding) as similarity,
    tc.created_at
  from travel_content tc
  where
    (filter_category is null or tc.category = filter_category)
    and (filter_source_type is null or tc.source_type = filter_source_type)
    and (filter_author is null or tc.author = filter_author)
    and (filter_post_month is null or tc.post_month = filter_post_month)
    and (tc.view_count >= min_view_count)
    and 1 - (tc.embedding <=> query_embedding) > match_threshold
  order by tc.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

---

### 7. 구현 순서

#### Phase 1: 데이터베이스 스키마 업데이트
1. `travel_content` 테이블에 필드 추가
2. 인덱스 생성
3. 검색 함수 업데이트

#### Phase 2: 데이터 추출 및 처리 모듈
1. `supabase_fetcher.py` 구현
2. `post_processor.py` 구현
3. `comment_processor.py` 구현

#### Phase 3: 통합 파이프라인
1. `process_community_posts.py` 구현
2. 기존 `uploader.py` 확장 (source_type 처리)
3. `process_all.py` 통합 스크립트

#### Phase 4: 테스트 및 검증
1. 샘플 데이터로 파이프라인 테스트
2. 검색 품질 검증
3. 성능 최적화

---

### 8. 고려사항

#### 8.1 데이터 최신성
- **문제:** 커뮤니티 게시글은 계속 업데이트됨
- **해결:**
  - `updated_at` 필드로 증분 업데이트 구현
  - 일일/주간 배치 작업으로 신규/수정 게시글만 처리
  - `last_updated` 필드로 재처리 필요 여부 판단

#### 8.2 댓글 품질
- **문제:** 모든 댓글이 유용한 정보는 아님
- **해결:**
  - 최소 길이 필터 (예: 10자 이상)
  - 좋아요/추천 수 기반 필터링 (테이블에 필드 추가 필요)
  - 작성자 신뢰도 기반 필터링

#### 8.3 중복 제거
- **문제:** 같은 정보가 여러 게시글/댓글에 존재
- **해결:**
  - 임베딩 유사도 기반 중복 탐지
  - 클러스터링으로 중복 청크 병합
  - 대표 청크 선정 (조회수/날짜 기준)

#### 8.4 메모리 최적화
- **문제:** 대량 게시글 처리 시 메모리 부족
- **해결:**
  - 배치 처리 (예: 100개씩)
  - 스트리밍 방식으로 데이터 읽기
  - 임베딩 생성 후 즉시 업로드

#### 8.5 검색 성능
- **문제:** 데이터 증가 시 검색 속도 저하
- **해결:**
  - HNSW 인덱스 파라미터 튜닝
  - 카테고리/날짜 기반 파티셔닝
  - 캐싱 레이어 추가

---

### 9. 예상 결과

#### 9.1 데이터 통계 (예상)
```
총 청크 수: ~5,000
├── Markdown 파일: ~500 청크
├── 커뮤니티 게시글: ~3,000 청크
└── 커뮤니티 댓글: ~1,500 청크

카테고리별 분포:
├── 여행팁: 40%
├── 질문/답변: 30%
├── 여행후기: 20%
└── 기타: 10%
```

#### 9.2 검색 품질 향상
- **Before (Markdown만):**
  - 공식 가이드, 관광지 정보 중심
  - 실용적 팁 부족

- **After (커뮤니티 포함):**
  - 실제 여행자 경험담
  - 최신 정보 (교통, 가격 등)
  - 다양한 관점과 팁

---

### 10. 다음 단계

1. **테이블 스키마 확정 및 마이그레이션**
2. **supabase_fetcher.py 구현 시작**
3. **샘플 데이터로 프로토타입 테스트**
4. **전체 파이프라인 실행 및 검증**
5. **검색 API 구현 (별도 문서)**

---

## 부록: 설정 파일 예시

### config.py 업데이트
```python
# Community post processing settings
PROCESS_COMMENTS = True  # 댓글 처리 여부
MIN_COMMENT_LENGTH = 10  # 최소 댓글 길이
MAX_COMMENTS_PER_CHUNK = 10  # 청크당 최대 댓글 수
COMMENT_CHUNK_SIZE = 600  # 댓글 청크 크기 (본문보다 작게)
```

### .env 예시
```bash
# OpenAI
OPENAI_API_KEY=sk-...
EMBEDDING_MODEL=text-embedding-ada-002

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...

# Processing
CHUNK_SIZE=800
CHUNK_OVERLAP=200
BATCH_SIZE=100
RATE_LIMIT_RPM=3000

# Community Posts
PROCESS_COMMENTS=true
MIN_COMMENT_LENGTH=10
```

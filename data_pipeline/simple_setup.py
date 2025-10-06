"""
Simple database setup using direct table creation
"""
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_KEY

def simple_setup():
    """Create table using direct insertion"""
    
    # Create Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    try:
        # Test by creating a simple table first
        result = supabase.table('travel_content').select('*').limit(1).execute()
        print("✅ Table already exists!")
        return True
    except Exception as e:
        print(f"Table doesn't exist: {e}")
        print("❌ Please create the table manually in Supabase dashboard")
        print("\nSQL to run in Supabase SQL editor:")
        print("""
-- Enable pgvector extension
create extension if not exists vector;

-- Create travel_content table
create table if not exists travel_content (
  id bigserial primary key,
  
  -- 실제 컨텐츠
  content text not null,
  embedding vector(1536),
  
  -- 문서 메타데이터
  title text not null,
  file_name text not null,
  category text,
  
  -- 마크다운 구조
  section_title text,
  section_level int default 1,
  
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
  created_at timestamptz default now()
);

-- Create indexes
create index if not exists travel_content_embedding_idx on travel_content using hnsw (embedding vector_cosine_ops);
create index if not exists idx_category on travel_content(category);
create index if not exists idx_file_name on travel_content(file_name);
create index if not exists idx_last_updated on travel_content(last_updated desc);

-- Create search function
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
        """)
        return False

if __name__ == "__main__":
    simple_setup()
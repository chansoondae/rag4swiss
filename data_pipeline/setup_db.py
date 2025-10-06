"""
Database setup script for Swiss Travel RAG
Creates tables and indexes in Supabase
"""
import asyncio
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_KEY

def setup_database():
    """Initialize database tables and functions"""
    
    # Create Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Enable pgvector extension
    try:
        result = supabase.rpc("sql", {
            "query": "create extension if not exists vector;"
        }).execute()
        print("✅ pgvector extension enabled")
    except Exception as e:
        print(f"pgvector extension: {e}")
    
    # Create travel_content table
    create_table_sql = """
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
      created_at timestamptz default now(),
      
      -- 외래키 제약
      constraint fk_parent_chunk 
        foreign key (parent_chunk_id) 
        references travel_content(id)
        on delete set null
    );
    """
    
    try:
        result = supabase.rpc("sql", {"query": create_table_sql}).execute()
        print("✅ travel_content table created")
    except Exception as e:
        print(f"Table creation error: {e}")
    
    # Create indexes
    indexes = [
        "create index if not exists travel_content_embedding_idx on travel_content using hnsw (embedding vector_cosine_ops);",
        "create index if not exists idx_category on travel_content(category);",
        "create index if not exists idx_file_name on travel_content(file_name);",
        "create index if not exists idx_last_updated on travel_content(last_updated desc);",
        "create index if not exists idx_tags on travel_content using gin(tags);",
        "create index if not exists idx_parent_chunk on travel_content(parent_chunk_id);"
    ]
    
    for index_sql in indexes:
        supabase.rpc("sql", {"query": index_sql})
    
    # Create search function
    search_function_sql = """
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
    """
    
    supabase.rpc("sql", {"query": search_function_sql})
    
    print("Database setup completed successfully!")

if __name__ == "__main__":
    setup_database()
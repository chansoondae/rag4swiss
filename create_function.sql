-- Create vector search function for Supabase
CREATE OR REPLACE FUNCTION match_travel_content (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_category text DEFAULT null
)
RETURNS TABLE (
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
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
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
  FROM travel_content tc
  WHERE 
    (filter_category IS NULL OR tc.category = filter_category)
    AND 1 - (tc.embedding <=> query_embedding) > match_threshold
  ORDER BY tc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
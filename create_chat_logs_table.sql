-- Create chat logs table for tracking user interactions
CREATE TABLE IF NOT EXISTS chat_logs (
  id bigserial PRIMARY KEY,
  
  -- User interaction data
  user_question text NOT NULL,
  ai_response text NOT NULL,
  
  -- Search and similarity data
  sources jsonb,
  similarity_scores float[],
  search_results_count int DEFAULT 0,
  
  -- Performance metrics
  response_time_ms int,
  embedding_time_ms int,
  search_time_ms int,
  llm_time_ms int,
  
  -- User session data
  user_ip text,
  user_agent text,
  session_id text,
  
  -- Metadata
  error_occurred boolean DEFAULT false,
  error_message text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_logs_user_ip ON chat_logs(user_ip);
CREATE INDEX IF NOT EXISTS idx_chat_logs_error ON chat_logs(error_occurred);

-- Create view for analytics
CREATE OR REPLACE VIEW chat_analytics AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_questions,
  COUNT(*) FILTER (WHERE error_occurred = false) as successful_responses,
  COUNT(*) FILTER (WHERE error_occurred = true) as failed_responses,
  AVG(response_time_ms) as avg_response_time_ms,
  AVG(search_results_count) as avg_search_results
FROM chat_logs
GROUP BY DATE(created_at)
ORDER BY date DESC;
"""
Configuration settings for the Swiss Travel RAG pipeline
"""
import os
from dotenv import load_dotenv

load_dotenv()

# OpenAI settings
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")

# Supabase settings
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Chunking settings
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "800"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "200"))

# Processing settings
BATCH_SIZE = 100  # for embedding batch processing
RATE_LIMIT_RPM = 3000  # requests per minute

# Database settings
TABLE_NAME = "travel_content"
EMBEDDING_DIMENSION = 1536
"""
Embedding generation utilities for Swiss Travel RAG
Handles OpenAI embeddings with rate limiting
"""
import time
import asyncio
from typing import List, Dict
from openai import OpenAI
from tqdm import tqdm
from config import OPENAI_API_KEY, EMBEDDING_MODEL, BATCH_SIZE, RATE_LIMIT_RPM

class EmbeddingGenerator:
    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_API_KEY)
        self.model = EMBEDDING_MODEL
        self.batch_size = BATCH_SIZE
        self.rate_limit_delay = 60 / RATE_LIMIT_RPM  # seconds between requests
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text"""
        
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=text.replace("\n", " ")
            )
            return response.data[0].embedding
        
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return None
    
    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a batch of texts"""
        
        embeddings = []
        
        # Process in batches to respect rate limits
        for i in tqdm(range(0, len(texts), self.batch_size), desc="Generating embeddings"):
            batch = texts[i:i + self.batch_size]
            
            try:
                # Clean texts for embedding
                cleaned_batch = [text.replace("\n", " ") for text in batch]
                
                response = self.client.embeddings.create(
                    model=self.model,
                    input=cleaned_batch
                )
                
                # Extract embeddings from response
                batch_embeddings = [data.embedding for data in response.data]
                embeddings.extend(batch_embeddings)
                
                # Rate limiting delay
                if i + self.batch_size < len(texts):
                    time.sleep(self.rate_limit_delay)
                
            except Exception as e:
                print(f"Error in batch {i//self.batch_size + 1}: {e}")
                # Add None for failed embeddings
                embeddings.extend([None] * len(batch))
        
        return embeddings
    
    def embed_chunks(self, chunks: List[Dict]) -> List[Dict]:
        """
        Generate embeddings for a list of chunks
        
        Args:
            chunks: List of chunk dictionaries with 'content' field
            
        Returns:
            List of chunks with 'embedding' field added
        """
        
        print(f"Generating embeddings for {len(chunks)} chunks...")
        
        # Extract texts
        texts = [chunk['content'] for chunk in chunks]
        
        # Generate embeddings
        embeddings = self.generate_embeddings_batch(texts)
        
        # Add embeddings to chunks
        embedded_chunks = []
        for chunk, embedding in zip(chunks, embeddings):
            if embedding is not None:
                chunk['embedding'] = embedding
                embedded_chunks.append(chunk)
            else:
                print(f"Skipping chunk due to embedding failure: {chunk.get('title', 'Unknown')}")
        
        print(f"Successfully embedded {len(embedded_chunks)}/{len(chunks)} chunks")
        return embedded_chunks
    
    def test_embedding(self) -> bool:
        """Test embedding generation with a simple text"""
        
        test_text = "스위스 여행 테스트"
        
        try:
            embedding = self.generate_embedding(test_text)
            if embedding and len(embedding) == 1536:
                print("Embedding test successful!")
                return True
            else:
                print("Embedding test failed: invalid dimensions")
                return False
        
        except Exception as e:
            print(f"Embedding test failed: {e}")
            return False
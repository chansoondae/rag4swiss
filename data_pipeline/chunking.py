"""
Text chunking utilities for Swiss Travel RAG
Implements semantic chunking with overlap
"""
import tiktoken
from typing import List
from langchain.text_splitter import RecursiveCharacterTextSplitter
from config import CHUNK_SIZE, CHUNK_OVERLAP

class TextChunker:
    def __init__(self, chunk_size: int = CHUNK_SIZE, chunk_overlap: int = CHUNK_OVERLAP):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.encoding = tiktoken.encoding_for_model("text-embedding-ada-002")
        
        # Initialize text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=self._count_tokens,
            separators=["\n\n", "\n", ". ", "! ", "? ", " ", ""]
        )
    
    def _count_tokens(self, text: str) -> int:
        """Count tokens in text using tiktoken"""
        return len(self.encoding.encode(text))
    
    def chunk_text(self, text: str, metadata: dict = None) -> List[dict]:
        """
        Chunk text into smaller pieces with metadata
        
        Args:
            text: Text to chunk
            metadata: Document metadata to include with each chunk
            
        Returns:
            List of chunk dictionaries with content and metadata
        """
        
        # Split text into chunks
        chunks = self.text_splitter.split_text(text)
        
        # Prepare chunk objects with metadata
        chunk_objects = []
        total_chunks = len(chunks)
        
        for i, chunk_content in enumerate(chunks):
            chunk_obj = {
                'content': chunk_content.strip(),
                'chunk_index': i,
                'total_chunks': total_chunks,
                'token_count': self._count_tokens(chunk_content),
                'parent_chunk_id': None  # Will be set after insertion
            }
            
            # Add document metadata if provided
            if metadata:
                chunk_obj.update(metadata)
            
            chunk_objects.append(chunk_obj)
        
        return chunk_objects
    
    def chunk_sections(self, sections: List[dict], metadata: dict = None) -> List[dict]:
        """
        Chunk sections while preserving section boundaries
        
        Args:
            sections: List of section dictionaries from markdown parser
            metadata: Document metadata
            
        Returns:
            List of chunk dictionaries
        """
        
        all_chunks = []
        
        for section in sections:
            section_text = f"# {section['title']}\n\n{section['content']}"
            
            # Create section-specific metadata
            section_metadata = {
                'section_title': section['title'],
                'section_level': section['level'],
            }
            
            if metadata:
                section_metadata.update(metadata)
            
            # Chunk the section
            section_chunks = self.chunk_text(section_text, section_metadata)
            
            # Adjust chunk indices to be global
            for chunk in section_chunks:
                chunk['chunk_index'] = len(all_chunks)
                all_chunks.append(chunk)
        
        # Update total chunks count
        total_chunks = len(all_chunks)
        for chunk in all_chunks:
            chunk['total_chunks'] = total_chunks
        
        return all_chunks
    
    def validate_chunk_size(self, text: str) -> bool:
        """Validate that text fits within token limits"""
        token_count = self._count_tokens(text)
        return token_count <= self.chunk_size * 1.2  # Allow 20% buffer
"""
Database uploader for Swiss Travel RAG
Handles uploading chunks to Supabase
"""
from typing import List, Dict
from supabase import create_client, Client
from tqdm import tqdm
from config import SUPABASE_URL, SUPABASE_KEY, TABLE_NAME

class DatabaseUploader:
    def __init__(self):
        self.client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.table_name = TABLE_NAME
    
    def upload_chunks(self, chunks: List[Dict]) -> bool:
        """
        Upload chunks to Supabase database
        
        Args:
            chunks: List of chunk dictionaries with embeddings
            
        Returns:
            True if successful, False otherwise
        """
        
        print(f"Uploading {len(chunks)} chunks to database...")
        
        try:
            # Prepare data for insertion
            upload_data = []
            
            for chunk in chunks:
                record = {
                    'content': chunk['content'],
                    'embedding': chunk['embedding'],
                    'title': chunk.get('title', ''),
                    'file_name': chunk.get('file_name', ''),
                    'category': chunk.get('category', ''),
                    'section_title': chunk.get('section_title', ''),
                    'section_level': chunk.get('section_level', 1),
                    'chunk_index': chunk['chunk_index'],
                    'total_chunks': chunk['total_chunks'],
                    'tags': chunk.get('tags', []),
                    'location': chunk.get('location', ''),
                    'estimated_reading_time': chunk.get('estimated_reading_time', 0)
                }
                
                upload_data.append(record)
            
            # Upload in batches
            batch_size = 50
            uploaded_count = 0
            
            for i in tqdm(range(0, len(upload_data), batch_size), desc="Uploading"):
                batch = upload_data[i:i + batch_size]
                
                response = self.client.table(self.table_name).insert(batch).execute()
                
                if response.data:
                    uploaded_count += len(response.data)
                else:
                    print(f"Failed to upload batch {i//batch_size + 1}")
            
            print(f"Successfully uploaded {uploaded_count}/{len(chunks)} chunks")
            return uploaded_count == len(chunks)
        
        except Exception as e:
            print(f"Error uploading chunks: {e}")
            return False
    
    def clear_table(self) -> bool:
        """Clear all data from the table"""
        
        try:
            # Delete all records
            response = self.client.table(self.table_name).delete().neq('id', 0).execute()
            print("Table cleared successfully")
            return True
        
        except Exception as e:
            print(f"Error clearing table: {e}")
            return False
    
    def update_parent_chunk_ids(self, chunks: List[Dict]) -> bool:
        """
        Update parent_chunk_id relationships after initial upload
        
        Args:
            chunks: List of chunks that were uploaded
            
        Returns:
            True if successful
        """
        
        try:
            # Get all records grouped by file_name
            response = self.client.table(self.table_name).select("id, file_name, chunk_index").execute()
            
            if not response.data:
                return True
            
            # Group by file_name
            file_chunks = {}
            for record in response.data:
                file_name = record['file_name']
                if file_name not in file_chunks:
                    file_chunks[file_name] = []
                file_chunks[file_name].append(record)
            
            # Update parent relationships
            for file_name, file_chunk_list in file_chunks.items():
                # Sort by chunk_index
                file_chunk_list.sort(key=lambda x: x['chunk_index'])
                
                # Update parent_chunk_id for each chunk (except first)
                for i in range(1, len(file_chunk_list)):
                    current_chunk = file_chunk_list[i]
                    parent_chunk = file_chunk_list[i-1]
                    
                    self.client.table(self.table_name).update({
                        'parent_chunk_id': parent_chunk['id']
                    }).eq('id', current_chunk['id']).execute()
            
            print("Parent chunk relationships updated successfully")
            return True
        
        except Exception as e:
            print(f"Error updating parent chunk relationships: {e}")
            return False
    
    def get_chunk_count(self) -> int:
        """Get total number of chunks in database"""
        
        try:
            response = self.client.table(self.table_name).select("id", count="exact").execute()
            return response.count or 0
        
        except Exception as e:
            print(f"Error getting chunk count: {e}")
            return 0
    
    def test_connection(self) -> bool:
        """Test database connection"""
        
        try:
            response = self.client.table(self.table_name).select("id").limit(1).execute()
            print("Database connection successful!")
            return True
        
        except Exception as e:
            print(f"Database connection failed: {e}")
            return False
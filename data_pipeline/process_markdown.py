"""
Main processing script for Swiss Travel RAG
Processes markdown files and uploads to database
"""
import os
from pathlib import Path
from markdown_parser import MarkdownParser
from chunking import TextChunker
from embedder import EmbeddingGenerator
from uploader import DatabaseUploader

def process_markdown_files():
    """Main function to process all markdown files"""
    
    # Initialize components
    parser = MarkdownParser()
    chunker = TextChunker()
    embedder = EmbeddingGenerator()
    uploader = DatabaseUploader()
    
    # Test connections
    print("Testing connections...")
    if not embedder.test_embedding():
        print("❌ OpenAI connection failed")
        return False
    
    if not uploader.test_connection():
        print("❌ Supabase connection failed")
        return False
    
    print("✅ All connections successful")
    
    # Get markdown files
    markdown_dir = Path("markdown_files")
    if not markdown_dir.exists():
        print(f"❌ Markdown directory not found: {markdown_dir}")
        return False
    
    markdown_files = list(markdown_dir.glob("*.md"))
    if not markdown_files:
        print("❌ No markdown files found")
        return False
    
    print(f"Found {len(markdown_files)} markdown files")
    
    # Clear existing data (optional)
    print("Proceeding with new data (existing data will be preserved)...")
    # clear_existing = input("Clear existing data? (y/N): ").lower().strip()
    # if clear_existing == 'y':
    #     uploader.clear_table()
    
    # Process each file
    all_chunks = []
    
    for file_path in markdown_files:
        print(f"\n📄 Processing: {file_path.name}")
        
        try:
            # Parse markdown
            parsed = parser.parse_file(file_path)
            
            # Add reading time estimation
            parsed['metadata']['estimated_reading_time'] = parser.estimate_reading_time(parsed['full_content'])
            
            # Chunk sections
            if parsed['sections']:
                chunks = chunker.chunk_sections(parsed['sections'], parsed['metadata'])
            else:
                # Fallback: chunk entire content
                chunks = chunker.chunk_text(parsed['full_content'], parsed['metadata'])
            
            print(f"  📝 Created {len(chunks)} chunks")
            all_chunks.extend(chunks)
            
        except Exception as e:
            print(f"  ❌ Error processing {file_path.name}: {e}")
            continue
    
    if not all_chunks:
        print("❌ No chunks to process")
        return False
    
    print(f"\n🔧 Total chunks to process: {len(all_chunks)}")
    
    # Generate embeddings
    print("\n🤖 Generating embeddings...")
    embedded_chunks = embedder.embed_chunks(all_chunks)
    
    if not embedded_chunks:
        print("❌ No embeddings generated")
        return False
    
    # Upload to database
    print("\n📤 Uploading to database...")
    success = uploader.upload_chunks(embedded_chunks)
    
    if success:
        print("✅ Processing completed successfully!")
        
        # Update parent chunk relationships
        print("🔗 Updating chunk relationships...")
        uploader.update_parent_chunk_ids(embedded_chunks)
        
        # Show final stats
        total_chunks = uploader.get_chunk_count()
        print(f"📊 Total chunks in database: {total_chunks}")
        
        return True
    else:
        print("❌ Upload failed")
        return False

if __name__ == "__main__":
    process_markdown_files()
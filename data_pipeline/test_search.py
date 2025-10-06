"""
Search testing script for Swiss Travel RAG
Tests vector search functionality
"""
from supabase import create_client, Client
from embedder import EmbeddingGenerator
from config import SUPABASE_URL, SUPABASE_KEY

def test_search(query: str, top_k: int = 3):
    """Test vector search with a query"""
    
    # Initialize components
    embedder = EmbeddingGenerator()
    client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    print(f"🔍 Searching for: '{query}'")
    
    try:
        # Generate query embedding
        query_embedding = embedder.generate_embedding(query)
        if not query_embedding:
            print("❌ Failed to generate query embedding")
            return
        
        # Search database
        response = client.rpc('match_travel_content', {
            'query_embedding': query_embedding,
            'match_threshold': 0.7,
            'match_count': top_k
        }).execute()
        
        if not response.data:
            print("❌ No results found")
            return
        
        # Display results
        print(f"\n📊 Found {len(response.data)} results:")
        print("-" * 80)
        
        for i, result in enumerate(response.data, 1):
            similarity = result['similarity']
            title = result['title']
            section = result['section_title'] or "메인"
            file_name = result['file_name']
            content_preview = result['content'][:200] + "..." if len(result['content']) > 200 else result['content']
            
            print(f"{i}. [{similarity:.3f}] {title} > {section}")
            print(f"   📄 {file_name}")
            print(f"   💬 {content_preview}")
            print()
        
    except Exception as e:
        print(f"❌ Search error: {e}")

def test_multiple_queries():
    """Test with multiple sample queries"""
    
    test_queries = [
        "리기산 가는 방법",
        "융프라우요흐 티켓 가격",
        "루체른에서 하루 일정",
        "스위스 교통카드 추천",
        "취리히 공항에서 시내",
        "인터라켄 숙박"
    ]
    
    for query in test_queries:
        test_search(query, top_k=2)
        print("=" * 80)

if __name__ == "__main__":
    # Test single query
    query = input("Enter search query (or press Enter for multiple tests): ").strip()
    
    if query:
        test_search(query, top_k=5)
    else:
        test_multiple_queries()
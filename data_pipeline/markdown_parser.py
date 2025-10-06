"""
Markdown file parser for Swiss Travel RAG
Handles frontmatter parsing and section extraction
"""
import frontmatter
import re
from typing import Dict, List, Tuple
from pathlib import Path

class MarkdownParser:
    def __init__(self):
        self.section_pattern = re.compile(r'^(#{1,6})\s+(.+)$', re.MULTILINE)
    
    def parse_file(self, file_path: Path) -> Dict:
        """Parse a markdown file and extract metadata and content"""
        
        with open(file_path, 'r', encoding='utf-8') as f:
            post = frontmatter.load(f)
        
        # Extract frontmatter metadata
        metadata = {
            'title': post.metadata.get('title', file_path.stem),
            'category': post.metadata.get('category', '기타'),
            'tags': post.metadata.get('tags', []),
            'location': post.metadata.get('location', ''),
            'file_name': file_path.name
        }
        
        # Parse content into sections
        sections = self._parse_sections(post.content)
        
        return {
            'metadata': metadata,
            'sections': sections,
            'full_content': post.content
        }
    
    def _parse_sections(self, content: str) -> List[Dict]:
        """Parse markdown content into sections based on headers"""
        
        sections = []
        lines = content.split('\n')
        current_section = {
            'title': '',
            'level': 0,
            'content': [],
            'start_line': 0
        }
        
        for i, line in enumerate(lines):
            header_match = self.section_pattern.match(line)
            
            if header_match:
                # Save previous section if it has content
                if current_section['content']:
                    current_section['content'] = '\n'.join(current_section['content']).strip()
                    sections.append(current_section.copy())
                
                # Start new section
                level = len(header_match.group(1))
                title = header_match.group(2).strip()
                
                current_section = {
                    'title': title,
                    'level': level,
                    'content': [],
                    'start_line': i
                }
            else:
                # Add line to current section
                current_section['content'].append(line)
        
        # Add final section
        if current_section['content']:
            current_section['content'] = '\n'.join(current_section['content']).strip()
            sections.append(current_section)
        
        return sections
    
    def estimate_reading_time(self, text: str) -> int:
        """Estimate reading time in seconds (assuming 200 words per minute)"""
        word_count = len(text.split())
        reading_time_minutes = word_count / 200
        return int(reading_time_minutes * 60)
    
    def clean_content(self, content: str) -> str:
        """Clean markdown content for better embedding"""
        
        # Remove excessive whitespace
        content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
        
        # Remove markdown image syntax but keep alt text
        content = re.sub(r'!\[([^\]]*)\]\([^)]+\)', r'\1', content)
        
        # Remove markdown link syntax but keep text
        content = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', content)
        
        # Remove code block markers
        content = re.sub(r'```[^\n]*\n', '', content)
        content = re.sub(r'```', '', content)
        
        # Remove excessive spaces
        content = re.sub(r' {2,}', ' ', content)
        
        return content.strip()
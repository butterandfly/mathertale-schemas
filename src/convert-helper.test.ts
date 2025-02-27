import { describe, it, expect } from 'vitest'
import { convertRawContent, getMetadata } from './convert-helper'

describe('convertRawContent', () => {
  it('should extract content and keyword sections correctly', () => {
    const rawContent = `This is the main content.
Some more content here.

category:
adventure
foundational

devStatus:
in-progress

difficulty:
medium`

    const keywords = [
      { pattern: 'category:', name: 'category' },
      { pattern: 'devStatus:', name: 'devStatus' },
      { pattern: 'difficulty:', name: 'difficulty' }
    ]
    
    const result = convertRawContent(rawContent, keywords)
    
    expect(result).toEqual({
      content: 'This is the main content.\nSome more content here.',
      category: 'adventure\nfoundational',
      devStatus: 'in-progress',
      difficulty: 'medium'
    })
  })

  it('should handle content with no keywords', () => {
    const rawContent = 'Just some content\nwithout any keywords'
    const keywords = [
      { pattern: 'category:', name: 'category' },
      { pattern: 'devStatus:', name: 'devStatus' }
    ]
    
    const result = convertRawContent(rawContent, keywords)
    
    expect(result).toEqual({
      content: 'Just some content\nwithout any keywords'
    })
  })

  it('should handle empty content', () => {
    const rawContent = ''
    const keywords = [
      { pattern: 'category:', name: 'category' },
      { pattern: 'devStatus:', name: 'devStatus' }
    ]
    
    const result = convertRawContent(rawContent, keywords)
    
    expect(result).toEqual({
      content: ''
    })
  })

  it('should handle real data well', () => {
    const rawContent = "#journey Proofcraft 101 ^8a51c4c7-6efd-463e-9c4d-e5f127aa236e\n\nThe very first class on serious mathematics.\n\ncategory:\nfoundational\n\ndevStatus:\navailable"
    const keywords = [
      { pattern: 'category:', name: 'category' },
      { pattern: 'devStatus:', name: 'devStatus' }
    ]
    const result = convertRawContent(rawContent, keywords)

    expect(result['category']).toEqual('foundational')
  })

  it('should handle regex patterns and group multiple matches', () => {
    const rawContent = `Some initial content

part-1:
Content for part 1

part-2:
Content for part 2

part-3:
Content for part 3`

    const keywords = [
      { pattern: /part-\d+:/, name: 'parts' }
    ]

    const result = convertRawContent(rawContent, keywords)

    expect(result).toEqual({
      content: 'Some initial content',
      parts: [
        'Content for part 1',
        'Content for part 2',
        'Content for part 3'
      ]
    })
  })
}) 

describe('getMetadata', () => {
  it('should extract metadata from a line with a tag and name', () => {
    const line = '#definition Definition Name';
    const metadata = getMetadata(line);
    expect(metadata).toEqual({
      tag: 'definition',
      name: 'Definition Name',
      id: ''
    });
  });

  it('should extract metadata from a line with a tag, name, and id', () => {
    const line = '#definition Definition Name ^123e4567-e89b-12d3-a456-426614174000';
    const metadata = getMetadata(line);
    expect(metadata).toEqual({
      tag: 'definition',
      name: 'Definition Name',
      id: '123e4567-e89b-12d3-a456-426614174000'
    });
  });

  it('should extract metadata from a line with a tag and id only', () => {
    const line = '#para ^123e4567-e89b-12d3-a456-426614174000';
    const metadata = getMetadata(line);
    expect(metadata).toEqual({
      tag: 'para',
      name: '',
      id: '123e4567-e89b-12d3-a456-426614174000'
    });
  });

  it('should extract metadata from a line with a tag only', () => {
    const line = '#para';
    const metadata = getMetadata(line);
    expect(metadata).toEqual({
      tag: 'para',
      name: '',
      id: ''
    });
  });

  it('should return empty string id for invalid uuid', () => {
    const line = '#definition Definition Name ^something';
    const metadata = getMetadata(line);
    expect(metadata).toEqual({
      tag: 'definition',
      name: 'Definition Name ^something',
      id: ''
    });
  });
});

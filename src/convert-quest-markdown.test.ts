import { describe, it, expect } from 'vitest';
import { marked } from 'marked';

// 为了测试，我们需要导出这个内部函数
import { extractProperties, parseQuestHeader, tokensToMarkdown } from './convert-quest-markdown';

describe('tokensToMarkdown', () => {
  it('should convert tokens to markdown text', () => {
    const markdown = `This is a paragraph.

This is another paragraph with **bold** and *italic*.

- Item 1
- Item 2
  - Nested item
- Item 3`;
    
    const tokens = marked.lexer(markdown);
    const result = tokensToMarkdown(tokens);
    
    expect(result).toBe(markdown);
  });
  
  it('should handle code blocks', () => {
    const markdown = `Here's a code block:

\`\`\`javascript
function hello() {
  console.log('Hello world!');
}
\`\`\``;
    
    const tokens = marked.lexer(markdown);
    const result = tokensToMarkdown(tokens);
    
    expect(result).toBe(markdown);
  });
  
  it('should handle LaTeX blocks', () => {
    const markdown = `Here's a LaTeX equation:

$$
\\frac{1}{2}
$$`;
    
    const tokens = marked.lexer(markdown);
    const result = tokensToMarkdown(tokens);
    
    expect(result).toBe(markdown);
  });
  
  it('should handle headings', () => {
    const markdown = `# Heading 1

## Heading 2

### Heading 3`;
    
    const tokens = marked.lexer(markdown);
    const result = tokensToMarkdown(tokens);
    
    expect(result).toBe(markdown);
  });
  
  it('should handle empty input', () => {
    const tokens = marked.lexer('');
    const result = tokensToMarkdown(tokens);
    
    expect(result).toBe('');
  });
});

describe('extractProperties', () => {
  it('should handle simple paragraph', () => {
    const markdown = `#### Content
This is a simple paragraph.`;
    
    const tokens = marked.lexer(markdown);
    const { properties } = extractProperties(tokens);
    
    expect(properties.content).toBe('This is a simple paragraph.');
  });

  it('should return content before first h4', () => {
    const markdown = `Some content before any heading.

More content here.

#### Content
This is a paragraph after the heading.`;
    
    const tokens = marked.lexer(markdown);
    const { content, properties } = extractProperties(tokens);
    
    expect(content).toBe('Some content before any heading.\n\nMore content here.');
    expect(properties.content).toBe('This is a paragraph after the heading.');
  });

  it('should return all content as content when no h4 exists', () => {
    const markdown = `Some content with no headings.

More content here.`;
    
    const tokens = marked.lexer(markdown);
    const { content, properties } = extractProperties(tokens);
    
    expect(content).toBe('Some content with no headings.\n\nMore content here.');
    expect(Object.keys(properties).length).toBe(0);
  });

  it('should handle multiple properties', () => {
    const markdown = `#### Content
Main content here.

#### Hint
A helpful hint.

#### Solution
The solution.`;
    
    const tokens = marked.lexer(markdown);
    const { properties } = extractProperties(tokens);
    
    expect(properties.content).toBe('Main content here.');
    expect(properties.hint).toBe('A helpful hint.');
    expect(properties.solution).toBe('The solution.');
  });
  
  it('should preserve formatting in properties', () => {
    const markdown = `#### Content
This is **bold** and this is *italic*.

\`\`\`python
print("Hello")
\`\`\`

- List item 1
- List item 2`;
    
    const tokens = marked.lexer(markdown);
    const { properties } = extractProperties(tokens);
    
    const expected = 
      'This is **bold** and this is *italic*.\n\n' +
      '```python\n' +
      'print("Hello")\n' +
      '```\n\n' +
      '- List item 1\n' +
      '- List item 2';
    
    expect(properties.content).toBe(expected);
  });
}); 

describe('parseQuestHeader', () => {
  it('should parse quest name, id and desc correctly', () => {
    const markdown = `# Quest: Test Quest
id: test-id
desc: This is a test quest.`;
    
    const tokens = marked.lexer(markdown);
    const result = parseQuestHeader(tokens);
    
    expect(result).toMatchObject({
      name: 'Test Quest',
      id: 'test-id',
      desc: 'This is a test quest.'
    });
  });
  
  it('should handle when desc is missing', () => {
    const markdown = `# Quest: Another Quest
id: another-id`;
    
    const tokens = marked.lexer(markdown);
    const result = parseQuestHeader(tokens);
    
    expect(result).toMatchObject({
      name: 'Another Quest',
      id: 'another-id',
      desc: ''
    });
  });
  
  it('should handle when id and desc are missing', () => {
    const markdown = `# Quest: Simple Quest`;
    
    const tokens = marked.lexer(markdown);
    const result = parseQuestHeader(tokens);
    
    expect(result).toMatchObject({
      name: 'Simple Quest',
      id: '',
      desc: ''
    });
  });
}); 
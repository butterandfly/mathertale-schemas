import { describe, it, expect } from 'vitest';
import { marked } from 'marked';
import { 
  convertNotedMarkdown, 
  DefinitionType, 
  FactType, 
  TheoremType, 
  PropositionType, 
  RemarkType, 
  LemmaType,
  NotedData
} from './noted-block';
import { MarkdownBlockRaw } from '../convert-markdown-helper';

describe('convertNotedMarkdown', () => {
  it('should convert a simple noted block', () => {
    const block: MarkdownBlockRaw = {
      tag: 'definition',
      id: 'test-id',
      rawTokens: marked.lexer('This is a simple definition.')
    };

    const result = convertNotedMarkdown(block, DefinitionType);

    expect(result).toMatchObject({
      id: 'test-id',
      type: DefinitionType,
      content: 'This is a simple definition.',
    });
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should handle block with properties', () => {
    const markdown = `Some initial content.

#### Content
This is the main content.

#### Note
Additional note.`;

    const block: MarkdownBlockRaw = {
      tag: 'theorem',
      id: 'theorem-id',
      rawTokens: marked.lexer(markdown)
    };

    const result = convertNotedMarkdown(block, TheoremType);

    expect(result).toMatchObject({
      id: 'theorem-id',
      type: TheoremType,
      content: 'This is the main content.',
    });
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should use initial content when no Content property exists', () => {
    const markdown = `This is the main content without properties.

This should be included too.`;

    const block: MarkdownBlockRaw = {
      tag: 'fact',
      id: 'fact-id',
      rawTokens: marked.lexer(markdown)
    };

    const result = convertNotedMarkdown(block, FactType);

    expect(result).toMatchObject({
      id: 'fact-id',
      type: FactType,
      content: 'This is the main content without properties.\n\nThis should be included too.',
    });
  });

  it('should handle empty content', () => {
    const block: MarkdownBlockRaw = {
      tag: 'remark',
      id: 'remark-id',
      rawTokens: marked.lexer('')
    };

    const result = convertNotedMarkdown(block, RemarkType);

    expect(result).toMatchObject({
      id: 'remark-id',
      type: RemarkType,
      content: '',
    });
  });

  it('should handle complex markdown content', () => {
    const markdown = `#### Content
Here's a complex content with:

1. Ordered list
2. **Bold text**
3. *Italic text*

\`\`\`javascript
console.log('Code block');
\`\`\`

And some math: $$E = mc^2$$`;

    const block: MarkdownBlockRaw = {
      tag: 'lemma',
      id: 'lemma-id',
      rawTokens: marked.lexer(markdown)
    };

    const result = convertNotedMarkdown(block, LemmaType);

    expect(result).toMatchObject({
      id: 'lemma-id',
      type: LemmaType,
      content: markdown.replace('#### Content\n', ''),
    });
  });

  it('should handle proposition type', () => {
    const block: MarkdownBlockRaw = {
      tag: 'proposition',
      id: 'prop-id',
      rawTokens: marked.lexer('A mathematical proposition.')
    };

    const result = convertNotedMarkdown(block, PropositionType);

    expect(result).toMatchObject({
      id: 'prop-id',
      type: PropositionType,
      content: 'A mathematical proposition.',
    });
  });
}); 
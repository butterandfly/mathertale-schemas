import { describe, it, expect } from 'vitest';
import { ParaBlock, ParaType } from './para-block';
import { marked } from 'marked';
import { MarkdownBlock } from '../convert-markdown-helper';

describe('ParaBlock', () => {

  describe('fromMarkdown', () => {
    it('should convert markdown block to para block', () => {
      const markdownContent = 'Test content';
      const tokens = marked.lexer(markdownContent);
      
      const markdownBlock: MarkdownBlock = {
        tag: 'para',
        id: 'test-id',
        rawTokens: tokens,
      };

      const result = ParaBlock.fromMarkdown(markdownBlock);

      expect(result).toMatchObject({
        id: 'test-id',
        content: 'Test content',
        type: ParaType
      });
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle markdown block with name', () => {
      const markdownContent = '#### content\nTest content';
      const tokens = marked.lexer(markdownContent);
      
      const markdownBlock: MarkdownBlock = {
        tag: 'para',
        name: 'Test Name',
        id: 'test-id',
        rawTokens: tokens,
      };

      const result = ParaBlock.fromMarkdown(markdownBlock);

      expect(result).toMatchObject({
        id: 'test-id',
        content: 'Test content',
        type: ParaType
      });
    });

    it('should throw error if markdown content is empty', () => {
      const markdownContent = ''; // Empty content
      const tokens = marked.lexer(markdownContent);
      const markdownBlock: MarkdownBlock = {
        tag: 'para',
        id: 'empty-md-id',
        rawTokens: tokens,
      };
      expect(() => ParaBlock.fromMarkdown(markdownBlock)).toThrow('Content cannot be empty for block ID: empty-md-id');
    });

    it('should throw error if markdown content is only whitespace', () => {
      const markdownContent = '    '; // Whitespace content
      const tokens = marked.lexer(markdownContent);
      const markdownBlock: MarkdownBlock = {
        tag: 'para',
        id: 'whitespace-md-id',
        rawTokens: tokens,
      };
      expect(() => ParaBlock.fromMarkdown(markdownBlock)).toThrow('Content cannot be empty for block ID: whitespace-md-id');
    });

    it('should throw error if content property is empty', () => {
      const markdownContent = '#### content\n'; // Empty content property
      const tokens = marked.lexer(markdownContent);
      const markdownBlock: MarkdownBlock = {
        tag: 'para',
        id: 'empty-prop-id',
        rawTokens: tokens,
      };
      expect(() => ParaBlock.fromMarkdown(markdownBlock)).toThrow('Content cannot be empty for block ID: empty-prop-id');
    });

    it('should throw error if content property is only whitespace', () => {
      const markdownContent = '#### content\n  \n '; // Whitespace content property
      const tokens = marked.lexer(markdownContent);
      const markdownBlock: MarkdownBlock = {
        tag: 'para',
        id: 'whitespace-prop-id',
        rawTokens: tokens,
      };
      expect(() => ParaBlock.fromMarkdown(markdownBlock)).toThrow('Content cannot be empty for block ID: whitespace-prop-id');
    });
  });

  describe('getText', () => {
    it('should return the content', () => {
      const block = new ParaBlock('test-id', 'Test content');
      expect(block.getText()).toBe('Test content');
    });
  });
}); 
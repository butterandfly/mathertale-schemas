import { describe, it, expect } from 'vitest';
import { ParaBlock, ParaType } from './para-block';
import { RawData } from '../convert-helper';
import { marked } from 'marked';
import { MarkdownBlock } from '../convert-markdown-helper';

describe('ParaBlock', () => {
  describe('fromNode', () => {
    it('should convert raw data to para block', () => {
      const rawData: RawData = {
        id: 'test-id',
        tag: 'para',
        rawContent: 'Test content'
      };

      const result = ParaBlock.fromNode(rawData);

      expect(result).toMatchObject({
        id: 'test-id',
        content: 'Test content',
        type: ParaType
      });
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle raw data with name', () => {
      const rawData: RawData = {
        id: 'test-id',
        tag: 'para',
        name: 'Test Name',
        rawContent: 'Test content'
      };

      const result = ParaBlock.fromNode(rawData);

      expect(result).toMatchObject({
        id: 'test-id',
        content: 'Test content',
        type: ParaType
      });
    });
  });

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
  });

  describe('getText', () => {
    it('should return the content', () => {
      const block = new ParaBlock('test-id', 'Test content');
      expect(block.getText()).toBe('Test content');
    });
  });
}); 
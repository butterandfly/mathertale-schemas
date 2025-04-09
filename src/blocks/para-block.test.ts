import { describe, it, expect } from 'vitest';
import { convertParaBlockNode, convertParaMarkdown, ParaType } from './para-block';
import { RawData } from '../convert-helper';
import { marked } from 'marked';
import { MarkdownBlockRaw } from '../convert-markdown-helper';

describe('para-block', () => {
  describe('convertParaBlockNode', () => {
    it('should convert raw data to para block', () => {
      const rawData: RawData = {
        id: 'test-id',
        tag: 'para',
        rawContent: 'Test content'
      };

      const result = convertParaBlockNode(rawData);

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

      const result = convertParaBlockNode(rawData);

      expect(result).toMatchObject({
        id: 'test-id',
        content: 'Test content',
        type: ParaType
      });
    });
  });

  describe('convertParaMarkdown', () => {
    it('should convert markdown block to para block', () => {
      const markdownContent = 'Test content';
      const tokens = marked.lexer(markdownContent);
      
      const markdownBlock: MarkdownBlockRaw = {
        tag: 'para',
        id: 'test-id',
        rawTokens: tokens
      };

      const result = convertParaMarkdown(markdownBlock);

      expect(result).toMatchObject({
        id: 'test-id',
        content: 'Test content',
        type: ParaType
      });
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle empty content', () => {
      const markdownBlock: MarkdownBlockRaw = {
        tag: 'para',
        id: 'test-id',
        rawTokens: []
      };

      const result = convertParaMarkdown(markdownBlock);

      expect(result).toMatchObject({
        id: 'test-id',
        content: '',
        type: ParaType
      });
    });

    it('should handle markdown block with name', () => {
      const markdownContent = '#### content\nTest content';
      const tokens = marked.lexer(markdownContent);
      
      const markdownBlock: MarkdownBlockRaw = {
        tag: 'para',
        name: 'Test Name',
        id: 'test-id',
        rawTokens: tokens
      };

      const result = convertParaMarkdown(markdownBlock);

      expect(result).toMatchObject({
        id: 'test-id',
        content: 'Test content',
        type: ParaType
      });
    });
  });
}); 
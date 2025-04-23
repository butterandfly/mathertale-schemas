import { expect, describe, it } from "vitest";
import { marked } from "marked";
import { 
  ScratchWorkBlock,
  ScratchWorkType,
  convertScratchWorkBlockNode,
  convertScratchWorkMarkdown
} from "./scratch-work-block";
import { RawData } from "../convert-helper";
import { MarkdownBlock } from "../convert-markdown-helper";

describe('ScratchWorkBlock', () => {
  it('should convert scratch work block node raw data', () => {
    const rawData: RawData = { 
      id: 'fake-id', 
      tag: 'scratch_work', 
      rawContent: 'This is scratch work content'
    };
    
    const block = convertScratchWorkBlockNode(rawData);
    expect(block).toMatchObject({
      content: 'This is scratch work content',
      type: ScratchWorkType,
      id: rawData.id,
    });
  });

  describe('fromNode', () => {
    it('should convert raw data to scratch work block', () => {
      const rawData: RawData = {
        id: 'test-id',
        tag: 'scratch_work',
        rawContent: 'Test content'
      };

      const result = ScratchWorkBlock.fromNode(rawData);

      expect(result).toBeInstanceOf(ScratchWorkBlock);
      expect(result).toMatchObject({
        id: 'test-id',
        content: 'Test content',
        type: ScratchWorkType
      });
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle raw data with name', () => {
      const rawData: RawData = {
        id: 'test-id',
        tag: 'scratch_work',
        name: 'Test Name',
        rawContent: 'Test content'
      };

      const result = ScratchWorkBlock.fromNode(rawData);

      expect(result).toMatchObject({
        id: 'test-id',
        content: 'Test content',
        type: ScratchWorkType
      });
    });
  });

  describe('fromMarkdown', () => {
    it('should convert markdown to scratch work block', () => {
      const markdown = 'This is scratch work content';

      const tokens = marked.lexer(markdown);
      const blockRaw: MarkdownBlock = {
        id: 'test-id',
        rawTokens: tokens,
        tag: 'scratch-work'
      };

      const result = ScratchWorkBlock.fromMarkdown(blockRaw);

      expect(result).toMatchObject({
        id: 'test-id',
        content: 'This is scratch work content',
        type: ScratchWorkType
      });
    });

    it('should handle markdown with name', () => {
      const markdown = 'This is scratch work content';

      const tokens = marked.lexer(markdown);
      const blockRaw: MarkdownBlock = {
        id: 'test-id',
        name: 'Test Name',
        rawTokens: tokens,
        tag: 'scratch-work'
      };

      const result = ScratchWorkBlock.fromMarkdown(blockRaw);

      expect(result).toMatchObject({
        id: 'test-id',
        content: 'This is scratch work content',
        type: ScratchWorkType
      });
    });
  });

  describe('getText', () => {
    it('should return content as text', () => {
      const block = new ScratchWorkBlock(
        'test-id',
        'Test content'
      );

      const text = block.getText();
      expect(text).toBe('Test content');
    });

    it('should handle empty content', () => {
      const block = new ScratchWorkBlock(
        'test-id',
        ''
      );

      const text = block.getText();
      expect(text).toBe('');
    });
  });

  describe('compatibility functions', () => {
    it('should work with convertScratchWorkBlockNode', () => {
      const rawData: RawData = {
        id: 'test-id',
        tag: 'scratch_work',
        rawContent: 'Test content'
      };

      const result = convertScratchWorkBlockNode(rawData);

      expect(result).toBeInstanceOf(ScratchWorkBlock);
      expect(result).toMatchObject({
        id: 'test-id',
        type: ScratchWorkType
      });
    });

    it('should work with convertScratchWorkMarkdown', () => {
      const markdown = 'Test content';
      const markdownBlock: MarkdownBlock = {
        tag: 'scratch-work',
        id: 'test-id',
        rawTokens: marked.lexer(markdown)
      };

      const result = convertScratchWorkMarkdown(markdownBlock);

      expect(result).toBeInstanceOf(ScratchWorkBlock);
      expect(result).toMatchObject({
        id: 'test-id',
        type: ScratchWorkType
      });
    });
  });
}); 
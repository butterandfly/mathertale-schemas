import { expect, describe, it } from "vitest";
import { marked } from "marked";
import { 
  ScratchWorkBlock,
  ScratchWorkType,
  convertScratchWorkMarkdown
} from "./scratch-work-block";
import { MarkdownBlock } from "../convert-markdown-helper";

describe('ScratchWorkBlock', () => {

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

}); 
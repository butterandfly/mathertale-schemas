import { expect, describe, it } from "vitest";
import { marked } from "marked";
import { 
  ProofReorderBlock,
  ProofReorderType,
  convertProofReorderBlockNode,
  convertProofReorderMarkdown
} from "./proof-reorder-block";
import { RawData } from "../convert-helper";
import { MarkdownBlock } from "../convert-markdown-helper";

describe('ProofReorderBlock', () => {
  it('should convert proof reorder block node raw data', () => {
    const rawData: RawData = { 
      id: 'fake-id', 
      tag: 'proof_reorder', 
      rawContent: `This is the main content.

part-1:
First part content

part-2:
Second part content

part-3:
Third part content

question-order:
3,1,2`
    };
    
    const block = convertProofReorderBlockNode(rawData);
    expect(block).toMatchObject({
      content: 'This is the main content.',
      type: ProofReorderType,
      id: rawData.id,
      questionData: {
        orderItems: [
          { id: '1', content: 'First part content' },
          { id: '2', content: 'Second part content' },
          { id: '3', content: 'Third part content' }
        ],
        questionOrder: '3,1,2'
      }
    });
  });

  describe('fromNode', () => {
    it('should convert raw data to proof reorder block', () => {
      const rawData: RawData = {
        id: 'test-id',
        tag: 'proof_reorder',
        rawContent: `Main content

part-1:
First part

part-2:
Second part

question-order:
2,1`
      };

      const result = ProofReorderBlock.fromNode(rawData);

      expect(result).toBeInstanceOf(ProofReorderBlock);
      expect(result).toMatchObject({
        id: 'test-id',
        content: 'Main content',
        type: ProofReorderType,
        questionData: {
          orderItems: [
            { id: '1', content: 'First part' },
            { id: '2', content: 'Second part' }
          ],
          questionOrder: '2,1'
        }
      });
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle raw data with name', () => {
      const rawData: RawData = {
        id: 'test-id',
        name: 'Test Name',
        tag: 'proof_reorder',
        rawContent: `Main content

part-1:
First part

question-order:
1`
      };

      const result = ProofReorderBlock.fromNode(rawData);

      expect(result).toMatchObject({
        id: 'test-id',
        name: 'Test Name',
        content: 'Main content',
        type: ProofReorderType,
        questionData: {
          orderItems: [
            { id: '1', content: 'First part' }
          ],
          questionOrder: '1'
        }
      });
    });
  });

  describe('fromMarkdown', () => {
    it('should convert markdown to proof reorder block', () => {
      const markdown = `This is the main content.

#### Part 1
First part content

#### Part 2
Second part content

#### Part 3
Third part content

#### Question Order
3,1,2`;

      const tokens = marked.lexer(markdown);
      const blockRaw: MarkdownBlock = {
        id: 'test-id',
        rawTokens: tokens,
        tag: 'proof-reorder'
      };

      const result = ProofReorderBlock.fromMarkdown(blockRaw);

      expect(result).toMatchObject({
        id: 'test-id',
        content: 'This is the main content.',
        type: ProofReorderType,
        questionData: {
          orderItems: [
            { id: '1', content: 'First part content' },
            { id: '2', content: 'Second part content' },
            { id: '3', content: 'Third part content' }
          ],
          questionOrder: '3,1,2'
        }
      });
    });

    it('should handle markdown with name', () => {
      const markdown = `This is the main content.

#### Part 1
First part content

#### Question Order
1`;

      const tokens = marked.lexer(markdown);
      const blockRaw: MarkdownBlock = {
        id: 'test-id',
        name: 'Test Name',
        rawTokens: tokens,
        tag: 'proof-reorder'
      };

      const result = ProofReorderBlock.fromMarkdown(blockRaw);

      expect(result).toMatchObject({
        id: 'test-id',
        name: 'Test Name',
        content: 'This is the main content.',
        type: ProofReorderType,
        questionData: {
          orderItems: [
            { id: '1', content: 'First part content' }
          ],
          questionOrder: '1'
        }
      });
    });

    it('should throw error when parts are missing', () => {
      const markdown = `This is the main content.

#### Question Order
1`;

      const tokens = marked.lexer(markdown);
      const blockRaw: MarkdownBlock = {
        id: 'test-id',
        rawTokens: tokens,
        tag: 'proof-reorder'
      };

      expect(() => ProofReorderBlock.fromMarkdown(blockRaw)).toThrow('parts are required');
    });

    it('should throw error when question order is missing', () => {
      const markdown = `This is the main content.

#### Part 1
First part content`;

      const tokens = marked.lexer(markdown);
      const blockRaw: MarkdownBlock = {
        id: 'test-id',
        rawTokens: tokens,
        tag: 'proof-reorder'
      };

      expect(() => ProofReorderBlock.fromMarkdown(blockRaw)).toThrow('question order is required');
    });
  });

  describe('getText', () => {
    it('should return formatted text content', () => {
      const block = new ProofReorderBlock(
        'test-id',
        'Main content',
        {
          orderItems: [
            { id: '1', content: 'First part' },
            { id: '2', content: 'Second part' }
          ],
          questionOrder: '2,1'
        }
      );

      const text = block.getText();
      expect(text).toBe(
        'Main content\n\n' +
        'part-1:\nFirst part\n\n' +
        'part-2:\nSecond part\n\n' +
        'question-order:\n2,1'
      );
    });

    it('should handle empty content', () => {
      const block = new ProofReorderBlock(
        'test-id',
        '',
        {
          orderItems: [
            { id: '1', content: 'First part' }
          ],
          questionOrder: '1'
        }
      );

      const text = block.getText();
      expect(text).toBe(
        '\n\n' +
        'part-1:\nFirst part\n\n' +
        'question-order:\n1'
      );
    });
  });

  describe('compatibility functions', () => {
    it('should work with convertProofReorderBlockNode', () => {
      const rawData: RawData = {
        id: 'test-id',
        tag: 'proof_reorder',
        rawContent: `Main content

part-1:
First part

question-order:
1`
      };

      const result = convertProofReorderBlockNode(rawData);

      expect(result).toBeInstanceOf(ProofReorderBlock);
      expect(result).toMatchObject({
        id: 'test-id',
        type: ProofReorderType
      });
    });

    it('should work with convertProofReorderMarkdown', () => {
      const markdown = `Main content

#### Part 1
First part

#### Question Order
1`;

      const markdownBlock: MarkdownBlock = {
        tag: 'proof-reorder',
        id: 'test-id',
        rawTokens: marked.lexer(markdown)
      };

      const result = convertProofReorderMarkdown(markdownBlock);

      expect(result).toBeInstanceOf(ProofReorderBlock);
      expect(result).toMatchObject({
        id: 'test-id',
        type: ProofReorderType
      });
    });
  });
}); 
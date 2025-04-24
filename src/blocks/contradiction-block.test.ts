import { expect, describe, it } from "vitest";
import { marked } from "marked";
import { 
  ContradictionBlock,
  ContradictionType,
  convertContradictionBlockNode,
  convertContradictionMarkdown
} from "./contradiction-block";
import { RawData } from "../convert-helper";
import { MarkdownBlock } from "../convert-markdown-helper";

describe('ContradictionBlock', () => {
  it('should convert contradiction block node raw data', () => {
    const rawData: RawData = { 
      id: 'fake-id', 
      tag: 'contradiction', 
      rawContent: `This is the main content.

choices:
a: First choice
b: Second choice
c: Third choice

answer:
a, b

explanation:
This is the explanation.`
    };
    
    const block = convertContradictionBlockNode(rawData);
    expect(block).toMatchObject({
      content: 'This is the main content.',
      type: ContradictionType,
      id: rawData.id,
      questionData: {
        choices: [
          { key: 'a', content: 'First choice' },
          { key: 'b', content: 'Second choice' },
          { key: 'c', content: 'Third choice' }
        ],
        answer: ['a', 'b'],
        explanation: 'This is the explanation.'
      }
    });
  });

  describe('fromNode', () => {
    it('should convert raw data to contradiction block', () => {
      const rawData: RawData = {
        id: 'test-id',
        tag: 'contradiction',
        rawContent: `Main content

choices:
a: First choice
b: Second choice

answer:
a, b

explanation:
Test explanation`
      };

      const result = ContradictionBlock.fromNode(rawData);

      expect(result).toBeInstanceOf(ContradictionBlock);
      expect(result).toMatchObject({
        id: 'test-id',
        content: 'Main content',
        type: ContradictionType,
        questionData: {
          choices: [
            { key: 'a', content: 'First choice' },
            { key: 'b', content: 'Second choice' }
          ],
          answer: ['a', 'b'],
          explanation: 'Test explanation'
        }
      });
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle raw data with name', () => {
      const rawData: RawData = {
        id: 'test-id',
        name: 'Test Name',
        tag: 'contradiction',
        rawContent: `Main content

choices:
a: First choice
b: Second choice

answer:
a, b

explanation:
Test explanation`
      };

      const result = ContradictionBlock.fromNode(rawData);

      expect(result).toMatchObject({
        id: 'test-id',
        name: 'Test Name',
        content: 'Main content',
        type: ContradictionType,
        questionData: {
          choices: [
            { key: 'a', content: 'First choice' },
            { key: 'b', content: 'Second choice' }
          ],
          answer: ['a', 'b'],
          explanation: 'Test explanation'
        }
      });
    });

    it('should throw error when choices are missing', () => {
      const rawData: RawData = {
        id: 'test-id',
        tag: 'contradiction',
        rawContent: `Main content

answer:
a, b

explanation:
Test explanation`
      };

      expect(() => ContradictionBlock.fromNode(rawData)).toThrow('choices section is required');
    });

    it('should throw error when answer is missing', () => {
      const rawData: RawData = {
        id: 'test-id',
        tag: 'contradiction',
        rawContent: `Main content

choices:
a: First choice
b: Second choice

explanation:
Test explanation`
      };

      expect(() => ContradictionBlock.fromNode(rawData)).toThrow('answer section is required');
    });

    it('should throw error when explanation is missing', () => {
      const rawData: RawData = {
        id: 'test-id',
        tag: 'contradiction',
        rawContent: `Main content

choices:
a: First choice
b: Second choice

answer:
a, b`
      };

      expect(() => ContradictionBlock.fromNode(rawData)).toThrow('explanation section is required');
    });

    it('should throw error when answer length is not 2', () => {
      const rawData: RawData = {
        id: 'test-id',
        tag: 'contradiction',
        rawContent: `Main content

choices:
a: First choice
b: Second choice
c: Third choice

answer:
a

explanation:
Test explanation`
      };

      expect(() => ContradictionBlock.fromNode(rawData)).toThrow('Answer must contain exactly 2 keys for block ID: test-id');
    });

    it('should throw error when answer key does not exist in choices', () => {
      const rawData: RawData = {
        id: 'test-id',
        tag: 'contradiction',
        rawContent: `Main content

choices:
a: First choice
b: Second choice

answer:
a, c

explanation:
Test explanation`
      };

      expect(() => ContradictionBlock.fromNode(rawData)).toThrow('Answer key "c" does not exist in choices (a, b) for block ID: test-id');
    });
  });

  describe('fromMarkdown', () => {
    it('should convert markdown to contradiction block', () => {
      const markdown = `This is the main content.

#### Choices
a: First choice
b: Second choice
c: Third choice

#### Answer
a, b

#### Explanation
This is the explanation.`;

      const tokens = marked.lexer(markdown);
      const blockRaw: MarkdownBlock = {
        id: 'test-id',
        rawTokens: tokens,
        tag: 'contradiction'
      };

      const result = ContradictionBlock.fromMarkdown(blockRaw);

      expect(result).toMatchObject({
        id: 'test-id',
        content: 'This is the main content.',
        type: ContradictionType,
        questionData: {
          choices: [
            { key: 'a', content: 'First choice' },
            { key: 'b', content: 'Second choice' },
            { key: 'c', content: 'Third choice' }
          ],
          answer: ['a', 'b'],
          explanation: 'This is the explanation.'
        }
      });
    });

    it('should handle markdown with name', () => {
      const markdown = `This is the main content.

#### Choices
a: First choice
b: Second choice

#### Answer
a, b

#### Explanation
This is the explanation.`;

      const tokens = marked.lexer(markdown);
      const blockRaw: MarkdownBlock = {
        id: 'test-id',
        name: 'Test Name',
        rawTokens: tokens,
        tag: 'contradiction'
      };

      const result = ContradictionBlock.fromMarkdown(blockRaw);

      expect(result).toMatchObject({
        id: 'test-id',
        name: 'Test Name',
        content: 'This is the main content.',
        type: ContradictionType,
        questionData: {
          choices: [
            { key: 'a', content: 'First choice' },
            { key: 'b', content: 'Second choice' }
          ],
          answer: ['a', 'b'],
          explanation: 'This is the explanation.'
        }
      });
    });

    it('should throw error when choices are missing', () => {
      const markdown = `This is the main content.

#### Answer
a, b

#### Explanation
This is the explanation.`;

      const tokens = marked.lexer(markdown);
      const blockRaw: MarkdownBlock = {
        id: 'test-id',
        rawTokens: tokens,
        tag: 'contradiction'
      };

      expect(() => ContradictionBlock.fromMarkdown(blockRaw)).toThrow('Choices cannot be empty for block ID: test-id');
    });

    it('should throw error when answer is missing', () => {
      const markdown = `This is the main content.

#### Choices
a: First choice
b: Second choice

#### Explanation
Test explanation`;

      const tokens = marked.lexer(markdown);
      const blockRaw: MarkdownBlock = {
        id: 'test-id',
        rawTokens: tokens,
        tag: 'contradiction'
      };

      expect(() => ContradictionBlock.fromMarkdown(blockRaw)).toThrow('Answer must contain exactly 2 keys for block ID: test-id');
    });

    it('should throw error when explanation is missing', () => {
      const markdown = `This is the main content.

#### Choices
a: First choice
b: Second choice

#### Answer
a, b`;

      const tokens = marked.lexer(markdown);
      const blockRaw: MarkdownBlock = {
        id: 'test-id',
        rawTokens: tokens,
        tag: 'contradiction'
      };

      expect(() => ContradictionBlock.fromMarkdown(blockRaw)).toThrow('Explanation is required for block ID: test-id');
    });

    it('should throw error when answer length is not 2', () => {
      const markdown = `This is the main content.

#### Choices
a: First choice
b: Second choice
c: Third choice

#### Answer
a

#### Explanation
Test explanation`;

      const tokens = marked.lexer(markdown);
      const blockRaw: MarkdownBlock = {
        id: 'test-id',
        rawTokens: tokens,
        tag: 'contradiction'
      };

      expect(() => ContradictionBlock.fromMarkdown(blockRaw)).toThrow('Answer must contain exactly 2 keys for block ID: test-id');
    });

    it('should throw error when answer key does not exist in choices', () => {
      const markdown = `This is the main content.

#### Choices
a: First choice
b: Second choice

#### Answer
a, c

#### Explanation
Test explanation`;

      const tokens = marked.lexer(markdown);
      const blockRaw: MarkdownBlock = {
        id: 'test-id',
        rawTokens: tokens,
        tag: 'contradiction'
      };

      expect(() => ContradictionBlock.fromMarkdown(blockRaw)).toThrow('Answer key "c" does not exist in choices (a, b) for block ID: test-id');
    });
  });

  describe('getText', () => {
    it('should return formatted text content', () => {
      const block = new ContradictionBlock(
        'test-id',
        'Main content',
        {
          choices: [
            { key: 'a', content: 'First choice' },
            { key: 'b', content: 'Second choice' }
          ],
          answer: ['a', 'b'],
          explanation: 'Test explanation'
        }
      );

      const text = block.getText();
      expect(text).toBe(
        'Main content\n\n' +
        'choices:\n' +
        'a: First choice\n' +
        'b: Second choice\n\n' +
        'answer:\n' +
        'a, b\n\n' +
        'explanation:\n' +
        'Test explanation'
      );
    });

    it('should handle empty content', () => {
      const block = new ContradictionBlock(
        'test-id',
        '',
        {
          choices: [
            { key: 'a', content: 'First choice' }
          ],
          answer: ['a', 'b'],
          explanation: 'Test explanation'
        }
      );

      const text = block.getText();
      expect(text).toBe(
        '\n\n' +
        'choices:\n' +
        'a: First choice\n\n' +
        'answer:\n' +
        'a, b\n\n' +
        'explanation:\n' +
        'Test explanation'
      );
    });
  });

  describe('compatibility functions', () => {
    it('should work with convertContradictionBlockNode', () => {
      const rawData: RawData = {
        id: 'test-id',
        tag: 'contradiction',
        rawContent: `Main content

choices:
a: First choice
b: Second choice

answer:
a, b

explanation:
Test explanation`
      };

      const result = convertContradictionBlockNode(rawData);

      expect(result).toBeInstanceOf(ContradictionBlock);
      expect(result).toMatchObject({
        id: 'test-id',
        type: ContradictionType
      });
    });

    it('should work with convertContradictionMarkdown', () => {
      const markdown = `Main content

#### Choices
a: First choice
b: Second choice

#### Answer
a, b

#### Explanation
Test explanation`;

      const markdownBlock: MarkdownBlock = {
        tag: 'contradiction',
        id: 'test-id',
        rawTokens: marked.lexer(markdown)
      };

      const result = convertContradictionMarkdown(markdownBlock);

      expect(result).toBeInstanceOf(ContradictionBlock);
      expect(result).toMatchObject({
        id: 'test-id',
        type: ContradictionType
      });
    });
  });
}); 
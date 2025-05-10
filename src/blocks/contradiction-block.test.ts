import { expect, describe, it } from "vitest";
import { marked } from "marked";
import { 
  ContradictionBlock,
  ContradictionType,
  convertContradictionMarkdown
} from "./contradiction-block";
import { MarkdownBlock } from "../convert-markdown-helper";

describe('ContradictionBlock', () => {
  

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

}); 
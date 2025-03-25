import { expect, describe, it } from "vitest";
import { 
  convertContradiction, 
  convertContradictionBlockNode, 
  ContradictionType,
} from './contradiction-block';
import { RawData } from '../convert-helper';
import { marked } from 'marked';
import { convertContradictionMarkdown } from './contradiction-block';

describe('Contradiction Block', () => {
  describe('convertContradiction', () => {
    it('should convert raw content to structured data', () => {
      const rawContent = `This is a contradiction question.
It can have multiple lines.

choices:
a: First choice
b: Second choice
c: Third choice
d: Fourth choice

answer:
a, c

explanation:
This is the explanation.
It can also have multiple lines.`;

      const result = convertContradiction(rawContent);
      
      // Check block content
      expect(result.blockContent).toBe('This is a contradiction question.\nIt can have multiple lines.');
      
      // Check question data
      expect(result.questionData.choices).toHaveLength(4);
      expect(result.questionData.choices[0]).toEqual({ key: 'a', content: 'First choice' });
      expect(result.questionData.choices[1]).toEqual({ key: 'b', content: 'Second choice' });
      expect(result.questionData.choices[2]).toEqual({ key: 'c', content: 'Third choice' });
      expect(result.questionData.choices[3]).toEqual({ key: 'd', content: 'Fourth choice' });
      
      // Check answer (Array)
      expect(result.questionData.answer).toHaveLength(2);
      expect(result.questionData.answer).toContain('a');
      expect(result.questionData.answer).toContain('c');
      
      // Check explanation
      expect(result.questionData.explanation).toBe('This is the explanation.\nIt can also have multiple lines.');
    });

    it('should handle different order of sections', () => {
      const rawContent = `This is a contradiction question.

explanation:
This is the explanation.

choices:
a: First choice
b: Second choice

answer:
a, b`;

      const result = convertContradiction(rawContent);
      
      expect(result.blockContent).toBe('This is a contradiction question.');
      expect(result.questionData.choices).toHaveLength(2);
      expect(result.questionData.answer).toHaveLength(2);
      expect(result.questionData.answer).toContain('a');
      expect(result.questionData.answer).toContain('b');
      expect(result.questionData.explanation).toBe('This is the explanation.');
    });

    it('should handle answer keys in different order', () => {
      const rawContent = `Question
      
choices:
a: First choice
b: Second choice
c: Third choice

answer:
c, a

explanation:
Explanation`;

      const result = convertContradiction(rawContent);
      
      expect(result.questionData.answer).toHaveLength(2);
      expect(result.questionData.answer).toContain('a');
      expect(result.questionData.answer).toContain('c');
    });

    it('should throw error if choices section is missing', () => {
      const rawContent = `Question
      
answer:
a

explanation:
Explanation`;

      expect(() => convertContradiction(rawContent)).toThrow('choices section is required');
    });

    it('should throw error if answer section is missing', () => {
      const rawContent = `Question
      
choices:
a: First choice

explanation:
Explanation`;

      expect(() => convertContradiction(rawContent)).toThrow('answer section is required');
    });

    it('should throw error if explanation section is missing', () => {
      const rawContent = `Question
      
choices:
a: First choice

answer:
a`;

      expect(() => convertContradiction(rawContent)).toThrow('explanation section is required');
    });

    it('should throw error if choices section is empty', () => {
      const rawContent = `Question
      
choices:

answer:
a

explanation:
Explanation`;

      expect(() => convertContradiction(rawContent)).toThrow('choices section is empty');
    });

    it('should throw error if answer section is empty', () => {
      const rawContent = `Question
      
choices:
a: First choice

answer:

explanation:
Explanation`;

      expect(() => convertContradiction(rawContent)).toThrow('answer must be 2 keys');
    });

    it('should throw error if answer key does not exist in choices', () => {
      const rawContent = `Question
      
choices:
a: First choice
b: Second choice

answer:
a, c

explanation:
Explanation`;

      expect(() => convertContradiction(rawContent)).toThrow('answer key "c" does not exist in choices');
    });
  });

  describe('convertContradictionBlockNode', () => {
    it('should convert raw data to contradiction block data', () => {
      const rawData: RawData = {
        id: 'test-id',
        tag: 'test-tag',
        rawContent: `Question

choices:
a: First choice
b: Second choice

answer:
a, b

explanation:
Explanation`
      };

      const result = convertContradictionBlockNode(rawData);
      
      expect(result.id).toBe('test-id');
      expect(result.type).toBe(ContradictionType);
      expect(result.content).toBe('Question');
      expect(result.questionData.choices).toHaveLength(2);
      expect(result.questionData.answer).toHaveLength(2);
      expect(result.questionData.answer).toContain('a');
      expect(result.questionData.answer).toContain('b');
      expect(result.questionData.explanation).toBe('Explanation');
    });
  });

  describe('convertContradictionMarkdown', () => {
    it('should convert markdown to contradiction data', () => {
      const markdown = `This is the question content.
It can have multiple lines and LaTeX content like $x^2$.

#### Choices
a: First choice with $\\alpha$
b: Second choice with $\\beta$
c: Third choice with $\\gamma$
d: Fourth choice with $\\delta$

#### Answer
a, c

#### Explanation
This is the explanation.
It can also have multiple lines and LaTeX content.`;

      const tokens = marked.lexer(markdown);
      const result = convertContradictionMarkdown({
        id: 'test-id',
        rawTokens: tokens,
        tag: 'contradiction'
      });

      expect(result).toEqual({
        id: 'test-id',
        type: ContradictionType,
        content: 'This is the question content.\nIt can have multiple lines and LaTeX content like $x^2$.',
        questionData: {
          choices: [
            { key: 'a', content: 'First choice with $\\alpha$' },
            { key: 'b', content: 'Second choice with $\\beta$' },
            { key: 'c', content: 'Third choice with $\\gamma$' },
            { key: 'd', content: 'Fourth choice with $\\delta$' }
          ],
          answer: ['a', 'c'],
          explanation: 'This is the explanation.\nIt can also have multiple lines and LaTeX content.'
        }
      });
    });

    it('should throw error when choices section is missing', () => {
      const markdown = `This is the question content.

#### Answer
a, b

#### Explanation
This is the explanation.`;

      const tokens = marked.lexer(markdown);
      expect(() => convertContradictionMarkdown({
        id: 'test-id',
        rawTokens: tokens,
        tag: 'contradiction'
      })).toThrow('choices section is required');
    });

    it('should throw error when answer section is missing', () => {
      const markdown = `This is the question content.

#### Choices
a: First choice
b: Second choice

#### Explanation
This is the explanation.`;

      const tokens = marked.lexer(markdown);
      expect(() => convertContradictionMarkdown({
        id: 'test-id',
        rawTokens: tokens,
        tag: 'contradiction'
      })).toThrow('answer section is required');
    });

    it('should throw error when answer length is not 2', () => {
      const markdown = `This is the question content.

#### Choices
a: First choice
b: Second choice
c: Third choice

#### Answer
a

#### Explanation
This is the explanation.`;

      const tokens = marked.lexer(markdown);
      expect(() => convertContradictionMarkdown({
        id: 'test-id',
        rawTokens: tokens,
        tag: 'contradiction'
      })).toThrow('answer must be 2 keys');
    });

    it('should throw error when answer key does not exist in choices', () => {
      const markdown = `This is the question content.

#### Choices
a: First choice
b: Second choice
c: Third choice

#### Answer
a, x

#### Explanation
This is the explanation.`;

      const tokens = marked.lexer(markdown);
      expect(() => convertContradictionMarkdown({
        id: 'test-id',
        rawTokens: tokens,
        tag: 'contradiction'
      })).toThrow('answer key "x" does not exist in choices');
    });

    it('should handle content before any heading', () => {
      const markdown = `Some content before any heading.
More content here.

#### Choices
a: First choice
b: Second choice
c: Third choice

#### Answer
a, b

#### Explanation
This is the explanation.`;

      const tokens = marked.lexer(markdown);
      const result = convertContradictionMarkdown({
        id: 'test-id',
        rawTokens: tokens,
        tag: 'contradiction'
      });

      expect(result.content).toBe('Some content before any heading.\nMore content here.');
    });
  });
}); 
import { expect, describe, it } from "vitest";
import { 
  convertContradiction, 
  convertContradictionBlockNode, 
  ContradictionType,
} from './contradiction-block';
import { RawData } from '../convert-helper';

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
      
      // Check answer (Set)
      expect(result.questionData.answer.size).toBe(2);
      expect(result.questionData.answer.has('a')).toBe(true);
      expect(result.questionData.answer.has('c')).toBe(true);
      
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
      expect(result.questionData.answer.size).toBe(2);
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
      
      expect(result.questionData.answer.size).toBe(2);
      expect(result.questionData.answer.has('a')).toBe(true);
      expect(result.questionData.answer.has('c')).toBe(true);
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
      expect(result.questionData.answer.size).toBe(2);
      expect(result.questionData.explanation).toBe('Explanation');
    });
  });
}); 
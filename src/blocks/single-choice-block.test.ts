import { expect, describe, it } from "vitest";
import { convertSingleChoiceBlockNode } from "./single-choice-block";
import { RawData } from "../convert-helper";
import { SingleChoiceType } from "./single-choice-block";
import { MarkdownBlockRaw } from "../convert-markdown-helper";
import { marked } from "marked";
import { convertSingleChoiceMarkdown } from "./single-choice-block";

describe('SingleChoiceBlock', () => {
    it('should convert single choice block node raw data', () => {
        const rawData: RawData = { 
          id: 'fake-id', 
          tag: 'single_choice', 
          rawContent: `
    What is 2+2?
    
    choices:
    a: 3
    b: 4
    c: 5
    
    answer:
    b
    
    explanation:
    Because 2+2=4`
        };
        
        const block = convertSingleChoiceBlockNode(rawData);
        expect(block).toEqual({
          content: 'What is 2+2?',
          type: SingleChoiceType,
          questionData: expect.any(Object),
          id: rawData.id,
        });
    
        // 验证 questionData 是否正确解析
        expect(block.questionData).toEqual({
          choices: [
            { key: 'a', content: '3' },
            { key: 'b', content: '4' },
            { key: 'c', content: '5' }
          ],
          answer: 'b',
          explanation: 'Because 2+2=4'
        });
    });
    
    it('should throw error if choices key is misspelled as "choice"', () => {
        const rawData: RawData = {
          id: 'fake-id-error-1',
          tag: 'single_choice',
          rawContent: `
    What is 2+2?
    
    choice:
    a: 3
    b: 4
    c: 5
    
    answer:
    b
    
    explanation:
    Because 2+2=4`
        };

        expect(() => convertSingleChoiceBlockNode(rawData)).toThrow(Error);
    });
    
    it('should throw error if answer field is missing', () => {
        const rawData: RawData = {
          id: 'fake-id-error-2',
          tag: 'single_choice',
          rawContent: `
    What is 2+2?
    
    choices:
    a: 3
    b: 4
    c: 5
    
    explanation:
    Because 2+2=4`
        };

        expect(() => convertSingleChoiceBlockNode(rawData)).toThrow(Error);
    });
    
    it('should throw error if explanation key is misspelled as "explain"', () => {
        const rawData: RawData = {
          id: 'fake-id-error-3',
          tag: 'single_choice',
          rawContent: `
    What is 2+2?
    
    choices:
    a: 3
    b: 4
    c: 5
    
    answer:
    b
    
    explain:
    Because 2+2=4`
        };

        expect(() => convertSingleChoiceBlockNode(rawData)).toThrow(Error);
    });
    
    it('should handle choices with colons in their content', () => {
        const rawData: RawData = {
          id: 'fake-id-with-colons',
          tag: 'single_choice',
          rawContent: `
    What is the correct syntax for defining a constant in JavaScript?
    
    choices:
    a: var x = 10
    b: let x = 10
    c: const x = 10
    d: x: 10
    e: Choice with: colon in the middle
    f: Choice with multiple: colons: in content
    
    answer:
    c
    
    explanation:
    The const keyword is used to define constants in JavaScript.`
        };
        
        const block = convertSingleChoiceBlockNode(rawData);
        
        // Verify that choices with colons are parsed correctly
        expect(block.questionData.choices).toEqual([
          { key: 'a', content: 'var x = 10' },
          { key: 'b', content: 'let x = 10' },
          { key: 'c', content: 'const x = 10' },
          { key: 'd', content: 'x: 10' },
          { key: 'e', content: 'Choice with: colon in the middle' },
          { key: 'f', content: 'Choice with multiple: colons: in content' }
        ]);
    });
});

describe('convertSingleChoiceMarkdown', () => {
  it('should convert a simple single choice block', () => {
    const markdown = `This is a question.

#### Choices
a: First choice
b: Second choice
c: Third choice

#### Answer
b

#### Explanation
This is why B is correct.`;

    const block: MarkdownBlockRaw = {
      tag: 'single_choice',
      id: 'test-id',
      name: 'Test Question',
      rawTokens: marked.lexer(markdown)
    };

    const result = convertSingleChoiceMarkdown(block);

    expect(result).toMatchObject({
      id: 'test-id',
      type: SingleChoiceType,
      content: 'This is a question.',
      questionData: {
        choices: [
          { key: 'a', content: 'First choice' },
          { key: 'b', content: 'Second choice' },
          { key: 'c', content: 'Third choice' }
        ],
        answer: 'b',
        explanation: 'This is why B is correct.'
      }
    });
  });

  it('should handle LaTeX content', () => {
    const markdown = `What is the value of $\\alpha$?

#### Choices
a: $\\alpha = 1$
b: $\\alpha = 2$
c: $\\alpha = 3$

#### Answer
a

#### Explanation
Since $\\alpha = 1$ by definition.`;

    const block: MarkdownBlockRaw = {
      tag: 'single_choice',
      id: 'latex-test',
      rawTokens: marked.lexer(markdown)
    };

    const result = convertSingleChoiceMarkdown(block);

    expect(result.id).toBe('latex-test');
    expect(result.type).toBe(SingleChoiceType);
    expect(result.content).toBe('What is the value of $\\alpha$?');
    expect(result.questionData.choices).toEqual([
      { key: 'a', content: '$\\alpha = 1$' },
      { key: 'b', content: '$\\alpha = 2$' },
      { key: 'c', content: '$\\alpha = 3$' }
    ]);
    expect(result.questionData.explanation).toBe('Since $\\alpha = 1$ by definition.');
  });

  it('should handle missing optional properties', () => {
    const markdown = `Just a question without properties.`;

    const block: MarkdownBlockRaw = {
      tag: 'single_choice',
      id: 'minimal-test',
      rawTokens: marked.lexer(markdown)
    };

    const result = convertSingleChoiceMarkdown(block);

    expect(result).toMatchObject({
      id: 'minimal-test',
      type: SingleChoiceType,
      content: 'Just a question without properties.',
      questionData: {
        choices: [],
        answer: '',
        explanation: ''
      }
    });
  });
});
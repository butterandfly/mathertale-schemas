import { expect, describe, it } from "vitest";
import { marked } from "marked";
import { 
  SingleChoiceBlock,
  SingleChoiceType,
  convertSingleChoiceBlockNode,
  convertSingleChoiceMarkdown
} from "./single-choice-block";
import { RawData } from "../convert-helper";
import { MarkdownBlockRaw } from "../convert-markdown-helper";

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
        expect(block).toMatchObject({
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

    describe('fromNode', () => {
        it('should convert raw data to single choice block', () => {
            const rawData: RawData = {
                id: 'test-id',
                tag: 'single_choice',
                rawContent: `What is 2+2?

choices:
a: 3
b: 4
c: 5

answer:
b

explanation:
Basic arithmetic`
            };

            const result = SingleChoiceBlock.fromNode(rawData);

            expect(result).toBeInstanceOf(SingleChoiceBlock);
            expect(result).toMatchObject({
                id: 'test-id',
                content: 'What is 2+2?',
                type: SingleChoiceType,
                questionData: {
                    choices: [
                        { key: 'a', content: '3' },
                        { key: 'b', content: '4' },
                        { key: 'c', content: '5' }
                    ],
                    answer: 'b',
                    explanation: 'Basic arithmetic'
                }
            });
            expect(result.updatedAt).toBeInstanceOf(Date);
        });

        it('should handle raw data with name', () => {
            const rawData: RawData = {
                id: 'test-id',
                tag: 'single_choice',
                name: 'Test Name',
                rawContent: `What is 2+2?

choices:
a: 3
b: 4

answer:
b

explanation:
Basic arithmetic`
            };

            const result = SingleChoiceBlock.fromNode(rawData);

            expect(result).toMatchObject({
                id: 'test-id',
                name: 'Test Name',
                content: 'What is 2+2?',
                type: SingleChoiceType
            });
        });

        it('should throw error when choices are missing', () => {
            const rawData: RawData = {
                id: 'test-id',
                tag: 'single_choice',
                rawContent: `What is 2+2?

answer:
b

explanation:
Basic arithmetic`
            };

            expect(() => SingleChoiceBlock.fromNode(rawData)).toThrow('choices section is required');
        });
    });

    describe('fromMarkdown', () => {
        it('should convert markdown to single choice block', () => {
            const markdown = `What is 2+2?

#### Choices
a: 3
b: 4
c: 5

#### Answer
b

#### Explanation
Basic arithmetic`;

            const tokens = marked.lexer(markdown);
            const blockRaw: MarkdownBlockRaw = {
                id: 'test-id',
                rawTokens: tokens,
                tag: 'single-choice'
            };

            const result = SingleChoiceBlock.fromMarkdown(blockRaw);

            expect(result).toMatchObject({
                id: 'test-id',
                content: 'What is 2+2?',
                type: SingleChoiceType,
                questionData: {
                    choices: [
                        { key: 'a', content: '3' },
                        { key: 'b', content: '4' },
                        { key: 'c', content: '5' }
                    ],
                    answer: 'b',
                    explanation: 'Basic arithmetic'
                }
            });
        });

        it('should handle markdown with name', () => {
            const markdown = `What is 2+2?

#### Choices
a: 3
b: 4
c: 5

#### Answer
b

#### Explanation
Basic arithmetic`;

            const tokens = marked.lexer(markdown);
            const blockRaw: MarkdownBlockRaw = {
                id: 'test-id',
                name: 'Test Question',
                rawTokens: tokens,
                tag: 'single-choice'
            };

            const result = SingleChoiceBlock.fromMarkdown(blockRaw);

            expect(result).toMatchObject({
                id: 'test-id',
                name: 'Test Question',
                content: 'What is 2+2?',
                type: SingleChoiceType,
                questionData: {
                    choices: [
                        { key: 'a', content: '3' },
                        { key: 'b', content: '4' },
                        { key: 'c', content: '5' }
                    ],
                    answer: 'b',
                    explanation: 'Basic arithmetic'
                }
            });
        });
    });

    describe('getText', () => {
        it('should return formatted text content', () => {
            const block = new SingleChoiceBlock(
                'test-id',
                'What is 2+2?',
                {
                    choices: [
                        { key: 'a', content: '3' },
                        { key: 'b', content: '4' },
                        { key: 'c', content: '5' }
                    ],
                    answer: 'b',
                    explanation: 'Basic arithmetic'
                }
            );

            const text = block.getText();
            expect(text).toBe('What is 2+2?\n\nchoices:\na: 3\nb: 4\nc: 5\n\nanswer:\nb\n\nexplanation:\nBasic arithmetic');
        });

        it('should handle empty content', () => {
            const block = new SingleChoiceBlock(
                'test-id',
                '',
                {
                    choices: [
                        { key: 'a', content: '3' },
                        { key: 'b', content: '4' }
                    ],
                    answer: 'b',
                    explanation: 'Basic arithmetic'
                }
            );

            const text = block.getText();
            expect(text).toBe('\n\nchoices:\na: 3\nb: 4\n\nanswer:\nb\n\nexplanation:\nBasic arithmetic');
        });
    });

    describe('compatibility functions', () => {
        it('should work with convertSingleChoiceBlockNode', () => {
            const rawData: RawData = {
                id: 'test-id',
                tag: 'single_choice',
                rawContent: `What is 2+2?

choices:
a: 3
b: 4

answer:
b

explanation:
Basic arithmetic`
            };

            const result = convertSingleChoiceBlockNode(rawData);

            expect(result).toBeInstanceOf(SingleChoiceBlock);
            expect(result).toMatchObject({
                id: 'test-id',
                type: SingleChoiceType
            });
        });

        it('should work with convertSingleChoiceMarkdown', () => {
            const markdownBlock: MarkdownBlockRaw = {
                tag: 'single-choice',
                id: 'test-id',
                rawTokens: marked.lexer(`#### Content
Question

#### Choices
a: First
b: Second

#### Answer
b

#### Explanation
Because`)
            };

            const result = convertSingleChoiceMarkdown(markdownBlock);

            expect(result).toBeInstanceOf(SingleChoiceBlock);
            expect(result).toMatchObject({
                id: 'test-id',
                type: SingleChoiceType
            });
        });
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
      tag: 'single-choice',
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
      tag: 'single-choice',
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
    const markdown = `Just a question without properties.

#### Choices
a: First choice
b: Second choice

#### Answer
b`;

    const block: MarkdownBlockRaw = {
      tag: 'single-choice',
      id: 'minimal-test',
      rawTokens: marked.lexer(markdown)
    };

    const result = convertSingleChoiceMarkdown(block);

    expect(result).toMatchObject({
      id: 'minimal-test',
      type: SingleChoiceType,
      content: 'Just a question without properties.',
      questionData: {
        choices: [
          { key: 'a', content: 'First choice' },
          { key: 'b', content: 'Second choice' }
        ],
        answer: 'b',
        explanation: ''
      }
    });
  });

  it('should convert markdown to single choice data', () => {
    const markdown = `This is the question content.
It can have multiple lines and LaTeX content like $x^2$.

#### Choices
a: First choice with $\\alpha$
b: Second choice with $\\beta$
c: Third choice with $\\gamma$

#### Answer
b

#### Explanation
This is the explanation.
It can also have multiple lines and LaTeX content.`;

    const tokens = marked.lexer(markdown);
    const blockRaw: MarkdownBlockRaw = {
      id: 'test-id',
      rawTokens: tokens,
      tag: 'single-choice'
    };

    const result = convertSingleChoiceMarkdown(blockRaw);

    expect(result).toMatchObject({
      id: 'test-id',
      type: SingleChoiceType,
      content: 'This is the question content.\nIt can have multiple lines and LaTeX content like $x^2$.',
      questionData: {
        choices: [
          { key: 'a', content: 'First choice with $\\alpha$' },
          { key: 'b', content: 'Second choice with $\\beta$' },
          { key: 'c', content: 'Third choice with $\\gamma$' }
        ],
        answer: 'b',
        explanation: 'This is the explanation.\nIt can also have multiple lines and LaTeX content.'
      }
    });
  });

  it('should throw error when choices section is missing', () => {
    const markdown = `This is the question content.

#### Answer
b

#### Explanation
This is the explanation.`;

    const tokens = marked.lexer(markdown);
    expect(() => convertSingleChoiceMarkdown({
      id: 'test-id',
      rawTokens: tokens,
      tag: 'single-choice'
    })).toThrow('choices is required');
  });

  it('should throw error when answer section is missing', () => {
    const markdown = `This is the question content.

#### Choices
a: First choice
b: Second choice
c: Third choice

#### Explanation
This is the explanation.`;

    const tokens = marked.lexer(markdown);
    expect(() => convertSingleChoiceMarkdown({
      id: 'test-id',
      rawTokens: tokens,
      tag: 'single-choice'
    })).toThrow('answer is required');
  });

  it('should handle content before any heading', () => {
    const markdown = `Some content before any heading.
More content here.

#### Choices
a: First choice
b: Second choice
c: Third choice

#### Answer
b

#### Explanation
This is the explanation.`;

    const tokens = marked.lexer(markdown);
    const result = convertSingleChoiceMarkdown({
      id: 'test-id',
      rawTokens: tokens,
      tag: 'single-choice'
    });

    expect(result.content).toBe('Some content before any heading.\nMore content here.');
  });
});
import { expect, describe, it } from "vitest";
import { marked } from "marked";
import { 
  SingleChoiceBlock,
  SingleChoiceType,
  convertSingleChoiceMarkdown
} from "./single-choice-block";
import { MarkdownBlock } from "../convert-markdown-helper";

describe('SingleChoiceBlock', () => {
    describe('fromMarkdown method', () => {
        it('should correctly parse markdown content with properties', () => {
            const markdown = `This is a test question.

#### Choices
a: First choice
b: Second choice
c: Third choice

#### Answer
b

#### Explanation
The explanation text.`;

            const tokens = marked.lexer(markdown);

            const markdownBlock: MarkdownBlock = {
                tag: 'single_choice',
                id: 'test-id',
                name: 'Test Question',
                rawTokens: tokens
            };

            const block = SingleChoiceBlock.fromMarkdown(markdownBlock);
            
            expect(block.id).toBe('test-id');
            expect(block.name).toBe('Test Question');
            expect(block.content).toBe('This is a test question.');
            expect(block.questionData.choices.length).toBe(3);
            expect(block.questionData.choices[0].key).toBe('a');
            expect(block.questionData.choices[0].content).toBe('First choice');
            expect(block.questionData.choices[1].key).toBe('b');
            expect(block.questionData.choices[1].content).toBe('Second choice');
            expect(block.questionData.choices[2].key).toBe('c');
            expect(block.questionData.choices[2].content).toBe('Third choice');
            expect(block.questionData.answer).toBe('b');
            expect(block.questionData.explanation).toBe('The explanation text.');
        });

        it('should handle choices with complex content', () => {
            const markdown = `This is a test question.

#### Choices
a: Choice with $\\alpha$
b: Choice with: colon inside
c: Choice with more: colons: here

#### Answer
b

#### Explanation
The explanation.`;

            const tokens = marked.lexer(markdown);
            
            const markdownBlock: MarkdownBlock = {
                tag: 'single_choice',
                id: 'test-id',
                name: 'Test Question',
                rawTokens: tokens
            };

            const block = SingleChoiceBlock.fromMarkdown(markdownBlock);
            
            expect(block.questionData.choices.length).toBe(3);
            expect(block.questionData.choices[0].content).toBe('Choice with $\\alpha$');
            expect(block.questionData.choices[1].content).toBe('Choice with: colon inside');
            expect(block.questionData.choices[2].content).toBe('Choice with more: colons: here');
        });

        it('should work with convertSingleChoiceMarkdown', () => {
            const markdown = `This is a test question.

#### Choices
a: First choice
b: Second choice
c: Third choice

#### Answer
b

#### Explanation
The explanation text.`;

            const tokens = marked.lexer(markdown);
            
            const markdownBlock: MarkdownBlock = {
                tag: 'single_choice',
                id: 'test-id',
                name: 'Test Question',
                rawTokens: tokens
            };

            const result = convertSingleChoiceMarkdown(markdownBlock);
            expect(result.id).toBe('test-id');
            expect(result.type).toBe('SINGLE_CHOICE');
        });
    });

    describe('validate method', () => {
        it('should throw error if choices is empty', () => {
            const block = new SingleChoiceBlock(
                'test-id',
                'Test content',
                {
                    choices: [],
                    answer: 'a',
                    explanation: 'Explanation'
                }
            );
            
            expect(() => SingleChoiceBlock.validate(block)).toThrow('Choices cannot be empty');
        });
        
        it('should throw error if answer is empty', () => {
            const block = new SingleChoiceBlock(
                'test-id',
                'Test content',
                {
                    choices: [{ key: 'a', content: 'Choice A' }],
                    answer: '',
                    explanation: 'Explanation'
                }
            );
            
            expect(() => SingleChoiceBlock.validate(block)).toThrow('Answer is required');
        });
        
        it('should throw error if answer is not in choices', () => {
            const block = new SingleChoiceBlock(
                'test-id',
                'Test content',
                {
                    choices: [{ key: 'a', content: 'Choice A' }],
                    answer: 'b',
                    explanation: 'Explanation'
                }
            );
            
            expect(() => SingleChoiceBlock.validate(block)).toThrow('Answer "b" is not a valid choice key');
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

    const block: MarkdownBlock = {
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

    const block: MarkdownBlock = {
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

    const block: MarkdownBlock = {
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
    const blockRaw: MarkdownBlock = {
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
    const markdown = `
#### Answer
b

#### Explanation
Explanation here.
`;
    const tokens = marked.lexer(markdown);

    expect(() => convertSingleChoiceMarkdown({
      id: 'test-id',
      rawTokens: tokens,
      tag: 'single-choice'
    })).toThrow('Choices cannot be empty for block ID: test-id');
  });

  it('should throw error when answer section is missing', () => {
    const markdown = `
#### Choices
a: Choice A
b: Choice B

#### Explanation
Explanation here.
`;
    const tokens = marked.lexer(markdown);

    expect(() => convertSingleChoiceMarkdown({
      id: 'test-id',
      rawTokens: tokens,
      tag: 'single-choice'
    })).toThrow('Answer is required for block ID: test-id');
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
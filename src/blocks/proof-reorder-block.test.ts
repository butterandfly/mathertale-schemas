import { marked } from 'marked';
import { convertProofReorderBlockNode, ProofReorderType, convertProofReorderMarkdown } from './proof-reorder-block';
import { expect, describe, it } from "vitest";


describe('convertProofReorderBlockNode', () => {
  it('should convert a valid proof reorder block', () => {
    const rawContent = `Here's a proof that needs to be reordered.

part-1:
First, we establish that x = 1.

part-2:
Then, we can prove that y = 2.

part-3:
Finally, we conclude z = 3.

question-order:
3,1,2`;

    const result = convertProofReorderBlockNode({
      id: 'test-id',
      tag: 'proof-reorder',
      rawContent,
    });

    expect(result).toEqual({
      id: 'test-id',
      type: ProofReorderType,
      content: "Here's a proof that needs to be reordered.",
      questionData: {
        orderItems: [
          { id: '1', content: 'First, we establish that x = 1.' },
          { id: '2', content: 'Then, we can prove that y = 2.' },
          { id: '3', content: 'Finally, we conclude z = 3.' },
        ],
        questionOrder: '3,1,2',
      },
    });
  });

  it('should handle empty content before parts', () => {
    const rawContent = `
part-1:
First step

part-2:
Second step

question-order:
2,1`;

    const result = convertProofReorderBlockNode({
      id: 'test-id',
      tag: 'proof-reorder',
      rawContent,
    });

    expect(result).toEqual({
      id: 'test-id',
      type: ProofReorderType,
      content: '',
      questionData: {
        orderItems: [
          { id: '1', content: 'First step' },
          { id: '2', content: 'Second step' },
        ],
        questionOrder: '2,1',
      },
    });
  });

  it('should handle parts with multiple lines', () => {
    const rawContent = `Main content here.

part-1:
This is step one.
It has multiple lines.
And some math: $x^2$.

part-2:
This is step two.
Also with multiple lines.

question-order:
2,1`;

    const result = convertProofReorderBlockNode({
      id: 'test-id',
      tag: 'proof-reorder',
      rawContent,
    });

    expect(result).toEqual({
      id: 'test-id',
      type: ProofReorderType,
      content: 'Main content here.',
      questionData: {
        orderItems: [
          { 
            id: '1', 
            content: 'This is step one.\nIt has multiple lines.\nAnd some math: $x^2$.' 
          },
          { 
            id: '2', 
            content: 'This is step two.\nAlso with multiple lines.' 
          },
        ],
        questionOrder: '2,1',
      },
    });
  });

  it('should handle LaTeX content', () => {
    const rawContent = `Prove that $\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$

part-1:
Let $S_n = \\sum_{i=1}^n i$

part-2:
Then $S_n = \\frac{n(n+1)}{2}$

question-order:
1,2`;

    const result = convertProofReorderBlockNode({
      id: 'test-id',
      tag: 'proof-reorder',
      rawContent,
    });

    expect(result).toEqual({
      id: 'test-id',
      type: ProofReorderType,
      content: 'Prove that $\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$',
      questionData: {
        orderItems: [
          { id: '1', content: 'Let $S_n = \\sum_{i=1}^n i$' },
          { id: '2', content: 'Then $S_n = \\frac{n(n+1)}{2}$' },
        ],
        questionOrder: '1,2',
      },
    });
  });
});

describe('convertProofReorderMarkdown', () => {
  it('should convert a valid markdown proof reorder block', () => {
    const markdown = `Here's a proof that needs to be reordered.

#### Part 1
First, we establish that x = 1.

#### Part 2
Then, we can prove that y = 2.

#### Part 3
Finally, we conclude z = 3.

#### Question Order
3,1,2`;

    const result = convertProofReorderMarkdown({
      id: 'test-id',
      tag: 'proof-reorder',
      rawTokens: marked.lexer(markdown),
    });

    expect(result).toEqual({
      id: 'test-id',
      type: ProofReorderType,
      content: "Here's a proof that needs to be reordered.",
      questionData: {
        orderItems: [
          { id: '1', content: 'First, we establish that x = 1.' },
          { id: '2', content: 'Then, we can prove that y = 2.' },
          { id: '3', content: 'Finally, we conclude z = 3.' },
        ],
        questionOrder: '3,1,2',
      },
    });
  });

  it('should handle empty content before parts in markdown', () => {
    const markdown = `#### Part 1
First step

#### Part 2
Second step

#### Question Order
2,1`;

      const result = convertProofReorderMarkdown({
      id: 'test-id',
      tag: 'proof-reorder',
      rawTokens: marked.lexer(markdown),
    });

    expect(result).toEqual({
      id: 'test-id',
      type: ProofReorderType,
      content: '',
      questionData: {
        orderItems: [
          { id: '1', content: 'First step' },
          { id: '2', content: 'Second step' },
        ],
        questionOrder: '2,1',
      },
    });
  });

  it('should handle parts with multiple lines in markdown', () => {
    const markdown = `Main content here.

#### Part 1
This is step one.
It has multiple lines.
And some math: $x^2$.

#### Part 2
This is step two.
Also with multiple lines.

#### Question Order
2,1`;

    const result = convertProofReorderMarkdown({
      id: 'test-id',
      tag: 'proof-reorder',
      rawTokens: marked.lexer(markdown),
    });

    expect(result).toEqual({
      id: 'test-id',
      type: ProofReorderType,
      content: 'Main content here.',
      questionData: {
        orderItems: [
          { 
            id: '1', 
            content: 'This is step one.\nIt has multiple lines.\nAnd some math: $x^2$.' 
          },
          { 
            id: '2', 
            content: 'This is step two.\nAlso with multiple lines.' 
          },
        ],
        questionOrder: '2,1',
      },
    });
  });

  it('should handle LaTeX content in markdown', () => {
    const markdown = `Prove that $\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$

#### Part 1
Let $S_n = \\sum_{i=1}^n i$

#### Part 2
Then $S_n = \\frac{n(n+1)}{2}$

#### Question Order
1,2`;

    const result = convertProofReorderMarkdown({
      id: 'test-id',
      tag: 'proof-reorder',
      rawTokens: marked.lexer(markdown),
    });

    expect(result).toEqual({
      id: 'test-id',
      type: ProofReorderType,
      content: 'Prove that $\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$',
      questionData: {
        orderItems: [
          { id: '1', content: 'Let $S_n = \\sum_{i=1}^n i$' },
          { id: '2', content: 'Then $S_n = \\frac{n(n+1)}{2}$' },
        ],
        questionOrder: '1,2',
      },
    });
  });

  it('should convert markdown to proof reorder data', () => {
    const markdown = `This is the proof content.
It can have multiple lines.

#### Part 1
First part of the proof

#### Part 2
Second part of the proof

#### Part 3
Third part of the proof

#### Question Order
3,1,2`;

    const tokens = marked.lexer(markdown);
    const result = convertProofReorderMarkdown({
      id: 'test-id',
      rawTokens: tokens,
      tag: 'proof_reorder'
    });

    expect(result).toEqual({
      id: 'test-id',
      type: ProofReorderType,
      content: 'This is the proof content.\nIt can have multiple lines.',
      questionData: {
        orderItems: [
          { id: '1', content: 'First part of the proof' },
          { id: '2', content: 'Second part of the proof' },
          { id: '3', content: 'Third part of the proof' }
        ],
        questionOrder: '3,1,2'
      }
    });
  });

  it('should throw error when question order is missing', () => {
    const markdown = `This is the proof content.

#### Part 1
First part of the proof

#### Part 2
Second part of the proof`;

    const tokens = marked.lexer(markdown);
    expect(() => convertProofReorderMarkdown({
      id: 'test-id',
      rawTokens: tokens,
      tag: 'proof_reorder'
    })).toThrow('question order is required');
  });

  it('should throw error when no parts are provided', () => {
    const markdown = `This is the proof content.

#### Question Order
3,1,2`;

    const tokens = marked.lexer(markdown);
    expect(() => convertProofReorderMarkdown({
      id: 'test-id',
      rawTokens: tokens,
      tag: 'proof_reorder'
    })).toThrow('parts are required');
  });

  it('should handle content before any heading', () => {
    const markdown = `Some content before any heading.
More content here.

#### Part 1
First part of the proof

#### Part 2
Second part of the proof

#### Question Order
2,1`;

    const tokens = marked.lexer(markdown);
    const result = convertProofReorderMarkdown({
      id: 'test-id',
      rawTokens: tokens,
      tag: 'proof_reorder'
    });

    expect(result.content).toBe('Some content before any heading.\nMore content here.');
  });

  it('should handle parts with LaTeX content', () => {
    const markdown = `Prove that $x^2 + y^2 = z^2$.

#### Part 1
Let $x = 3$ and $y = 4$

#### Part 2
Then $x^2 + y^2 = 9 + 16 = 25$

#### Part 3
Therefore $z = 5$ satisfies the equation

#### Question Order
1,2,3`;

    const tokens = marked.lexer(markdown);
    const result = convertProofReorderMarkdown({
      id: 'test-id',
      rawTokens: tokens,
      tag: 'proof_reorder'
    });

    expect(result.questionData.orderItems).toEqual([
      { id: '1', content: 'Let $x = 3$ and $y = 4$' },
      { id: '2', content: 'Then $x^2 + y^2 = 9 + 16 = 25$' },
      { id: '3', content: 'Therefore $z = 5$ satisfies the equation' }
    ]);
  });
}); 
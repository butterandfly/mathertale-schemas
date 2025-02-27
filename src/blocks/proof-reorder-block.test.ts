import { convertProofReorderBlockNode, ProofReorderType } from './proof-reorder-block';
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
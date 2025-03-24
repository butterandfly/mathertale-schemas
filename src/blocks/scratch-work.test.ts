import { marked } from 'marked';
import { convertScratchWorkBlockNode, convertScratchWorkMarkdown, ScratchWorkType } from './scratch-work-block';
import { expect, describe, it } from "vitest";


describe('convertScratchWorkBlockNode', () => {
  it('should convert a valid scratch work block', () => {
    const rawContent = `Let's do some scratch work.`;

    const result = convertScratchWorkBlockNode({
      id: 'test-id',
      tag: 'scratch-work',
      rawContent,
    });

    expect(result).toEqual({
      id: 'test-id',
      type: ScratchWorkType,
      content: "Let's do some scratch work.",
      updatedAt: expect.any(Date),
    });
  });
});

describe('convertScratchWorkMarkdown', () => {
  it('should convert a valid scratch work markdown', () => {
    const markdown = `Let's do some scratch work.`;

    const result = convertScratchWorkMarkdown({
      id: 'test-id',
      tag: 'scratch-work',
      rawTokens: marked.lexer(markdown),
    });

    expect(result).toEqual({
      id: 'test-id',
      type: ScratchWorkType,
      content: "Let's do some scratch work.",
      updatedAt: expect.any(Date),
    });
  });
});

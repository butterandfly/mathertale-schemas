import { RawData } from '../convert-helper';
import { extractProperties, MarkdownBlock } from '../convert-markdown-helper';
import { BlockSchema } from '../schemas';

export const ScratchWorkType = 'SCRATCH_WORK' as const;

export class ScratchWorkBlock implements BlockSchema {
  id: string;
  content: string;
  type: typeof ScratchWorkType;
  updatedAt: Date;

  constructor(id: string, content: string) {
    this.id = id;
    this.content = content;
    this.type = ScratchWorkType;
    this.updatedAt = new Date();
  }

  getText(): string {
    return this.content;
  }

  static fromNode(rawData: RawData): ScratchWorkBlock {
    return new ScratchWorkBlock(
      rawData.id,
      rawData.rawContent
    );
  }

  static fromMarkdown(markdown: MarkdownBlock): ScratchWorkBlock {
    const { content } = extractProperties(markdown.rawTokens);
    return new ScratchWorkBlock(
      markdown.id,
      content
    );
  }
}

export function convertScratchWorkBlockNode(rawData: RawData): ScratchWorkBlock {
  return ScratchWorkBlock.fromNode(rawData);
}

/**
 * Markdown format for scratch work block
 * 
 * {content}
 * 
 */
export function convertScratchWorkMarkdown(markdown: MarkdownBlock): ScratchWorkBlock {
  return ScratchWorkBlock.fromMarkdown(markdown);
}
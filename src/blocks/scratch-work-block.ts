import { RawData } from '../convert-helper';
import { extractProperties, MarkdownBlockRaw } from '../convert-markdown-helper';
import { BlockSchema } from '../schemas';

export type ScratchWorkData = Omit<BlockSchema, 'name' | 'questionData'>;
export const ScratchWorkType = 'SCRATCH_WORK' as const;

export function convertScratchWorkBlockNode(rawData: RawData): ScratchWorkData {
  return {
    id: rawData.id,
    content: rawData.rawContent,
    type: ScratchWorkType,
    updatedAt: new Date()
  };
} 

/**
 * Markdown format for scratch work block
 * 
 * {content}
 * 
 */
export function convertScratchWorkMarkdown(markdown: MarkdownBlockRaw): ScratchWorkData {
  const { content } = extractProperties(markdown.rawTokens);

  return {
    id: markdown.id,
    content,
    type: ScratchWorkType,
    updatedAt: new Date()
  };
}
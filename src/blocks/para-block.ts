import { RawData, MarkdownBlockRaw } from '../convert-helper';
import { BlockSchema } from '../schemas';
import { extractProperties } from '../convert-quest-markdown';

export type ParaData = Omit<BlockSchema, 'name' | 'questionData'>;
export const ParaType = 'PARA' as const;

export function convertParaBlockNode(rawData: RawData): ParaData {
  return {
    id: rawData.id,
    content: rawData.rawContent,
    type: ParaType,
    updatedAt: new Date()
  };
}

export function convertParaMarkdown(block: MarkdownBlockRaw): ParaData {
  // 直接传递rawTokens给extractProperties
  const { content, properties } = extractProperties(block.rawTokens);
  
  return {
    id: block.id,
    content: properties.content || content || '',
    type: ParaType,
    updatedAt: new Date()
  };
} 
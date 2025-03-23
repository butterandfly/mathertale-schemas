import { RawData } from '../convert-helper';
import { extractProperties, MarkdownBlockRaw } from '../convert-markdown-helper';
import { BlockSchema } from '../schemas';

export const DefinitionType = 'DEFINITION' as const;
export const FactType = 'FACT' as const;
export const TheoremType = 'THEOREM' as const;
export const PropositionType = 'PROPOSITION' as const;
export const RemarkType = 'REMARK' as const;
export const LemmaType = 'LEMMA' as const;

export type NotedData = Omit<BlockSchema, 'questionData'>;

function convertNotedBlockNode(rawData: RawData, type: string): NotedData {
  return {
    id: rawData.id,
    type: type,
    name: rawData.name || '',
    content: rawData.rawContent,
    updatedAt: new Date()
  }
}

export const convertDefinitionBlockNode = (rawData: RawData) => convertNotedBlockNode(rawData, DefinitionType);
export const convertFactBlockNode = (rawData: RawData) => convertNotedBlockNode(rawData, FactType);
export const convertTheoremBlockNode = (rawData: RawData) => convertNotedBlockNode(rawData, TheoremType);
export const convertPropositionBlockNode = (rawData: RawData) => convertNotedBlockNode(rawData, PropositionType);
export const convertRemarkBlockNode = (rawData: RawData) => convertNotedBlockNode(rawData, RemarkType);
export const convertLemmaBlockNode = (rawData: RawData) => convertNotedBlockNode(rawData, LemmaType);

export function convertNotedMarkdown(block: MarkdownBlockRaw, type: string): NotedData {
  // 直接传递rawTokens给extractProperties
  const { content, properties } = extractProperties(block.rawTokens);
  
  return {
    id: block.id,
    content: properties.content || content || '',
    type: type,
    updatedAt: new Date()
  };
} 

export const convertDefinitionMarkdown = (block: MarkdownBlockRaw) => convertNotedMarkdown(block, DefinitionType);
export const convertFactMarkdown = (block: MarkdownBlockRaw) => convertNotedMarkdown(block, FactType);
export const convertTheoremMarkdown = (block: MarkdownBlockRaw) => convertNotedMarkdown(block, TheoremType);
export const convertPropositionMarkdown = (block: MarkdownBlockRaw) => convertNotedMarkdown(block, PropositionType);
export const convertRemarkMarkdown = (block: MarkdownBlockRaw) => convertNotedMarkdown(block, RemarkType);
export const convertLemmaMarkdown = (block: MarkdownBlockRaw) => convertNotedMarkdown(block, LemmaType);


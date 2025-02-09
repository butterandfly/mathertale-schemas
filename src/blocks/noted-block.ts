import { RawData } from '../convert-helper';
import { BlockSchema } from '../schemas';

export const DefinitionType = 'DEFINITION' as const;
export const FactType = 'FACT' as const;
export const TheoremType = 'THEOREM' as const;
export const PropositionType = 'PROPOSITION' as const;
export const RemarkType = 'REMARK' as const;

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


import { RawData } from '../convert-helper';
import { BlockSchema } from '../schemas';

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
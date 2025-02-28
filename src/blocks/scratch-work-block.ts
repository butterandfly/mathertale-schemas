import { RawData } from '../convert-helper';
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
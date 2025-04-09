export interface BlockSchema {
    id: string;
    content: string;
    type: string;
    name?: string;
    questionData?: any;
    updatedAt?: Date;
}

export interface SectionSchema {
    name: string;
    blocks: BlockSchema[];
}

export enum Category {
    FOUNDATIONAL = 'Foundational Mathematics',
    ANALYSIS = 'Analysis',
    ALGEBRA = 'Algebra',
    PROBABILITY = 'Probability and Statistics'
}

export interface BaseQuestSchema {
  // 基础信息
  id: string;
  name: string;
  desc: string;
  category?: Category;
  updatedAt: Date;
  
  // 任务内容
  blockCount: number;
  sections: SectionSchema[];
}

export interface QuestSchema extends BaseQuestSchema {
  // 依赖关系
  dependentQuests: string[];
  childQuests: string[];
}

export type QuestShortSchema = Omit<QuestSchema, 'sections'>;

export type DevStatus = 
  | 'in_development'
  | 'coming_soon'
  | 'available'; 

export interface JourneySchema {
  id: string;
  name: string;
  category: Category;
  desc: string;
  coverUrl?: string;
  tags?: string[];

  questCount: number;
  devStatus: DevStatus;

  updatedAt: Date;
  createdAt: Date;

  questShortMap: Record<string, QuestShortSchema>;
}

export type JourneyShortSchema = Omit<JourneySchema, 'questShortMap'>;

export interface SoloQuestSchema extends BaseQuestSchema {
  prerequisites: string;
  tags: string[];
}

export type SoloQuestShortSchema = Omit<SoloQuestSchema, 'sections'>;
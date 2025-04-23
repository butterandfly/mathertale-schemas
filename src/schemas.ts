export interface BlockSchema {
    id: string;
    content: string;
    type: string;
    name?: string;
    questionData?: any;
    updatedAt?: Date;
    getText(): string;
}

export interface SectionSchema {
    name: string;
    blocks: BlockSchema[];
}

export const Category = {
    FOUNDATIONAL: 'Foundational Mathematics',
    ANALYSIS: 'Analysis',
    ALGEBRA: 'Algebra',
    PROBABILITY: 'Probability and Statistics'
} as const;

// 创建一个类型，包含所有可能的值
export type Category = typeof Category[keyof typeof Category];

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

/**
 * 生成Quest的文字表示
 * @param quest Quest对象
 * @returns 格式化的文本
 */
export function getQuestText(quest: BaseQuestSchema): string {
  let text = `## ${quest.name}\n\n`;
  
  for (const section of quest.sections) {
    text += `### ${section.name}\n\n`;
    
    for (const block of section.blocks) {
      text += `${block.getText()}\n\n`;
    }
  }
  
  return text.trim();
}
import { RawData } from '../convert-helper';
import { extractProperties, MarkdownBlock } from '../convert-markdown-helper';
import { BlockSchema } from '../schemas';

export const DefinitionType = 'DEFINITION' as const;
export const FactType = 'FACT' as const;
export const TheoremType = 'THEOREM' as const;
export const PropositionType = 'PROPOSITION' as const;
export const RemarkType = 'REMARK' as const;
export const LemmaType = 'LEMMA' as const;

export class NotedBlock implements BlockSchema {
    constructor(
        public id: string,
        public content: string,
        public type: string,
        public name: string = '',
        public updatedAt: Date = new Date()
    ) {}

    getText(): string {
        return this.content;
    }

    static fromNode(rawData: RawData, type: string): NotedBlock {
        return new NotedBlock(
            rawData.id,
            rawData.rawContent,
            type,
            rawData.name || ''
        );
    }

    static fromMarkdown(block: MarkdownBlock, type: string): NotedBlock {
        const { content, properties } = extractProperties(block.rawTokens);
        return new NotedBlock(
            block.id,
            properties.content || content || '',
            type,
            block.name || ''
        );
    }
}

// 导出工厂函数以保持兼容性
export const convertDefinitionBlockNode = (rawData: RawData) => NotedBlock.fromNode(rawData, DefinitionType);
export const convertFactBlockNode = (rawData: RawData) => NotedBlock.fromNode(rawData, FactType);
export const convertTheoremBlockNode = (rawData: RawData) => NotedBlock.fromNode(rawData, TheoremType);
export const convertPropositionBlockNode = (rawData: RawData) => NotedBlock.fromNode(rawData, PropositionType);
export const convertRemarkBlockNode = (rawData: RawData) => NotedBlock.fromNode(rawData, RemarkType);
export const convertLemmaBlockNode = (rawData: RawData) => NotedBlock.fromNode(rawData, LemmaType);

export const convertDefinitionMarkdown = (block: MarkdownBlock) => NotedBlock.fromMarkdown(block, DefinitionType);
export const convertFactMarkdown = (block: MarkdownBlock) => NotedBlock.fromMarkdown(block, FactType);
export const convertTheoremMarkdown = (block: MarkdownBlock) => NotedBlock.fromMarkdown(block, TheoremType);
export const convertPropositionMarkdown = (block: MarkdownBlock) => NotedBlock.fromMarkdown(block, PropositionType);
export const convertRemarkMarkdown = (block: MarkdownBlock) => NotedBlock.fromMarkdown(block, RemarkType);
export const convertLemmaMarkdown = (block: MarkdownBlock) => NotedBlock.fromMarkdown(block, LemmaType);


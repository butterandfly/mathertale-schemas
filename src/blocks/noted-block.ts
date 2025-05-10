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
        const capitalizedType = this.type.charAt(0).toUpperCase() + this.type.slice(1).toLowerCase();
        return `${capitalizedType}: ${this.name}\n${this.content}`;
    }

    static validate(block: NotedBlock): void {
        if (!block.content || block.content.trim() === '') {
            throw new Error(`Content cannot be empty for block ID: ${block.id} (Type: ${block.type})`);
        }
    }

    /**
     * 从Markdown块创建NotedBlock对象
     * @param block - 包含原始标记数据的Markdown块
     * @param type - 块的类型
     * @returns 新的NotedBlock对象
     * @throws 如果内容为空则抛出错误
     */
    static fromMarkdown(block: MarkdownBlock, type: string): NotedBlock {
        const { content, properties } = extractProperties(block.rawTokens);

        const newBlock = new NotedBlock(
            block.id,
            content,
            type,
            block.name || ''
        );
        NotedBlock.validate(newBlock);
        return newBlock;
    }
}

export const convertDefinitionMarkdown = (block: MarkdownBlock) => NotedBlock.fromMarkdown(block, DefinitionType);
export const convertFactMarkdown = (block: MarkdownBlock) => NotedBlock.fromMarkdown(block, FactType);
export const convertTheoremMarkdown = (block: MarkdownBlock) => NotedBlock.fromMarkdown(block, TheoremType);
export const convertPropositionMarkdown = (block: MarkdownBlock) => NotedBlock.fromMarkdown(block, PropositionType);
export const convertRemarkMarkdown = (block: MarkdownBlock) => NotedBlock.fromMarkdown(block, RemarkType);
export const convertLemmaMarkdown = (block: MarkdownBlock) => NotedBlock.fromMarkdown(block, LemmaType);


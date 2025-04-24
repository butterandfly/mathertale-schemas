import { RawData } from '../convert-helper';
import { BlockSchema } from '../schemas';
import { extractProperties, MarkdownBlock } from '../convert-markdown-helper';

export const ParaType = 'PARA' as const;

export class ParaBlock implements BlockSchema {
    readonly type = ParaType;

    constructor(
        public id: string,
        public content: string,
        public updatedAt: Date = new Date()
    ) {}

    getText(): string {
        return this.content;
    }

    // 从 RawData 创建实例
    static fromNode(rawData: RawData): BlockSchema {
        const block = new ParaBlock(
            rawData.id,
            rawData.rawContent
        );
        ParaBlock.validate(block); // Use ParaBlock.validate instead of this.validate
        return block;
    }

    static validate(block: ParaBlock): void {
        if (!block.content || block.content.trim() === '') {
            throw new Error(`Content cannot be empty for block ID: ${block.id}`);
        }
    }

    // 从 Markdown 创建实例
    // `content` can not be empty
    static fromMarkdown(block: MarkdownBlock): BlockSchema {
        const { content, properties } = extractProperties(block.rawTokens);

        const newBlock = new ParaBlock(
            block.id,
            properties.content || content || ''
        );
        ParaBlock.validate(newBlock); // Use ParaBlock.validate instead of this.validate
        return newBlock;
    }
}

// 保持原有的导出函数以保持兼容性
export const convertParaBlockNode = ParaBlock.fromNode;
export const convertParaMarkdown = ParaBlock.fromMarkdown; 
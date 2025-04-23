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
        return new ParaBlock(
            rawData.id,
            rawData.rawContent
        );
    }

    // 从 Markdown 创建实例
    // `content` can not be empty
    static fromMarkdown(block: MarkdownBlock): BlockSchema {
        const { content, properties } = extractProperties(block.rawTokens);

        if (!content && !properties.content) {
            throw new Error('content is required: \n' + block.rawTokens);
        }

        return new ParaBlock(
            block.id,
            properties.content || content || ''
        );
    }
}

// 保持原有的导出函数以保持兼容性
export const convertParaBlockNode = ParaBlock.fromNode;
export const convertParaMarkdown = ParaBlock.fromMarkdown; 
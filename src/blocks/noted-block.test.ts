import { describe, it, expect } from 'vitest';
import { marked } from 'marked';
import { 
    NotedBlock,
    DefinitionType, 
    FactType, 
    TheoremType, 
    PropositionType, 
    RemarkType, 
    LemmaType,
    convertDefinitionBlockNode,
    convertDefinitionMarkdown
} from './noted-block';
import { RawData } from '../convert-helper';
import { MarkdownBlockRaw } from '../convert-markdown-helper';

describe('NotedBlock', () => {
    describe('fromNode', () => {
        it('should convert raw data to noted block', () => {
            const rawData: RawData = {
                id: 'test-id',
                tag: 'definition',
                rawContent: 'Test content'
            };

            const result = NotedBlock.fromNode(rawData, DefinitionType);

            expect(result).toBeInstanceOf(NotedBlock);
            expect(result).toMatchObject({
                id: 'test-id',
                content: 'Test content',
                type: DefinitionType
            });
            expect(result.updatedAt).toBeInstanceOf(Date);
        });

        it('should handle raw data with name', () => {
            const rawData: RawData = {
                id: 'test-id',
                tag: 'definition',
                name: 'Test Name',
                rawContent: 'Test content'
            };

            const result = NotedBlock.fromNode(rawData, DefinitionType);

            expect(result).toMatchObject({
                id: 'test-id',
                content: 'Test content',
                type: DefinitionType,
                name: 'Test Name'
            });
        });
    });

    describe('fromMarkdown', () => {
        it('should convert markdown block to noted block', () => {
            const markdownContent = 'Test content';
            const tokens = marked.lexer(markdownContent);
            
            const markdownBlock: MarkdownBlockRaw = {
                tag: 'definition',
                id: 'test-id',
                rawTokens: tokens
            };

            const result = NotedBlock.fromMarkdown(markdownBlock, DefinitionType);

            expect(result).toBeInstanceOf(NotedBlock);
            expect(result).toMatchObject({
                id: 'test-id',
                content: 'Test content',
                type: DefinitionType
            });
        });

        it('should handle markdown block with name', () => {
            const markdownContent = '#### content\nTest content';
            const tokens = marked.lexer(markdownContent);
            
            const markdownBlock: MarkdownBlockRaw = {
                tag: 'definition',
                name: 'Test Name',
                id: 'test-id',
                rawTokens: tokens
            };

            const result = NotedBlock.fromMarkdown(markdownBlock, DefinitionType);

            expect(result).toMatchObject({
                id: 'test-id',
                content: 'Test content',
                type: DefinitionType,
                name: 'Test Name'
            });
        });

        it('should handle complex markdown content', () => {
            const markdown = `#### Content
Here's a complex content with:

1. Ordered list
2. **Bold text**
3. *Italic text*

\`\`\`javascript
console.log('Code block');
\`\`\`

And some math: $$E = mc^2$$`;

            const block: MarkdownBlockRaw = {
                tag: 'lemma',
                id: 'lemma-id',
                rawTokens: marked.lexer(markdown)
            };

            const result = NotedBlock.fromMarkdown(block, LemmaType);

            expect(result).toMatchObject({
                id: 'lemma-id',
                type: LemmaType,
                content: markdown.replace('#### Content\n', ''),
            });
        });
    });

    describe('getText', () => {
        it('should return the content', () => {
            const block = new NotedBlock('test-id', 'Test content', DefinitionType, 'Test Name');
            expect(block.getText()).toBe('Test content');
        });
    });

    describe('compatibility functions', () => {
        it('should work with convertDefinitionBlockNode', () => {
            const rawData: RawData = {
                id: 'test-id',
                tag: 'definition',
                rawContent: 'Test content'
            };

            const result = convertDefinitionBlockNode(rawData);

            expect(result).toBeInstanceOf(NotedBlock);
            expect(result).toMatchObject({
                id: 'test-id',
                content: 'Test content',
                type: DefinitionType
            });
        });

        it('should work with convertDefinitionMarkdown', () => {
            const markdownBlock: MarkdownBlockRaw = {
                tag: 'definition',
                id: 'test-id',
                rawTokens: marked.lexer('Test content')
            };

            const result = convertDefinitionMarkdown(markdownBlock);

            expect(result).toBeInstanceOf(NotedBlock);
            expect(result).toMatchObject({
                id: 'test-id',
                content: 'Test content',
                type: DefinitionType
            });
        });
    });
}); 
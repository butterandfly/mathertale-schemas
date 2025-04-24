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
import { MarkdownBlock } from '../convert-markdown-helper';

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

        it('should throw error if rawContent is empty', () => {
            const rawData: RawData = {
                id: 'empty-id',
                tag: 'definition',
                rawContent: ''
            };
            expect(() => NotedBlock.fromNode(rawData, DefinitionType)).toThrow('Content cannot be empty for block ID: empty-id (Type: DEFINITION)');
        });

        it('should throw error if rawContent is only whitespace', () => {
            const rawData: RawData = {
                id: 'whitespace-id',
                tag: 'theorem',
                rawContent: '   \n  '
            };
            expect(() => NotedBlock.fromNode(rawData, TheoremType)).toThrow('Content cannot be empty for block ID: whitespace-id (Type: THEOREM)');
        });
    });

    describe('fromMarkdown', () => {
        it('should convert markdown block to noted block', () => {
            const markdownContent = 'Test content';
            const tokens = marked.lexer(markdownContent);
            
            const markdownBlock: MarkdownBlock = {
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
            const markdownContent = 'Test content';
            const tokens = marked.lexer(markdownContent);
            
            const markdownBlock: MarkdownBlock = {
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
            const markdown = `Here's a complex content with:

1. Ordered list
2. **Bold text**
3. *Italic text*

\`\`\`javascript
console.log('Code block');
\`\`\`

And some math: $$E = mc^2$$`;

            const block: MarkdownBlock = {
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

        it('should throw error if markdown content is empty', () => {
            const markdownContent = ''; // Empty content
            const tokens = marked.lexer(markdownContent);
            const markdownBlock: MarkdownBlock = {
                tag: 'fact',
                id: 'empty-md-id',
                rawTokens: tokens,
            };
            expect(() => NotedBlock.fromMarkdown(markdownBlock, FactType)).toThrow('Content cannot be empty for block ID: empty-md-id (Type: FACT)');
        });

        it('should throw error if markdown content is only whitespace', () => {
            const markdownContent = '    '; // Whitespace content
            const tokens = marked.lexer(markdownContent);
            const markdownBlock: MarkdownBlock = {
                tag: 'remark',
                id: 'whitespace-md-id',
                rawTokens: tokens,
            };
            expect(() => NotedBlock.fromMarkdown(markdownBlock, RemarkType)).toThrow('Content cannot be empty for block ID: whitespace-md-id (Type: REMARK)');
        });
    });

    describe('getText', () => {
        it('should return formatted text with capitalized type', () => {
            const block = new NotedBlock('test-id', 'Test content', DefinitionType, 'Test Name');
            expect(block.getText()).toBe('Definition: Test Name\nTest content');
        });

        it('should handle lowercase type input', () => {
            const block = new NotedBlock('test-id', 'Test content', 'theorem', 'Test Name');
            expect(block.getText()).toBe('Theorem: Test Name\nTest content');
        });

        it('should handle uppercase type input', () => {
            const block = new NotedBlock('test-id', 'Test content', 'LEMMA', 'Test Name');
            expect(block.getText()).toBe('Lemma: Test Name\nTest content');
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
            const markdownBlock: MarkdownBlock = {
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
import { describe, it, expect } from 'vitest';
import { marked } from 'marked';
import { MarkdownBlockRaw } from './convert-markdown-helper';
import { BlockSchema, QuestSchema } from './schemas';
import { convertQuestMarkdown, registerBlockConverter } from './convert-quest-markdown';

describe('convertQuestMarkdown', () => {
  it('should convert markdown to quest schema', () => {
    const markdown = `# Quest: Test Quest
id: test-id
desc: This is a test quest.

## Section: Introduction

### para: Welcome
id: para-welcome

This is the welcome paragraph.

#### Content
Welcome to the quest!

## Section: Main Content

### Para: Explanation
id: para-explanation

This explains the concept.

#### Content
Here's the main explanation.

#### Hint
This is a hint.

### PARA: Conclusion
id: para-conclusion

This is the conclusion.

#### Content
That's all for this quest.
`;

    const result = convertQuestMarkdown(markdown);
    
    // 检查顶层属性
    expect(result.name).toBe('Test Quest');
    // 修复后，quest.id正确地保留了header中的id值
    expect(result.id).toBe('test-id');
    expect(result.desc).toBe('This is a test quest.');
    expect(result.blockCount).toBe(3);
    expect(result.dependentQuests).toEqual([]);
    expect(result.childQuests).toEqual([]);
    expect(result.updatedAt).toBeInstanceOf(Date);
    
    // 检查sections
    expect(result.sections.length).toBe(2);
    
    // 第一个section
    expect(result.sections[0].name).toBe('Introduction');
    expect(result.sections[0].blocks.length).toBe(1);
    expect(result.sections[0].blocks[0].id).toBe('para-welcome');
    expect(result.sections[0].blocks[0].type).toBe('PARA');
    
    // 第二个section
    expect(result.sections[1].name).toBe('Main Content');
    expect(result.sections[1].blocks.length).toBe(2);
    expect(result.sections[1].blocks[0].id).toBe('para-explanation');
    expect(result.sections[1].blocks[0].type).toBe('PARA');
    expect(result.sections[1].blocks[1].id).toBe('para-conclusion');
    expect(result.sections[1].blocks[1].type).toBe('PARA');
  });
  
  it('should throw error for unknown block type', () => {
    const markdown = `# Quest: Unknown Block Quest
id: unknown-block
desc: Testing unknown block type.

## Section: Test

### Unknown: Test Block
id: unknown-block

This is an unknown block type.

#### Content
Content of unknown block.
`;

    expect(() => convertQuestMarkdown(markdown)).toThrow('No converter registered for block type: unknown');
  });
  
  it('should handle empty sections', () => {
    const markdown = `# Quest: Empty Section Quest
id: empty-section
desc: Testing empty sections.

## Section: Empty Section

## Section: Content Section

### Para: Only Block
id: para-only

The only block in the quest.

#### Content
This is the only content.
`;

    const result = convertQuestMarkdown(markdown);
    
    expect(result.sections.length).toBe(2);
    expect(result.sections[0].name).toBe('Empty Section');
    expect(result.sections[0].blocks.length).toBe(0);
    expect(result.sections[1].name).toBe('Content Section');
    expect(result.sections[1].blocks.length).toBe(1);
    expect(result.blockCount).toBe(1);
  });
  
  it('should use custom block converter when registered', () => {
    // 注册一个自定义的转换函数
    registerBlockConverter('custom', (block: MarkdownBlockRaw): BlockSchema => {
      return {
        id: block.id || 'default-id',
        type: 'custom',
        name: block.name || 'Default Name',
        content: 'Custom content',
        questionData: {
          customField: 'Custom value'
        }
      };
    });
    
    const markdown = `# Quest: Custom Block Quest
id: custom-block-quest
desc: Testing custom block converter.

## Section: Custom

### Custom: My Block
id: custom-block

Custom block content.

#### Content
Custom content.
`;

    const result = convertQuestMarkdown(markdown);
    
    expect(result.sections[0].blocks[0].type).toBe('custom');
    expect(result.sections[0].blocks[0].id).toBe('custom-block');
    expect(result.sections[0].blocks[0].name).toBe('My Block');
    expect(result.sections[0].blocks[0].questionData).toEqual({ customField: 'Custom value' });
  });
}); 

describe('convertAllBlocks', () => {
  it('should convert all blocks', () => {
    const markdown = `# Quest: All Blocks Quest
id: all-blocks
desc: Testing all blocks.

## Section: All Blocks

### para: A Para Block
id: para-block

This is a para block.


### definition: Definition Block
id: definition-block

This is a definition block.

### fact: Fact Block
id: fact-block

This is a fact block.

### theorem: Theorem Block
id: theorem-block

This is a theorem block.

### proposition: Proposition Block
id: proposition-block

This is a proposition block.

### remark: Remark Block
id: remark-block

This is a remark block.

### lemma: Lemma Block
id: lemma-block

This is a lemma block.
`

    const result = convertQuestMarkdown(markdown);

    const paraBlock = result.sections[0].blocks[0];
    expect(paraBlock.type).toBe('PARA');
    expect(paraBlock.content).toBe('This is a para block.');

    const definitionBlock = result.sections[0].blocks[1];
    expect(definitionBlock.type).toBe('DEFINITION');
    expect(definitionBlock.content).toBe('This is a definition block.');

    const factBlock = result.sections[0].blocks[2];
    expect(factBlock.type).toBe('FACT');
    expect(factBlock.content).toBe('This is a fact block.');

    const theoremBlock = result.sections[0].blocks[3];
    expect(theoremBlock.type).toBe('THEOREM');
    expect(theoremBlock.content).toBe('This is a theorem block.');

    const propositionBlock = result.sections[0].blocks[4];
    expect(propositionBlock.type).toBe('PROPOSITION');
    expect(propositionBlock.content).toBe('This is a proposition block.');

    const remarkBlock = result.sections[0].blocks[5];
    expect(remarkBlock.type).toBe('REMARK');
    expect(remarkBlock.content).toBe('This is a remark block.');

    const lemmaBlock = result.sections[0].blocks[6];
    expect(lemmaBlock.type).toBe('LEMMA');
    expect(lemmaBlock.content).toBe('This is a lemma block.');
    
    
  });
});


import { DefinitionType, RemarkType, TheoremType } from './blocks/noted-block';
import { ParaType } from './blocks/para-block';
import { 
  convertBlockNode, 
} from './extract-content';
import { expect, describe, it } from 'vitest';



describe('convertBlockNode', () => {

  it('should convert a block node with #definition', () => {
    const fakeUUID = '00000000-0000-0000-0000-000000000000';
    const blockNode = { id: '1', type: 'text', text: `#definition Definition 1 ^${fakeUUID}\nThis is a definition`};
    const block = convertBlockNode(blockNode);
    expect(block.type).toBe(DefinitionType);
  });

  it('should convert a block node with #theorem', () => {
    const fakeUUID = '00000000-0000-0000-0000-000000000000';
    const blockNode = { id: '1', type: 'text', text: '#theorem Theorem 1 ^00000000-0000-0000-0000-000000000000\nThis is a theorem'};
    const block = convertBlockNode(blockNode);
    expect(block.type).toBe(TheoremType);
  });

  it('should convert a block node with #para', () => {
    const fakeUUID = '00000000-0000-0000-0000-000000000000';
    const blockNode = { id: '1', type: 'text', text: '#para ^00000000-0000-0000-0000-000000000000\nThis is a markdown content'};
    const block = convertBlockNode(blockNode);
    expect(block.type).toBe(ParaType);
  });

  it('should throw error if id is missing', () => {
    const blockNode = { id: '1', type: 'text', text: '#definition Definition 1\nThis is a definition'};
    expect(() => convertBlockNode(blockNode)).toThrow('Block id is required: #definition Definition 1');
  });

  it('should convert a block node with #remark', () => {
    const fakeUUID = '00000000-0000-0000-0000-000000000000';
    const blockNode = { 
      id: '1', 
      type: 'text', 
      text: `#remark Important Note ^${fakeUUID}\nThis is a key point to remember.`
    };
    
    const block = convertBlockNode(blockNode);
    expect(block.type).toBe(RemarkType);
  });
});
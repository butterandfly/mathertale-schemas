import { findQuestNode, convertQuestNode, convertQuestCanvas } from './extract-content';
import { expect, describe, it } from "vitest";

describe('findQuestNode', () => {
    it('should find the quest node in the canvas data', () => {
      const canvasData = {
        nodes: [
          { id: '1', type: 'text', text: 'Some text' },
          { id: '2', type: 'text', text: '#quest This is a quest' },
          { id: '3', type: 'text', text: 'Another text' }
        ],
        edges: []
      };
  
      const questNode = findQuestNode(canvasData);
      expect(questNode).toEqual({ id: '2', type: 'text', text: '#quest This is a quest' });
    });
  
    it('should return undefined if no quest node is found', () => {
      const canvasData = {
        nodes: [
          { id: '1', type: 'text', text: 'Some text' },
          { id: '2', type: 'text', text: 'Another text' }
        ],
        edges: []
      };
  
      const questNode = findQuestNode(canvasData);
      expect(questNode).toBeUndefined();
    });
  
    it('should not find the node that starts with "#question"', () => {
      const canvasData = {
        nodes: [
          { id: '1', type: 'text', text: 'Some text' },
          { id: '2', type: 'text', text: '#question This is a question' },
          { id: '3', type: 'text', text: 'Another text' }
        ],
        edges: []
      };
  
      const questNode = findQuestNode(canvasData);
      expect(questNode).toBeUndefined();
    });
  });

  describe('convertQuestCanvas', () => {
    it('should throw an error if quest id is missing', () => {
        const questNode = { id: '1', type: 'text', text: '#quest Quest Name\nThis is a quest' };
        const canvasData = { nodes: [questNode], edges: [] };
        expect(() => convertQuestCanvas(canvasData)).toThrow('Quest id is required: #quest Quest Name');
    });

    it('should throw an error if tag is not quest', () => {
        const questNode = { id: '1', type: 'text', text: '#section Section Name ^00000000-0000-0000-0000-000000000000\nThis is a section' };
        const canvasData = { nodes: [questNode], edges: [] };
        expect(() => convertQuestCanvas(canvasData)).toThrow('Quest node not found in canvas data');
    });

    it('should convert a quest node with no sections', () => {
        const fakeUUID = '00000000-0000-0000-0000-000000000000';
        const questNode = { id: '1', type: 'text', text: `#quest Quest Name ^${fakeUUID}\nThis is a quest` };
        const canvasData = { nodes: [questNode], edges: [] };
        const quest = convertQuestCanvas(canvasData);
        expect(quest.name).toBe('Quest Name');
        expect(quest.id).toBe(fakeUUID);
        expect(quest.desc).toBe('This is a quest');
        expect(quest.sections).toEqual([]);
        expect(quest.updatedAt).toBeInstanceOf(Date);

    });

    it('should convert a quest node with one section', () => {
        const questUUID = '00000000-0000-0000-0000-000000000000';
        const sectionUUID = '11111111-1111-1111-1111-111111111111';
        const questNode = { id: '1', type: 'text', text: `#quest Quest Name ^${questUUID}\nThis is a quest` };
        const sectionNode = { id: '2', type: 'text', text: `#section Section Name ^${sectionUUID}\nThis is a section` };
        const canvasData = {
            nodes: [questNode, sectionNode],
            edges: [{ fromNode: '1', fromSide: 'right', toNode: '2', toSide: 'left' }]
        };
        const quest = convertQuestCanvas(canvasData);
        expect(quest.name).toBe('Quest Name');
        expect(quest.id).toBe(questUUID);
        expect(quest.desc).toBe('This is a quest');
        expect(quest.sections.length).toBe(1);
        expect(quest.blockCount).toBe(0);
        expect(quest.sections[0].name).toBe('Section Name');
        expect(quest.sections[0].blocks.length).toBe(0);
        expect(quest.updatedAt).toBeInstanceOf(Date);
    });
});
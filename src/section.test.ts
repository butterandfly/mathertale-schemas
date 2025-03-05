import { convertSectionNode } from './extract-content';
import { expect, describe, it } from "vitest";

describe('convertSectionNode', () => {
    it('should convert a section node with no other nodes', () => {
        const sectionNode = { id: '1', type: 'text', text: `#section Section Name\nThis is a section` };
        const canvasData = { nodes: [sectionNode], edges: [] };
        const section = convertSectionNode(sectionNode, canvasData);
        expect(section).toEqual({
            name: 'Section Name',
            blocks: [],
        });
    });

    it('should throw an error if block id is missing', () => {
        const sectionNode = { id: '1', type: 'text', text: `#section Section Name\nThis is a section` };
        const blockNode = { id: '2', type: 'text', text: '#definition Definition 1\nThis is a definition' };
        const canvasData = {
            nodes: [sectionNode, blockNode],
            edges: [{ fromNode: '1', fromSide: 'bottom', toNode: '2', toSide: 'top' }]
        };
        expect(() => convertSectionNode(sectionNode, canvasData)).toThrow('Block id is required: #definition Definition 1');
    });

    it('should convert a section node with one block', () => {
        const blockUUID = '11111111-1111-1111-1111-111111111111';
        const sectionNode = { id: '1', type: 'text', text: `#section Section Name\nThis is a section` };
        const blockNode = { id: '2', type: 'text', text: `#definition Definition 1 ^${blockUUID}\nThis is a definition` };
        const canvasData = {
            nodes: [sectionNode, blockNode],
            edges: [{ fromNode: '1', fromSide: 'bottom', toNode: '2', toSide: 'top' }]
        };
        const section = convertSectionNode(sectionNode, canvasData);

        expect(section.name).toBe('Section Name');
        expect(section.blocks.length).toBe(1);
    });
});
import { describe, it, expect } from 'vitest'
import { 
  isValidNode,
} from './node-validator';

describe('isValidNode', () => {
  it('should validate a plain node', () => {
    const node = { id: '1', type: 'text', text: 'Just plain text' };
    const result = isValidNode(node);
    expect(result).toEqual({
      isValid: true,
      nodeType: 'plain'
    });
  });

  it('should validate a structural node', () => {
    const node = { 
      id: '1', 
      type: 'text', 
      text: '#quest Quest Name ^123e4567-e89b-12d3-a456-426614174000' 
    };
    const result = isValidNode(node);
    expect(result).toEqual({
      isValid: true,
      nodeType: 'structural'
    });
  });

  it('should validate a block node', () => {
    const node = { 
      id: '1', 
      type: 'text', 
      text: '#definition Definition Name ^123e4567-e89b-12d3-a456-426614174000' 
    };
    const result = isValidNode(node);
    expect(result).toEqual({
      isValid: true,
      nodeType: 'block'
    });
  });

  it('should invalidate node with invalid tag', () => {
    const node = { 
      id: '1', 
      type: 'text', 
      text: '#invalid Invalid Name ^123e4567-e89b-12d3-a456-426614174000' 
    };
    const result = isValidNode(node);
    expect(result).toEqual({
      isValid: false,
      nodeType: 'plain',
      error: {
        type: 'INVALID_TAG',
        message: expect.stringContaining('Invalid tag: invalid')
      }
    });
  });

  it('should invalidate structural node without name', () => {
    const node = { 
      id: '1', 
      type: 'text', 
      text: '#quest ^123e4567-e89b-12d3-a456-426614174000' 
    };
    const result = isValidNode(node);
    expect(result).toEqual({
      isValid: false,
      nodeType: 'structural',
      error: {
        type: 'MISSING_NAME',
        message: 'Missing name for quest node'
      }
    });
  });

  it('should validate a para block node', () => {
    const node = { 
      id: '1', 
      type: 'text', 
      text: '#para Some paragraph ^123e4567-e89b-12d3-a456-426614174000' 
    };
    const result = isValidNode(node);
    expect(result).toEqual({
      isValid: true,
      nodeType: 'block'
    });
  });

  it('should validate a para block node without name', () => {
    const node = { 
      id: '1', 
      type: 'text', 
      text: '#para ^123e4567-e89b-12d3-a456-426614174000' 
    };
    const result = isValidNode(node);
    expect(result).toEqual({
      isValid: true,
      nodeType: 'block'
    });
  });
}); 
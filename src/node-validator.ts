import { getMetadata } from "./convert-helper";
import { CanvasNode } from "./convert-helper";
import { isValidUUID } from "./convert-helper";


export const MARKED_NODE_TAGS = {
  structural: [
    'journey',
    'quest',
    'section'
  ],
  block: [
    'definition',
    'theorem',
    'fact',
    'single_choice',
    'para'
  ]
} as const;



export type MarkedNodeType = 'structural' | 'block';
export type NodeType = MarkedNodeType | 'plain';

export type StructuralNodeTag = typeof MARKED_NODE_TAGS.structural[number];
export type BlockNodeTag = typeof MARKED_NODE_TAGS.block[number];
export type MarkedNodeTag = StructuralNodeTag | BlockNodeTag;

export interface NodeValidationResult {
  isValid: boolean;
  nodeType: NodeType;
  error?: {
    type: 'INVALID_TAG' | 'MISSING_UUID' | 'INVALID_UUID' | 'MISSING_NAME';
    message: string;
  };
}



export function isValidNode(node: CanvasNode): NodeValidationResult {
  if (!node.text || !node.text.trim().startsWith('#')) {
    return { 
      isValid: true,
      nodeType: 'plain'
    };
  }

  const firstLine = node.text.trim().split('\n')[0];
  const metadata = getMetadata(firstLine);
  
  // 确定节点类型
  const nodeType = MARKED_NODE_TAGS.structural.includes(metadata.tag as StructuralNodeTag) 
    ? 'structural' 
    : MARKED_NODE_TAGS.block.includes(metadata.tag as BlockNodeTag) 
      ? 'block' 
      : undefined;

  // 验证tag是否合法
  if (!nodeType) {
    return {
      isValid: false,
      nodeType: 'plain',
      error: {
        type: 'INVALID_TAG',
        message: `Invalid tag: ${metadata.tag}. Expected one of: ${[...MARKED_NODE_TAGS.structural, ...MARKED_NODE_TAGS.block].join(', ')}`
      }
    };
  }

  // 验证是否有name（结构节点必须有name）
  if (nodeType === 'structural' && !metadata.name) {
    return {
      isValid: false,
      nodeType,
      error: {
        type: 'MISSING_NAME',
        message: `Missing name for ${metadata.tag} node`
      }
    };
  }

  // 验证是否有UUID
  if (!metadata.id) {
    return {
      isValid: false,
      nodeType,
      error: {
        type: 'MISSING_UUID',
        message: 'Missing UUID: Node must end with ^uuid'
      }
    };
  }

  // 验证UUID格式
  if (!isValidUUID(metadata.id)) {
    return {
      isValid: false,
      nodeType,
      error: {
        type: 'INVALID_UUID',
        message: `Invalid UUID format: ${metadata.id}`
      }
    };
  }

  return { 
    isValid: true,
    nodeType
  };
} 
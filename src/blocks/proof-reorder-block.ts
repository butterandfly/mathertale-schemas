import { RawData } from "../convert-helper";
import { BlockSchema } from "../schemas";
import { convertRawContent } from "../convert-helper";
import { extractProperties, MarkdownBlockRaw } from "../convert-markdown-helper";
import { marked } from 'marked';

export const ProofReorderType = 'PROOF_REORDER' as const;

type OrderItemId = string;

export interface OrderItem {
  id: OrderItemId;
  content: string;
}

export interface ProofReorderQuestionData {
  orderItems: OrderItem[];
  questionOrder: string;
}

export interface ProofReorderData extends BlockSchema {
  id: string;
  type: typeof ProofReorderType;
  content: string;
  questionData: ProofReorderQuestionData;
}

/**
 * Block node template:
 * 
 * {content}
 * 
 * part-1:
 * {part-1 content}
 * 
 * part-2:
 * {part-2 content}
 * 
 * part-3:
 * {part-3 content}
 * 
 * question-order:
 * 3,1,2
 * 
 */

export function convertProofReorderBlockNode(rawData: RawData): ProofReorderData {
  const keywords = [
    { pattern: 'question-order:', name: 'questionOrder' },
    { pattern: /part-\d+:/, name: 'parts' },
  ]
  const converted = convertRawContent(rawData.rawContent, keywords);
  const questionOrder = converted.questionOrder as string;
  const parts = converted.parts as string[];
  const blockContent = converted.content as string;

  const questionOrderArray = questionOrder.trim().split(',');
  const cleanOrderArray = questionOrderArray.map(s => s.trim());
  
  return {
    id: rawData.id,
    type: ProofReorderType,
    content: blockContent,
    questionData: {
      orderItems: parts.map((part, index) => ({
        id: `${index + 1}`,
        content: part,
      })),
      questionOrder: cleanOrderArray.join(','),
    },
  }
}

/**
 * Markdown format for proof reorder block
 * 
 * {content}
 * 
 * #### Part 1
 * {part-1 content}
 * 
 * #### Part 2
 * {part-2 content}
 * 
 * #### Part 3
 * {part-3 content}
 * 
 * #### Question Order
 * 3,1,2
 * 
 */

export function convertProofReorderMarkdown(markdown: MarkdownBlockRaw): ProofReorderData {
  const { content, properties } = extractProperties(markdown.rawTokens);

  // Get all parts from properties
  const parts: string[] = [];
  for (const [key, value] of Object.entries(properties)) {
    if (key.toLowerCase().startsWith('part ')) {
      parts.push(value.trim());
    }
  }

  // Get question order
  const questionOrder = properties['question order']?.trim() || '';

  return {
    id: markdown.id,
    type: ProofReorderType,
    content,
    questionData: {
      orderItems: parts.map((part, index) => ({
        id: `${index + 1}`,
        content: part,
      })),
      questionOrder,
    },
  };
}


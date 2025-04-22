import { RawData, convertRawContent } from "../convert-helper";
import { BlockSchema } from "../schemas";
import { extractProperties, MarkdownBlockRaw, checkRequiredProperties } from "../convert-markdown-helper";

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

export class ProofReorderBlock implements BlockSchema {
  id: string;
  type: typeof ProofReorderType;
  content: string;
  questionData: ProofReorderQuestionData;
  name?: string;
  updatedAt: Date;

  constructor(
    id: string,
    content: string,
    questionData: ProofReorderQuestionData,
    name?: string
  ) {
    this.id = id;
    this.content = content;
    this.questionData = questionData;
    this.type = ProofReorderType;
    this.name = name;
    this.updatedAt = new Date();
  }

  getText(): string {
    const { orderItems, questionOrder } = this.questionData;
    let text = this.content + '\n\n';
    
    orderItems.forEach((item, index) => {
      text += `part-${index + 1}:\n${item.content}\n\n`;
    });
    
    text += `question-order:\n${questionOrder}`;
    return text;
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
  static fromNode(rawData: RawData): ProofReorderBlock {
    const keywords = [
      { pattern: 'question-order:', name: 'questionOrder' },
      { pattern: /part-\d+:/, name: 'parts' },
    ];
    const converted = convertRawContent(rawData.rawContent, keywords);
    const questionOrder = converted.questionOrder as string;
    const parts = Array.isArray(converted.parts) ? converted.parts : [converted.parts];
    const blockContent = converted.content as string;

    const questionOrderArray = questionOrder.trim().split(',');
    const cleanOrderArray = questionOrderArray.map(s => s.trim());
    
    return new ProofReorderBlock(
      rawData.id,
      blockContent,
      {
        orderItems: parts.map((part, index) => ({
          id: `${index + 1}`,
          content: part,
        })),
        questionOrder: cleanOrderArray.join(','),
      },
      rawData.name
    );
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
  static fromMarkdown(markdown: MarkdownBlockRaw): ProofReorderBlock {
    const { content, properties } = extractProperties(markdown.rawTokens);

    checkRequiredProperties(properties, ['question order']);

    // Get all parts from properties
    const parts: string[] = [];
    for (const [key, value] of Object.entries(properties)) {
      if (key.toLowerCase().startsWith('part ')) {
        parts.push(value.trim());
      }
    }

    if (parts.length === 0) {
      throw new Error('parts are required');
    }

    const questionOrder = properties['question order'].trim();

    return new ProofReorderBlock(
      markdown.id,
      content,
      {
        orderItems: parts.map((part, index) => ({
          id: `${index + 1}`,
          content: part,
        })),
        questionOrder,
      },
      markdown.name
    );
  }
}

export function convertProofReorderBlockNode(rawData: RawData): ProofReorderBlock {
  return ProofReorderBlock.fromNode(rawData);
}

export function convertProofReorderMarkdown(markdown: MarkdownBlockRaw): ProofReorderBlock {
  return ProofReorderBlock.fromMarkdown(markdown);
}


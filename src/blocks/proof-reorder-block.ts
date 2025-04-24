import { RawData, convertRawContent } from "../convert-helper";
import { BlockSchema } from "../schemas";
import { extractProperties, MarkdownBlock, checkRequiredProperties } from "../convert-markdown-helper";

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

  static validate(block: ProofReorderBlock): void {
    const { orderItems, questionOrder } = block.questionData;

    if (orderItems.length === 0) {
      throw new Error(`Parts cannot be empty for block ID: ${block.id}`);
    }

    if (!questionOrder) {
      throw new Error(`Question order is required for block ID: ${block.id}`);
    }

    const questionOrderArray = questionOrder.split(',');
    if (orderItems.length !== questionOrderArray.length) {
      throw new Error(`Number of parts (${orderItems.length}) does not match the length of question order (${questionOrderArray.length}) for block ID: ${block.id}`);
    }

    // Optional: Add check to ensure all part IDs in questionOrder exist in orderItems if needed
    // const partIds = orderItems.map(item => item.id);
    // const orderIds = questionOrderArray.map(id => id.trim());
    // if (!orderIds.every(id => partIds.includes(id))) {
    //   throw new Error(`Question order contains invalid part IDs for block ID: ${block.id}`);
    // }
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
    
    const block = new ProofReorderBlock(
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

    this.validate(block); // Validate the constructed block
    return block;
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
  static fromMarkdown(markdown: MarkdownBlock): ProofReorderBlock {
    const { content, properties } = extractProperties(markdown.rawTokens);

    // Get all parts from properties
    const parts: string[] = [];
    for (const [key, value] of Object.entries(properties)) {
      if (key.toLowerCase().startsWith('part ')) {
        parts.push(value.trim());
      }
    }

    const questionOrder = properties['question order']?.trim() || ''; // Ensure questionOrder is defined

    const newBlock = new ProofReorderBlock(
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

    this.validate(newBlock); // Validate the constructed block
    return newBlock;
  }
}

export function convertProofReorderBlockNode(rawData: RawData): ProofReorderBlock {
  return ProofReorderBlock.fromNode(rawData);
}

export function convertProofReorderMarkdown(markdown: MarkdownBlock): ProofReorderBlock {
  return ProofReorderBlock.fromMarkdown(markdown);
}


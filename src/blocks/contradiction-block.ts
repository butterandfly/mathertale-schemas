import { BlockSchema } from "../schemas";
import { MarkdownBlock, extractProperties } from "../convert-markdown-helper";

export const ContradictionType = 'CONTRADICTION' as const;

export interface ContradictionChoice {
  key: string;
  content: string;
}

export interface ContradictionQuestionData {
  choices: ContradictionChoice[];
  answer: string[]; // Array of keys from choices
  explanation: string;
}

export class ContradictionBlock implements BlockSchema {
  id: string;
  type: typeof ContradictionType;
  content: string;
  questionData: ContradictionQuestionData;
  name?: string;
  updatedAt: Date;

  constructor(
    id: string,
    content: string,
    questionData: ContradictionQuestionData,
    name?: string
  ) {
    this.id = id;
    this.content = content;
    this.questionData = questionData;
    this.type = ContradictionType;
    this.name = name;
    this.updatedAt = new Date();
  }

  getText(): string {
    const { choices, answer, explanation } = this.questionData;
    let text = this.content + '\n\n';
    
    text += 'choices:\n';
    choices.forEach(choice => {
      text += `${choice.key}: ${choice.content}\n`;
    });
    
    text += '\nanswer:\n';
    text += answer.join(', ');
    
    text += '\n\nexplanation:\n';
    text += explanation;
    
    return text;
  }

  static validate(block: ContradictionBlock): void {
    const { choices, answer, explanation } = block.questionData;

    if (choices.length === 0) {
      throw new Error(`Choices cannot be empty for block ID: ${block.id}`);
    }

    if (!explanation) { // Assuming explanation is always required based on fromNode/checkRequiredProperties
      throw new Error(`Explanation is required for block ID: ${block.id}`);
    }

    if (!answer || answer.length !== 2) {
      throw new Error(`Answer must contain exactly 2 keys for block ID: ${block.id}`);
    }

    const choiceKeys = choices.map(choice => choice.key);
    for (const key of answer) {
      if (!choiceKeys.includes(key)) {
        throw new Error(`Answer key "${key}" does not exist in choices (${choiceKeys.join(', ')}) for block ID: ${block.id}`);
      }
    }
  }

  /**
   * Markdown format for contradiction block
   * 
   * ```
   * This is the question content.
   * It can have multiple lines and LaTeX content like $x^2$.
   * 
   * #### Choices
   * a: First choice with $\alpha$
   * b: Second choice with $\beta$
   * c: Third choice with $\gamma$
   * d: Fourth choice with $\delta$
   * 
   * #### Answer
   * a, c
   * 
   * #### Explanation
   * This is the explanation.
   * It can also have multiple lines and LaTeX content.
   * ```
   */
  static fromMarkdown(markdown: MarkdownBlock): ContradictionBlock {
    const { content, properties } = extractProperties(markdown.rawTokens);

    // Parse choices from the choices property
    const choices: ContradictionChoice[] = [];
    // Ensure properties.choices exists before splitting
    if (properties.choices) {
      const choiceLines = properties.choices.split('\n');
      choiceLines.forEach((line: string) => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const content = line.substring(colonIndex + 1).trim();
          if (key && content) {
            choices.push({ key, content });
          }
        }
      });
    }

    // Parse answer from the answer property
    const answer: string[] = [];
    if (properties.answer) {
      properties.answer.split(',').map((key: string) => key.trim()).forEach((key: string) => {
        if (key && !answer.includes(key)) {
          answer.push(key);
        }
      });
    }

    const block = new ContradictionBlock(
      markdown.id,
      properties.content || content || '',
      {
        choices,
        answer,
        explanation: properties.explanation || ''
      },
      markdown.name
    );

    this.validate(block); // Validate the constructed block
    return block;
  }
}

export function convertContradictionMarkdown(markdown: MarkdownBlock): ContradictionBlock {
  return ContradictionBlock.fromMarkdown(markdown);
}
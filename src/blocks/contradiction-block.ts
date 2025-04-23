import { RawData } from "../convert-helper";
import { BlockSchema } from "../schemas";
import { convertRawContent } from "../convert-helper";
import { MarkdownBlock, extractProperties, checkRequiredProperties } from "../convert-markdown-helper";

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

  /**
   * 将矛盾题的文本内容转换为结构化数据
   * 
   * 输入文本格式示例：
   * ```
   * This is the question content.
   * It can have multiple lines and LaTeX content like $x^2$.
   * 
   * choices:
   * a: First choice with $\alpha$
   * b: Second choice with $\beta$
   * c: Third choice with $\gamma$
   * d: Fourth choice with $\delta$
   * 
   * answer:
   * a, c
   * 
   * explanation:
   * This is the explanation.
   * It can also have multiple lines and LaTeX content.
   * ```
   * 
   * 注意：
   * 1. 内容中的关键字（choices:, answer:, explanation:）必须独占一行
   * 2. 关键字的顺序可以任意
   * 3. 每个部分都支持多行文本和LaTeX内容
   * 4. 选项格式必须为 "字母: 选项内容"
   * 5. answer部分是以逗号分隔的选项key列表，顺序不重要
   */
  static fromNode(rawData: RawData): ContradictionBlock {
    // 定义关键字模式
    const keywords = [
      { pattern: 'choices:', name: 'choices' },
      { pattern: 'answer:', name: 'answer' },
      { pattern: 'explanation:', name: 'explanation' }
    ];
    
    // Use the helper function to extract sections from the raw content
    const converted = convertRawContent(rawData.rawContent, keywords);
    const choicesRaw = converted.choices as string;
    const answerRaw = converted.answer as string;
    const explanation = converted.explanation as string;
    const blockContent = converted.content as string;

    // Check if required sections exist
    if (choicesRaw === undefined) {
      throw new Error('choices section is required: ' + rawData.rawContent);
    }

    if (answerRaw === undefined) {
      throw new Error('answer section is required: ' + rawData.rawContent);
    }

    if (explanation === undefined) {
      throw new Error('explanation section is required: ' + rawData.rawContent);
    }
    
    // Process the "choice" section: each line should be in the format "key: value"
    const choices: ContradictionChoice[] = [];
    
    choicesRaw.split('\n').forEach(line => {
      const [key, value] = line.split(':').map(s => s.trim());
      if (key && value) {
        choices.push({ key, content: value });
      }
    });

    if (choices.length === 0) {
      throw new Error('choices section is empty: ' + rawData.rawContent);
    }
    
    // Process the answer section: convert comma-separated keys to an array
    const answer: string[] = [];
    if (answerRaw) {
      answerRaw.split(',').map(key => key.trim()).forEach(key => {
        if (key && !answer.includes(key)) {
          answer.push(key);
        }
      });
    }

    if (answer.length !== 2) {
      throw new Error('answer must be 2 keys: ' + rawData.rawContent);
    }

    // Validate that all answer keys exist in choices
    for (const key of answer) {
      if (!choices.some(choice => choice.key === key)) {
        throw new Error(`answer key "${key}" does not exist in choices: ` + rawData.rawContent);
      }
    }

    return new ContradictionBlock(
      rawData.id,
      blockContent,
      {
        choices,
        answer,
        explanation: explanation ? explanation.trim() : ''
      },
      rawData.name
    );
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

    checkRequiredProperties(properties, ['choices', 'answer', 'explanation']);
    
    // Parse choices from the choices property
    const choices: ContradictionChoice[] = [];

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

    // Parse answer from the answer property
    const answer: string[] = [];
    properties.answer.split(',').map((key: string) => key.trim()).forEach((key: string) => {
      if (key && !answer.includes(key)) {
        answer.push(key);
      }
    });

    // Validate answer length
    if (answer.length !== 2) {
      throw new Error('answer must be 2 keys: ' + markdown.rawTokens);
    }

    // Validate that all answer keys exist in choices
    for (const key of answer) {
      if (!choices.some(choice => choice.key === key)) {
        throw new Error(`answer key "${key}" does not exist in choices: ` + markdown.rawTokens);
      }
    }

    return new ContradictionBlock(
      markdown.id,
      properties.content || content || '',
      {
        choices,
        answer,
        explanation: properties.explanation || ''
      },
      markdown.name
    );
  }
}

export function convertContradictionBlockNode(rawData: RawData): ContradictionBlock {
  return ContradictionBlock.fromNode(rawData);
}

export function convertContradictionMarkdown(markdown: MarkdownBlock): ContradictionBlock {
  return ContradictionBlock.fromMarkdown(markdown);
}
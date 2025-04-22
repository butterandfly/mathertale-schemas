import { RawData } from "../convert-helper";
import { BlockSchema } from "../schemas";
import { convertRawContent } from "../convert-helper";
import { extractProperties, MarkdownBlockRaw, checkRequiredProperties } from '../convert-markdown-helper';

export const SingleChoiceType = 'SINGLE_CHOICE' as const;

export interface Choice {
  key: string;
  content: string;
}

export interface SingleChoiceQuestionData {
  choices: Choice[];
  answer: string;
  explanation: string;
}

export class SingleChoiceBlock implements BlockSchema {
  readonly type = SingleChoiceType;

  constructor(
    public id: string,
    public content: string,
    public questionData: SingleChoiceQuestionData,
    public name?: string,
    public updatedAt: Date = new Date()
  ) {}

  getText(): string {
    const choicesText = this.questionData.choices
      .map(choice => `${choice.key}: ${choice.content}`)
      .join('\n');

    return `${this.content}

choices:
${choicesText}

answer:
${this.questionData.answer}

explanation:
${this.questionData.explanation}`;
  }

  /**
   * 将单选题的文本内容转换为结构化数据
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
   * 
   * answer:
   * b
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
   */
  static convertContent(rawContent: string): {
    blockContent: string, 
    questionData: SingleChoiceQuestionData
  } {
    // 定义关键字模式
    const keywords = [
      { pattern: 'choices:', name: 'choices' },
      { pattern: 'answer:', name: 'answer' },
      { pattern: 'explanation:', name: 'explanation' }
    ];
    
    // Use the helper function to extract sections from the raw content
    const converted = convertRawContent(rawContent, keywords);
    const choicesRaw = converted.choices as string;
    const answer = converted.answer as string;
    const explanation = converted.explanation as string;
    const blockContent = converted.content as string;

    // Process the "choice" section: each line should be in the format "key: value"
    const choices: Choice[] = [];

    if (!choicesRaw) {
      throw new Error('choices section is required: ' + rawContent);
    }

    if (!answer) {
      throw new Error('answer section is required: ' + rawContent);
    }

    if (!explanation) {
      throw new Error('explanation section is required: ' + rawContent);
    }

    choicesRaw.split('\n').forEach(line => {
      // Split only at the first colon to handle content that may contain colons
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const content = line.substring(colonIndex + 1).trim();
        if (key && content) {
          choices.push({ key, content });
        }
      }
    });

    if (choices.length === 0) {
      throw new Error('choices section is empty: ' + rawContent);
    }
    
    // Assemble the question data
    const questionData: SingleChoiceQuestionData = {
      choices,
      answer: answer ? answer.trim() : '',
      explanation: explanation ? explanation.trim() : ''
    };
    
    return { blockContent, questionData };
  }

  static fromNode(rawData: RawData): SingleChoiceBlock {
    const { blockContent, questionData } = this.convertContent(rawData.rawContent);
    return new SingleChoiceBlock(
      rawData.id,
      blockContent,
      questionData,
      rawData.name
    );
  }

  /**
   * Markdown format for single choice block
   * 
   * Input format example:
   * ```
   * This is the question content.
   * 
   * #### Choices
   * a: First choice with $\alpha$
   * b: Second choice with $\beta$
   * c: Third choice with $\gamma$
   * 
   * #### Answer
   * b
   * 
   * #### Explanation
   * This is the explanation.
   * It can also have multiple lines and LaTeX content.
   * ```
  */
  static fromMarkdown(block: MarkdownBlockRaw): SingleChoiceBlock {
    const { content, properties } = extractProperties(block.rawTokens);

    checkRequiredProperties(properties, ['choices', 'answer']);
    
    // Parse choices from the choices property
    const choices: Choice[] = [];
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

    return new SingleChoiceBlock(
      block.id,
      properties.content || content || '',
      {
        choices,
        answer: properties.answer?.trim() || '',
        explanation: properties.explanation || ''
      },
      block.name
    );
  }
}

// 导出兼容性函数
export const convertSingleChoiceBlockNode = SingleChoiceBlock.fromNode.bind(SingleChoiceBlock);
export const convertSingleChoiceMarkdown = SingleChoiceBlock.fromMarkdown.bind(SingleChoiceBlock);

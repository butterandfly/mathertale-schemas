import { RawData } from "../convert-helper";
import { BlockSchema } from "../schemas";
import { convertRawContent } from "../convert-helper";
import { MarkdownBlockRaw, extractProperties } from "../convert-markdown-helper";

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

export interface ContradictionData extends BlockSchema {
  id: string;
  type: typeof ContradictionType;
  content: string;
  questionData: ContradictionQuestionData;
}

export function convertContradictionBlockNode(rawData: RawData): ContradictionData {
  const { blockContent, questionData } = convertContradiction(rawData.rawContent);
  return {
    id: rawData.id,
    type: ContradictionType,
    content: blockContent,
    questionData: questionData
  }
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
export function convertContradiction(rawContent: string): {
  blockContent: string, 
  questionData: ContradictionQuestionData
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
  const answerRaw = converted.answer as string;
  const explanation = converted.explanation as string;
  const blockContent = converted.content as string;

  // Check if required sections exist
  if (choicesRaw === undefined) {
    throw new Error('choices section is required: ' + rawContent);
  }

  if (answerRaw === undefined) {
    throw new Error('answer section is required: ' + rawContent);
  }

  if (explanation === undefined) {
    throw new Error('explanation section is required: ' + rawContent);
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
    throw new Error('choices section is empty: ' + rawContent);
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
    throw new Error('answer must be 2 keys: ' + rawContent);
  }

  // Validate that all answer keys exist in choices
  for (const key of answer) {
    if (!choices.some(choice => choice.key === key)) {
      throw new Error(`answer key "${key}" does not exist in choices: ` + rawContent);
    }
  }
  
  // Assemble the question data
  const questionData: ContradictionQuestionData = {
    choices,
    answer,
    explanation: explanation ? explanation.trim() : ''
  };
  
  return { blockContent, questionData };
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
export function convertContradictionMarkdown(markdown: MarkdownBlockRaw): ContradictionData {
  const { content, properties } = extractProperties(markdown.rawTokens);
  
  // Parse choices from the choices property
  if (!properties.choices) {
    throw new Error('choices section is required: ' + markdown.rawTokens);
  }
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
  if (!properties.answer) {
    throw new Error('answer section is required: ' + markdown.rawTokens);
  }
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

  return {
    id: markdown.id,
    type: ContradictionType,
    content: properties.content || content || '',
    questionData: {
      choices,
      answer,
      explanation: properties.explanation || ''
    }
  };
}
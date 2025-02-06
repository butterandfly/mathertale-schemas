import { RawData } from "../node-validator";
import { BlockSchema } from "../schemas";

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

export interface SingleChoiceData extends BlockSchema {
  id: string;
  type: typeof SingleChoiceType;
  content: string;
  questionData: SingleChoiceQuestionData;
}

export function convertSingleChoiceBlockNode(rawData: RawData): SingleChoiceData {
  const {blockContent, questionData} = convertSingleChoice(rawData.rawContent);
  return {
    id: rawData.id,
    type: SingleChoiceType,
    content: blockContent,
    questionData: questionData
  }
}

/**
 * 将单选题的文本内容转换为结构化数据
 * 
 * 输入文本格式示例：
 * ```
 * This is the question content.
 * It can have multiple lines and LaTeX content like $x^2$.
 * 
 * choice:
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
 * 1. 内容中的关键字（choice:, answer:, explanation:）必须独占一行
 * 2. 关键字的顺序可以任意
 * 3. 每个部分都支持多行文本和LaTeX内容
 * 4. 选项格式必须为 "字母: 选项内容"
 */
export function convertSingleChoice(rawContent: string): {
    blockContent: string, 
    questionData: SingleChoiceQuestionData} {

  let blockContent: string;
  const questionData: SingleChoiceQuestionData = {
    choices: [],
    answer: '',
    explanation: ''
  };

  // 定义所有可能的关键字
  const keywords = ['choice:', 'answer:', 'explanation:'];
  
  // 将文本分割成行
  const lines = rawContent.split('\n');
  
  // 找到所有关键字的行号
  const keywordPositions: { keyword: string; lineIndex: number }[] = [];
  lines.forEach((line, index) => {
    const keyword = keywords.find(k => line.trim() === k);
    if (keyword) {
      keywordPositions.push({ keyword, lineIndex: index });
    }
  });
  
  // 按行号排序
  keywordPositions.sort((a, b) => a.lineIndex - b.lineIndex);
  
  // 处理题目内容（从开始到第一个关键字）
  const firstKeywordLine = keywordPositions[0]?.lineIndex ?? lines.length;
  blockContent = lines.slice(0, firstKeywordLine).join('\n').trim();
  
  // 处理每个关键字部分
  keywordPositions.forEach((pos, index) => {
    const startLine = pos.lineIndex + 1;
    const endLine = keywordPositions[index + 1]?.lineIndex ?? lines.length;
    const content = lines.slice(startLine, endLine).join('\n').trim();
    
    switch (pos.keyword) {
      case 'choice:':
        content.split('\n').forEach(line => {
          const [key, value] = line.split(':').map(s => s.trim());
          if (key && value) {
            questionData.choices.push({key, content: value});
          }
        });
        break;
      case 'answer:':
        questionData.answer = content;
        break;
      case 'explanation:':
        questionData.explanation = content;
        break;
    }
  });

  return {blockContent, questionData};
}
import { BlockSchema, QuestSchema, SectionSchema } from "./schemas";
import { ParaType, convertParaMarkdown } from "./blocks/para-block";
import { marked, Token } from 'marked';
import { MarkdownBlockRaw } from "./convert-helper";

// 定义转换函数的类型
type ConvertFunction = (block: MarkdownBlockRaw) => BlockSchema;

// 转换函数映射表
const convertBlockMap: Record<string, ConvertFunction> = {
  para: convertParaMarkdown
};

interface MarkdownSection {
  name: string;
  blocks: MarkdownBlockRaw[];
}

interface MarkdownQuest {
  name: string;
  id: string;
  desc: string;
  sections: MarkdownSection[];
}

export function parseQuestHeader(tokens: Token[]): { name: string; id: string; desc: string } {
  let name = '';
  let id = '';
  let desc = '';

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    // Quest name from h1
    if (token.type === 'heading' && token.depth === 1) {
      const text = token.text;
      if (text.startsWith('Quest:')) {
        name = text.substring('Quest:'.length).trim();
      }
      continue;
    }

    // Extract id and desc from paragraph
    if (token.type === 'paragraph') {
      const lines = token.text.split('\n');
      lines.forEach((line: string) => {
        const [key, value] = line.split(':').map((s: string) => s.trim());
        if (key === 'id') id = value;
        if (key === 'desc') desc = value;
      });
    }
  }

  return { name, id, desc };
}

/**
 * 处理嵌套列表项
 */
function processListItems(
  items: any[], 
  result: string[], 
  level: number = 0, 
  isOrdered = false
): void {
  for (const item of items) {
    // 添加列表项，带有适当的缩进
    const indent = '  '.repeat(level);
    const prefix = item.ordered ? `${item.number}. ` : '- ';
    result.push(indent + prefix + item.text.split('\n')[0]);

    // 处理嵌套列表
    const nestedLists = item.tokens.filter((t: any) => t.type === 'list');
    for (const list of nestedLists) {
      for (let i = 0; i < list.items.length; i++) {
        const nestedItem = list.items[i];
        if (list.ordered) {
          nestedItem.ordered = true;
          nestedItem.number = i + 1;
        }
        // 对于有序列表，嵌套项使用4个空格
        if (isOrdered) {
          processListItems([nestedItem], result, 2, list.ordered);
        } else {
          processListItems([nestedItem], result, level + 1, list.ordered);
        }
      }
    }
  }
}

/**
 * 将tokens转换为markdown文本
 * @param tokens 要转换的tokens
 * @returns markdown文本
 */
export function tokensToMarkdown(tokens: Token[]): string {
  if (!tokens || tokens.length === 0) return '';
  
  const result: string[] = [];
  let inCodeBlock = false;
  let inLatexBlock = false;
  let lastTokenType: string | null = null;
  let lastListOrdered: boolean | null = null;
  
  for (const token of tokens) {
    if (token.type === 'list') {
      if (lastTokenType === 'paragraph' || lastTokenType === 'code') {
        result.push('');
      } else if (lastTokenType === 'list' && lastListOrdered !== token.ordered) {
        // 有序列表和无序列表之间添加空行
        result.push('');
      }

      // 在有序列表前添加空行（如果不是在内容开头）
      if (token.ordered && result.length > 0 && lastTokenType !== null) {
        // 检查最后一项是否已经是空行
        if (result.length > 0 && result[result.length - 1] !== '') {
          result.push('');
        }
      }

      const items = token.items;
      for (let i = 0; i < items.length; i++) {
        if (token.ordered) {
          items[i].ordered = true;
          items[i].number = i + 1;
        }
      }
      processListItems(items, result, 0, token.ordered);
      lastTokenType = 'list';
      lastListOrdered = token.ordered;
    } else if (token.type === 'code') {
      // 处理代码块，包括语言信息和内容
      const lang = (token as any).lang || '';
      if (lastTokenType === 'code') {
        result.push('');
      }
      result.push('```' + lang);
      result.push(token.text);
      result.push('```');
      inCodeBlock = false;
      lastTokenType = 'code';
    } else if (token.type === 'paragraph') {
      if (inCodeBlock || inLatexBlock) {
        result.push(token.text);
      } else {
        if (lastTokenType === 'paragraph' || lastTokenType === 'list' || lastTokenType === 'code') {
          result.push('');
        }
        result.push(token.text);
      }
      lastTokenType = 'paragraph';
    } else if (token.type === 'space') {
      if (!inCodeBlock && !inLatexBlock && lastTokenType !== 'list') {
        result.push('');
      }
      lastTokenType = 'space';
    } else if (token.type === 'html') {
      // 处理LaTeX块
      if (token.text === '$$') {
        if (!inLatexBlock) {
          // 开始LaTeX块
          if (lastTokenType === 'paragraph') {
            result.push('');
          }
          inLatexBlock = true;
        } else {
          // 结束LaTeX块
          inLatexBlock = false;
        }
        result.push('$$');
      } else {
        result.push(token.text);
      }
      lastTokenType = 'html';
    } else if (token.type === 'heading') {
      if (lastTokenType !== null) {
        result.push('');
      }
      const prefix = '#'.repeat(token.depth) + ' ';
      result.push(prefix + token.text);
      lastTokenType = 'heading';
    }
  }
  
  return result.join('\n').trim();
}

/**
 * 从tokens中提取属性
 * @param tokens 标记数组
 * @returns 包含content和properties的对象
 */
export function extractProperties(tokens: Token[]): { content: string; properties: Record<string, string> } {
  if (!tokens || tokens.length === 0) {
    return { content: '', properties: {} };
  }
  
  // 找到第一个4级标题的索引
  let firstH4Index = tokens.findIndex(token => token.type === 'heading' && token.depth === 4);
  if (firstH4Index === -1) {
    // 没有4级标题，所有内容都是content
    return { 
      content: tokensToMarkdown(tokens), 
      properties: {} 
    };
  }
  
  // 提取content部分的tokens和properties部分的tokens
  const contentTokens = tokens.slice(0, firstH4Index);
  const propertyTokens = tokens.slice(firstH4Index);
  
  // 处理content部分，将tokens转为markdown文本
  const content = tokensToMarkdown(contentTokens);
  
  // 处理properties部分
  const properties: Record<string, string> = {};
  let currentProperty: string | null = null;
  let currentPropertyTokens: Token[] = [];
  
  for (const token of propertyTokens) {
    if (token.type === 'heading' && token.depth === 4) {
      // 保存之前的属性（如果存在）
      if (currentProperty && currentPropertyTokens.length > 0) {
        properties[currentProperty] = tokensToMarkdown(currentPropertyTokens);
      }
      currentProperty = token.text.toLowerCase();
      currentPropertyTokens = [];
    } else if (currentProperty) {
      // 收集当前属性部分的所有token
      currentPropertyTokens.push(token);
    }
  }

  // 保存最后一个属性
  if (currentProperty && currentPropertyTokens.length > 0) {
    properties[currentProperty] = tokensToMarkdown(currentPropertyTokens);
  }

  return { content, properties };
}

/**
 * 解析markdown并转换为Quest对象
 * @param markdown markdown内容
 * @returns 解析后的Quest对象
 */
function parseMarkdownQuest(markdown: string): MarkdownQuest {
  const tokens = marked.lexer(markdown);
  let currentSection: MarkdownSection | null = null;
  
  const quest: MarkdownQuest = {
    name: '',
    id: '',
    desc: '',
    sections: []
  };

  // 第一步：获取Quest标题信息
  const { name, id, desc } = parseQuestHeader(tokens);
  quest.name = name;
  quest.id = id;
  quest.desc = desc;

  // 第二步：处理sections和blocks
  let blockTokens: Token[] = [];
  let currentBlockTag = '';
  let currentBlockName = '';
  let currentBlockId = '';

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === 'heading') {
      // 新的section
      if (token.depth === 2) {
        // 保存上一个section（如果存在）
        if (currentSection && blockTokens.length > 0) {
          currentSection.blocks.push({
            tag: currentBlockTag,
            name: currentBlockName || undefined,
            id: currentBlockId,
            rawTokens: blockTokens
          });
        }
        
        if (currentSection) {
          quest.sections.push(currentSection);
        }

        const sectionName = token.text.replace(/^Section:\s*/, '').trim();
        currentSection = {
          name: sectionName,
          blocks: []
        };
        blockTokens = [];
        currentBlockTag = '';
        currentBlockName = '';
        currentBlockId = '';
      }
      // 新的block
      else if (token.depth === 3 && token.text.includes(':')) {
        // 保存上一个block（如果存在）
        if (blockTokens.length > 0 && currentSection) {
          currentSection.blocks.push({
            tag: currentBlockTag,
            name: currentBlockName || undefined,
            id: currentBlockId,
            rawTokens: blockTokens
          });
        }

        const [tag, name] = token.text.split(':').map((s: string) => s.trim());
        currentBlockTag = tag.toLowerCase();
        currentBlockName = name;
        currentBlockId = ''; // 当遇到id元数据时设置
        blockTokens = [];
      }
    } else if (token.type === 'paragraph' && token.text.startsWith('id:')) {
      currentBlockId = token.text.substring('id:'.length).trim();
    } else {
      blockTokens.push(token);
    }
  }

  // 保存最后一个block和section
  if (currentSection && blockTokens.length > 0) {
    currentSection.blocks.push({
      tag: currentBlockTag,
      name: currentBlockName || undefined,
      id: currentBlockId,
      rawTokens: blockTokens
    });
    quest.sections.push(currentSection);
  }

  return quest;
}

/**
 * 注册block转换函数
 * @param tag block类型
 * @param converter 转换函数
 */
export function registerBlockConverter(tag: string, converter: ConvertFunction): void {
  convertBlockMap[tag] = converter;
}

/**
 * 将markdown转换为Quest对象
 * @param markdown markdown内容
 * @returns 转换后的Quest对象
 */
export function convertQuestMarkdown(markdown: string): QuestSchema {
  const parsedQuest = parseMarkdownQuest(markdown);

  const quest: QuestSchema = {
    id: parsedQuest.id,
    name: parsedQuest.name,
    desc: parsedQuest.desc,
    blockCount: 0,
    sections: [],
    updatedAt: new Date(),
    dependentQuests: [],
    childQuests: []
  };

  quest.sections = parsedQuest.sections.map(section => {
    const convertedSection: SectionSchema = {
      name: section.name,
      blocks: section.blocks.map(block => {
        const converter = convertBlockMap[block.tag];
        if (!converter) {
          throw new Error(`No converter registered for block type: ${block.tag}`);
        }
        return converter(block);
      })
    };
    return convertedSection;
  });

  quest.blockCount = quest.sections.reduce((count, section) => 
    count + section.blocks.length, 0
  );

  return quest;
} 
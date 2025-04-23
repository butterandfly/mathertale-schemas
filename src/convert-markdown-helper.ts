import { Token } from 'marked';
 
export interface MarkdownBlock {
    tag: string;
    name?: string;
    id: string;
    rawTokens: Token[];
  }
 
/**
 * 从tokens中提取Quest头部信息（名称、ID和描述）
 * @param tokens 标记数组
 * @returns The map of meta data
 */
export function parseQuestHeader(tokens: Token[]): Record<string, string> {
    const result: Record<string, string> = {};
    let nameExtracted = false;

    for (const token of tokens) {
        // Extract the name from the first heading of depth 1
        if (!nameExtracted && token.type === 'heading' && token.depth === 1) {
            const text = token.text.trim();
            if (text.startsWith('Quest:')) {
                result['name'] = text.substring('Quest:'.length).trim();
            }
            nameExtracted = true;
            continue;
        }

        // Stop processing key-value pairs when another heading is encountered
        if (nameExtracted && token.type === 'heading') {
            break;
        }

        // Process paragraphs for key-value pairs
        if (nameExtracted && token.type === 'paragraph') {
            const lines = token.text.split('\n');
            for (const line of lines) {
                // Skip empty lines
                if (!line.trim()) continue;

                // Split on first ':' only
                const colonIndex = line.indexOf(':');
                if (colonIndex !== -1) {
                    const key = line.substring(0, colonIndex).trim().toLowerCase();
                    const value = line.substring(colonIndex + 1).trim();
                    if (key && value) {
                        result[key] = value;
                    }
                }
            }
        }
    }

    return result;
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
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const nextToken = i < tokens.length - 1 ? tokens[i + 1] : null;
      
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
        
        // 如果下一个token不是list，添加空行
        if (nextToken && nextToken.type !== 'list') {
          result.push('');
        }
        
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
 * 检查必需的属性
 * @param properties 属性对象
 * @param requiredProperties 必需的属性列表
 * @throws 如果缺少必需的属性，则抛出错误
 */
export function checkRequiredProperties(properties: Record<string, string>, requiredProperties: string[]): void {
  requiredProperties.forEach((property: string) => {
    if (!properties[property]) {
      throw new Error(`${property} is required: ${JSON.stringify(properties)}`);
    }
  });
}
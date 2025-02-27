import { BlockSchema } from "./schemas";

export interface CanvasNode {
  id: string;
  type: string;
  text?: string;
  file?: string;
}

export interface CanvasEdge {
  fromNode: string;
  toNode: string;
  fromSide: string;
  toSide: string;
}

export interface CanvasData {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export interface RawData {
  id: string;
  tag: string;
  name?: string;
  rawContent: string;
}

export interface Metadata {
  tag: string;
  name: string;
  id: string;
}

export type BlockNodeConverter = (rawData: RawData) => BlockSchema;

export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export function getMetadata(line: string): Metadata {
  const parts = line.trim().split(' ');
  const tag = parts[0].replace('#', '');

  let id = '';
  const lastPart = parts[parts.length - 1];
  if (lastPart.startsWith('^') && isValidUUID(lastPart.replace('^', ''))) {
    id = lastPart.replace('^', '');
    parts.pop();
  }

  const name = parts.slice(1).join(' ');
  return { tag, name, id };
}

interface KeywordItem {
  pattern: string | RegExp;
  name: string;
}

export function convertRawContent(
    rawContent: string, 
    keywords: KeywordItem[]
  ): { content: string, [key: string]: string | string[] } {
    const lines = rawContent.split('\n');
  
    // Find the positions of all keywords in the text
    const keywordPositions: { name: string; lineIndex: number }[] = [];
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      for (const keyword of keywords) {
        if (typeof keyword.pattern === 'string') {
          if (trimmedLine === keyword.pattern) {
            keywordPositions.push({ name: keyword.name, lineIndex: index });
            break;
          }
        } else {
          // 正则表达式匹配
          const match = trimmedLine.match(keyword.pattern);
          if (match) {
            keywordPositions.push({ name: keyword.name, lineIndex: index });
            break;
          }
        }
      }
    });
    
    // Ensure the keyword positions are in order (not strictly necessary here,
    // since we're scanning linearly, but good for safety).
    keywordPositions.sort((a, b) => a.lineIndex - b.lineIndex);
    
    // The "content" is everything before the first keyword occurrence
    const firstKeywordLine = keywordPositions[0]?.lineIndex ?? lines.length;
    const content = lines.slice(0, firstKeywordLine).join('\n').trim();
    
    // Prepare the result, starting with the main content
    const result: { content: string, [key: string]: string | string[] } = { content };
  
    // 按name分组处理内容
    const groupedPositions = keywordPositions.reduce((acc, pos) => {
      if (!acc[pos.name]) {
        acc[pos.name] = [];
      }
      acc[pos.name].push(pos);
      return acc;
    }, {} as { [key: string]: typeof keywordPositions });

    // Process each group
    for (const [name, positions] of Object.entries(groupedPositions)) {
      const contents = positions.map((pos, index) => {
        const startLine = pos.lineIndex + 1;
        const endLine = positions[index + 1]?.lineIndex ?? 
                       keywordPositions.find(kp => kp.lineIndex > pos.lineIndex)?.lineIndex ?? 
                       lines.length;
        return lines.slice(startLine, endLine).join('\n').trim();
      });

      // 如果只有一个内容，存为字符串；否则存为数组
      result[name] = contents.length === 1 ? contents[0] : contents;
    }
  
    return result;
  }
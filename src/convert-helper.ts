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

export function convertRawContent(
    rawContent: string, 
    keywords: string[]
  ): { content: string, [key: string]: string } {
    // Split the raw text into individual lines
    const lines = rawContent.split('\n');
  
    // Find the positions of all keywords in the text
    const keywordPositions: { keyword: string; lineIndex: number }[] = [];
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      const matchedKeyword = keywords.find(k => trimmedLine === k);
      if (matchedKeyword) {
        keywordPositions.push({ keyword: matchedKeyword, lineIndex: index });
      }
    });
    
    // Ensure the keyword positions are in order (not strictly necessary here,
    // since we're scanning linearly, but good for safety).
    keywordPositions.sort((a, b) => a.lineIndex - b.lineIndex);
    
    // The "content" is everything before the first keyword occurrence
    const firstKeywordLine = keywordPositions[0]?.lineIndex ?? lines.length;
    const content = lines.slice(0, firstKeywordLine).join('\n').trim();
    
    // Prepare the result, starting with the main content
    const result: { content: string, [key: string]: string } = { content };
  
    // Process each keyword by extracting its following text until the next keyword (or end of text)
    keywordPositions.forEach((pos, index) => {
      const startLine = pos.lineIndex + 1;
      const endLine = keywordPositions[index + 1]?.lineIndex ?? lines.length;
      const sectionContent = lines.slice(startLine, endLine).join('\n').trim();
      // Remove trailing colon (:) from the keyword to use as the object key
      const key = pos.keyword.replace(/:$/, '');
      result[key] = sectionContent;
    });
  
    return result;
  }
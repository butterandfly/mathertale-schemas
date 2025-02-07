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
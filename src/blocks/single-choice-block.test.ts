import { expect, describe, it } from "vitest";
import { convertSingleChoiceBlockNode } from "./single-choice-block";
import { RawData } from "../convert-helper";
import { SingleChoiceType } from "./single-choice-block";

describe('SingleChoiceBlock', () => {
    it('should convert single choice block node raw data', () => {
        const rawData: RawData = { 
          id: 'fake-id', 
          tag: 'single_choice', 
          rawContent: `
    What is 2+2?
    
    choice:
    a: 3
    b: 4
    c: 5
    
    answer:
    b
    
    explanation:
    Because 2+2=4`
        };
        
        const block = convertSingleChoiceBlockNode(rawData);
        expect(block).toEqual({
          content: 'What is 2+2?',
          type: SingleChoiceType,
          questionData: expect.any(Object),
          id: rawData.id,
        });
    
        // 验证 questionData 是否正确解析
        expect(block.questionData).toEqual({
          choices: [
            { key: 'a', content: '3' },
            { key: 'b', content: '4' },
            { key: 'c', content: '5' }
          ],
          answer: 'b',
          explanation: 'Because 2+2=4'
        });
      });
    })
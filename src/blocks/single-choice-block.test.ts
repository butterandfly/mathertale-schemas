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
    
    choices:
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
    
    it('should throw error if choices key is misspelled as "choice"', () => {
        const rawData: RawData = {
          id: 'fake-id-error-1',
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

        expect(() => convertSingleChoiceBlockNode(rawData)).toThrow(Error);
    });
    
    it('should throw error if answer field is missing', () => {
        const rawData: RawData = {
          id: 'fake-id-error-2',
          tag: 'single_choice',
          rawContent: `
    What is 2+2?
    
    choices:
    a: 3
    b: 4
    c: 5
    
    explanation:
    Because 2+2=4`
        };

        expect(() => convertSingleChoiceBlockNode(rawData)).toThrow(Error);
    });
    
    it('should throw error if explanation key is misspelled as "explain"', () => {
        const rawData: RawData = {
          id: 'fake-id-error-3',
          tag: 'single_choice',
          rawContent: `
    What is 2+2?
    
    choices:
    a: 3
    b: 4
    c: 5
    
    answer:
    b
    
    explain:
    Because 2+2=4`
        };

        expect(() => convertSingleChoiceBlockNode(rawData)).toThrow(Error);
    });
    
    it('should handle choices with colons in their content', () => {
        const rawData: RawData = {
          id: 'fake-id-with-colons',
          tag: 'single_choice',
          rawContent: `
    What is the correct syntax for defining a constant in JavaScript?
    
    choices:
    a: var x = 10
    b: let x = 10
    c: const x = 10
    d: x: 10
    e: Choice with: colon in the middle
    f: Choice with multiple: colons: in content
    
    answer:
    c
    
    explanation:
    The const keyword is used to define constants in JavaScript.`
        };
        
        const block = convertSingleChoiceBlockNode(rawData);
        
        // Verify that choices with colons are parsed correctly
        expect(block.questionData.choices).toEqual([
          { key: 'a', content: 'var x = 10' },
          { key: 'b', content: 'let x = 10' },
          { key: 'c', content: 'const x = 10' },
          { key: 'd', content: 'x: 10' },
          { key: 'e', content: 'Choice with: colon in the middle' },
          { key: 'f', content: 'Choice with multiple: colons: in content' }
        ]);
    });
});
import { convertJourneyCanvas, findQuestMarkdown } from './extract-content';
import { describe, it, expect } from 'vitest'
import { Category, QuestSchema } from './schemas';
import { CanvasData } from './convert-helper';

// describe('convertJourneyCanvas', () => {
//   it('should convert a journey file correctly', () => {
//     // Mock journey canvas data
//     const journeyCanvasData = {
//       nodes: [
//         {
//           id: "journey-node-1",
//           type: "text",
//           text: "#journey Simple Journey ^00000000-0000-0000-0000-000000000001\n\nA simple journey description.\n\ncategory:\nfoundational\n\ndevStatus:\navailable",
//           x: 0,
//           y: 0,
//           width: 400,
//           height: 100
//         },
//         {
//           id: "quest-node-1",
//           type: "file",
//           file: "test/quest1.quest.canvas",
//           x: -200,
//           y: 100,
//           width: 400,
//           height: 400
//         },
//         {
//           id: "quest-node-2",
//           type: "file",
//           file: "test/quest2.quest.canvas",
//           x: 200,
//           y: 100,
//           width: 400,
//           height: 400
//         }
//       ],
//       edges: [
//         {
//           id: "edge-1",
//           fromNode: "journey-node-1",
//           fromSide: "bottom",
//           toNode: "quest-node-1",
//           toSide: "top"
//         },
//         {
//           id: "edge-2",
//           fromNode: "quest-node-1",
//           fromSide: "bottom",
//           toNode: "quest-node-2",
//           toSide: "top"
//         }
//       ]
//     };

//     // 准备 questMap 参数
//     const questMap: Record<string, QuestSchema> = {
//       'test/quest1.quest.canvas': {
//         id: '00000000-0000-0000-0000-000000000001',
//         name: 'Simple Quest',
//         desc: 'A simple quest description',
//         sections: [],
//         updatedAt: new Date(),
//         blockCount: 0,
//         dependentQuests: [],
//         childQuests: []
//       },
//       'test/quest2.quest.canvas': {
//         id: '00000000-0000-0000-0000-000000000002',
//         name: 'Simple Quest',
//         desc: 'A simple quest description',
//         sections: [],
//         updatedAt: new Date(),
//         blockCount: 0,
//         dependentQuests: [],
//         childQuests: []
//       }
//     };

//     const result = convertJourneyCanvas(journeyCanvasData, questMap);

//     expect(result.id).toEqual('00000000-0000-0000-0000-000000000001');
//     expect(result.name).toEqual('Simple Journey');
//     expect(result.desc).toEqual('A simple journey description.');
//     expect(result.category).toEqual(Category.FOUNDATIONAL);
//     expect(result.devStatus).toEqual('available');
//     expect(Object.keys(result.questShortMap).length).toEqual(2);
//   });

// }); 



describe('findQuestMarkdown', () => {
  it('should find all quest markdown in journey canvas data', () => {
    const journeyCanvas: CanvasData = {
      nodes: [
        {
          id: "journey1",
          type: "text",
          text: "#journey Journey 1 ^00000000-0000-0000-0000-000000000001",
        },
        {
          id: "quest1",
          type: "file",
          file: "test/quest1.quest.md",
        },
        {
          id: "quest2",
          type: "file",
          file: "test/quest2.quest.md",
        },
        {
          id: "other",
          type: "file",
          file: "test/other.md",
        }
      ],
      edges: []
    };

    const questMarkdowns = findQuestMarkdown(journeyCanvas);
    
    expect(questMarkdowns).toEqual([
      'test/quest1.quest.md',
      'test/quest2.quest.md'
    ]);
  });

  it('should return empty array when no quest canvases found', () => {
    const journeyCanvas: CanvasData = {
      nodes: [
        {
          id: "journey1",
          type: "text",
          text: "#journey Journey 1 ^00000000-0000-0000-0000-000000000001",
        },
        {
          id: "other",
          type: "file",
          file: "test/journey1.journey.canvas",
        }
      ],
      edges: []
    };

    const questMarkdowns = findQuestMarkdown(journeyCanvas);
    
    expect(questMarkdowns).toEqual([]);
  });
});
import { convertJourney } from '../src/extract-content';

describe('convertJourney', () => {
  it('should convert a journey file correctly', () => {
    // Mock journey canvas data
    const journeyCanvasData = {
      nodes: [
        {
          id: "d8625dca8e47b64d",
          type: "text",
          text: "#journey Simple Journey ^00000000-0000-0000-0000-000000000001\n\nA simple journey description.",
          x: 0,
          y: 0,
          width: 400,
          height: 100
        },
        {
          id: "f3c1becd8c3e5417",
          type: "file",
          file: "test/quest1.quest.canvas",
          x: -200,
          y: 100,
          width: 400,
          height: 400
        },
        {
          id: "01a6fa6965a64ef7",
          type: "file",
          file: "test/quest2.quest.canvas",
          x: 200,
          y: 100,
          width: 400,
          height: 400
        }
      ],
      edges: [
        {
          id: "c2c3d6eff1354065",
          fromNode: "d8625dca8e47b64d",
          fromSide: "bottom",
          toNode: "f3c1becd8c3e5417",
          toSide: "top"
        },
        {
          id: "404c1dfe96ebe614",
          fromNode: "d8625dca8e47b64d",
          fromSide: "bottom",
          toNode: "01a6fa6965a64ef7",
          toSide: "top"
        }
      ]
    };

    // 准备 questMap 参数
    const questMap = {
      'test/quest1.quest.canvas': {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Simple Quest',
        desc: 'A simple quest description',
        sections: [],
        modifiedAt: new Date()
      },
      'test/quest2.quest.canvas': {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Simple Quest',
        desc: 'A simple quest description',
        sections: [],
        modifiedAt: new Date()
      }
    };

    const result = convertJourney(journeyCanvasData, questMap);

    expect(result).toEqual({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Simple Journey',
      desc: 'A simple journey description.',
      questSummaries: expect.arrayContaining([
        expect.objectContaining({
          questId: '00000000-0000-0000-0000-000000000002',
          name: 'Simple Quest',
          desc: 'A simple quest description',
          dependencies: [],
          children: []
        })
      ])
    });
  });

  it('should throw error when journey id is missing', () => {
    const invalidJourneyData = {
      nodes: [
        {
          id: "d8625dca8e47b64d",
          type: "text",
          text: "#journey Simple Journey\nMissing ID journey",
          x: 0,
          y: 0,
          width: 400,
          height: 100
        }
      ],
      edges: []
    };

    expect(() => {
      convertJourney(invalidJourneyData, {});
    }).toThrow('Journey id is required');
  });

  it('should handle quest dependencies correctly', () => {
    // Mock journey canvas data with dependencies
    const journeyCanvasData = {
      nodes: [
        {
          id: "d8625dca8e47b64d",
          type: "text",
          text: "#journey Simple Journey ^00000000-0000-0000-0000-000000000001\n\nA simple journey description.",
          x: 0,
          y: 0
        },
        {
          id: "quest1",
          type: "file",
          file: "test/Quest 1.canvas",
          x: 0,
          y: 100
        },
        {
          id: "quest2",
          type: "file",
          file: "test/Quest 2.canvas",
          x: 0,
          y: 200
        }
      ],
      edges: [
        {
          id: "edge1",
          fromNode: "quest1",
          fromSide: "bottom",
          toNode: "quest2",
          toSide: "top"
        }
      ]
    };

    const questMap = {
      'test/Quest 1.canvas': {
        id: 'quest1-id',
        name: 'Quest 1',
        desc: 'Quest 1 description',
        sections: [],
        modifiedAt: new Date()
      },
      'test/Quest 2.canvas': {
        id: 'quest2-id',
        name: 'Quest 2',
        desc: 'Quest 2 description',
        sections: [],
        modifiedAt: new Date()
      }
    };

    const result = convertJourney(journeyCanvasData, questMap);

    expect(result.questSummaries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          questId: 'quest1-id',
          children: ['quest2-id'],
          dependencies: []
        }),
        expect.objectContaining({
          questId: 'quest2-id',
          children: [],
          dependencies: ['quest1-id']
        })
      ])
    );
  });
}); 
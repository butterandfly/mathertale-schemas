import { convertDefinitionBlockNode, convertFactBlockNode, convertPropositionBlockNode, convertRemarkBlockNode, convertTheoremBlockNode } from './blocks/noted-block';
import { convertParaBlockNode } from './blocks/para-block';
import { convertSingleChoiceBlockNode } from './blocks/single-choice-block';
import { convertRawContent } from './convert-helper';
import {
  CanvasNode,
  CanvasData,
  getMetadata,
  RawData,
  BlockNodeConverter
} from './convert-helper';

import {
  BlockSchema,
  SectionSchema,
  QuestSchema,
  JourneySchema,
  QuestShortSchema,
  Category,
  DevStatus,
} from './schemas';

const tagBlockMap: Record<string, BlockNodeConverter> = {
  'para': convertParaBlockNode,
  'definition': convertDefinitionBlockNode,
  'fact': convertFactBlockNode,
  'theorem': convertTheoremBlockNode,
  'proposition': convertPropositionBlockNode,
  'remark': convertRemarkBlockNode,
  'single_choice': convertSingleChoiceBlockNode
}


export function convertBlockNode(blockNode: CanvasNode): BlockSchema {
  if (!blockNode.text) {
    throw new Error('Block text is required');
  }
  
  const text = blockNode.text.trim();
  const firstLine = text.split('\n')[0];
  const {tag, name, id} = getMetadata(firstLine);
  if (!id) {
    throw new Error('Block id is required: ' + firstLine);
  }

  const content = text.split('\n').slice(1).join('\n').trim();

  const rawData: RawData = {
    id,
    tag,
    name,
    rawContent: content
  }

  if (!tagBlockMap[tag]) {
    throw new Error('Invalid block tag: ' + tag);
  }

  const block = tagBlockMap[tag](rawData);
  
  return block;
}



export function convertSectionNode(sectionNode: CanvasNode, canvasData: CanvasData): SectionSchema {
  if (!sectionNode.text) {
    throw new Error('Section text is required');
  }

  const lines = sectionNode.text.trim().split('\n');
  const firstLine = lines[0];
  const {tag, name, id} = getMetadata(firstLine);
  if (!id) {
    throw new Error('Section id is required: ' + firstLine);
  }

  if (tag !== 'section') {
    throw new Error('Invalid section tag: ' + tag);
  }

  const section: SectionSchema = {
    name,
    blocks: [],
  };

  let currentBlockNode = findNextBlockNode(sectionNode, canvasData);
  while (currentBlockNode) {
    const block = convertBlockNode(currentBlockNode);
    section.blocks.push(block);
    currentBlockNode = findNextBlockNode(currentBlockNode, canvasData);
  }

  return section;
}



function findJourneyNode(canvasData: CanvasData): CanvasNode | undefined {
  return canvasData.nodes.find(node => {
    if (node.type === 'file') {
      return false;
    }
    if (!node.text) {
      return false;
    }
    const content = node.text.trim();
    return content.startsWith('#journey ');
  });
}

export function findQuestNode(canvasData: CanvasData): CanvasNode | undefined {
  return canvasData.nodes.find(node => {
    if (node.type === 'file') {
      return false;
    }
    if (!node.text) {
      return false;
    }
    const content = node.text.trim();
    return content.startsWith('#quest ');
  });
}

/**
 * Convert a journey canvas to a journey schema.
 * @param journeyCanvasData Journey canvas data
 * @param questMap {questPath: QuestSchema}
 * @returns Journey schema
 */
export function convertJourneyCanvas(
  journeyCanvasData: CanvasData, 
  questMap: Record<string, QuestSchema>
): JourneySchema {
  const journeyNode = findJourneyNode(journeyCanvasData);
  if (!journeyNode) {
    throw new Error('Journey node not found in canvas data');
  }

  const journey = extractDataFromJourneyNode(journeyNode);

  // {questId: QuestShortSchema}
  const questShortMap: Record<string, QuestShortSchema> = journey.questShortMap;

  // 遍历所有文件类型的节点，通过 file 属性查找对应的 quest
  journeyCanvasData.nodes.forEach(node => {
    if (node.type === 'file' && node.file) {
      const quest = questMap[node.file];
      if (quest) {
        questShortMap[quest.id] = {
          id: quest.id,
          name: quest.name,
          desc: quest.desc,
          dependentQuests: [],
          childQuests: [],
          updatedAt: quest.updatedAt,
          blockCount: quest.blockCount
        };
      }
    }
  });

  // 处理依赖关系
  journeyCanvasData.edges.forEach(edge => {
    if (edge.fromSide === 'bottom' && edge.toSide === 'top') {
      const fromNode = journeyCanvasData.nodes.find(n => n.id === edge.fromNode);
      const toNode = journeyCanvasData.nodes.find(n => n.id === edge.toNode);

      if (fromNode?.id === journeyNode.id) {
        return;
      }

      if (fromNode?.type === 'file' && toNode?.type === 'file') {
        const fromQuestShort = questShortMap[questMap[fromNode.file!].id];
        const toQuestShort = questShortMap[questMap[toNode.file!].id];

        if (fromQuestShort && toQuestShort) {
          fromQuestShort.childQuests.push(toQuestShort.id);
          toQuestShort.dependentQuests.push(fromQuestShort.id);
        }
      }
    }
  });

  console.log(journey.questShortMap)

  journey.questCount = Object.keys(questShortMap).length;

  return journey;
}

// Find the next section node.
// The current node should be a section node or a quest node.
export function findNextSectionNode(currentNode: CanvasNode, canvasData: CanvasData): CanvasNode | null {
  const edge = canvasData.edges.find(edge => 
    edge.fromNode === currentNode.id && 
    edge.fromSide === 'right' && 
    edge.toSide === 'left'
  );
  return edge ? canvasData.nodes.find(node => node.id === edge.toNode) || null : null;
}

// Find the next block node.
// The current node should be a block node or a section node.
export function findNextBlockNode(currentNode: CanvasNode, canvasData: CanvasData): CanvasNode | null {
  const edge = canvasData.edges.find(edge => 
    edge.fromNode === currentNode.id && 
    edge.fromSide === 'bottom' && 
    edge.toSide === 'top'
  );
  return edge ? canvasData.nodes.find(node => node.id === edge.toNode) || null : null;
}

/**
 * Find all quest canvas file paths in the journey.
 * Quest canvas files are named with the format `*.quest.canvas`.
 * @param journeyCanvas Journey canvas data
 * @returns quest canvas file paths
 */
export function findQuestCanvases(journeyCanvas: CanvasData): string[] {
  return journeyCanvas.nodes
    .filter(node => 
      node.type === 'file' && 
      node.file && 
      node.file.endsWith('.quest.canvas')
    )
    .map(node => node.file as string);
}

export function convertQuestNode(questNode: CanvasNode, canvasData: CanvasData): QuestSchema {
  if (!questNode.text) {
    throw new Error('Quest text is required');
  }

  const lines = questNode.text.split('\n');
  const firstLine = lines[0];
  const {tag, name, id} = getMetadata(firstLine);
  if (!id) {
    throw new Error('Quest id is required: ' + firstLine);
  }

  if (tag !== 'quest') {
    throw new Error('Invalid quest tag: ' + tag);
  }

  const quest: QuestSchema = {
    name,
    id,
    desc: lines.slice(1).join('\n'),
    blockCount: 0,
    sections: [],
    updatedAt: new Date(),
    dependentQuests: [],
    childQuests: []
  };

  let currentSectionNode = findNextSectionNode(questNode, canvasData);
  while (currentSectionNode) {
    const section = convertSectionNode(currentSectionNode, canvasData);
    quest.sections.push(section);
    currentSectionNode = findNextSectionNode(currentSectionNode, canvasData);
  }

  // 计算 blockCount
  quest.blockCount = quest.sections.reduce((count, section) => {
    return count + section.blocks.length;
  }, 0);

  return quest;
}

/**
 * Convert a quest canvas to a quest schema.
 * @param canvasData Quest canvas data
 * @returns Quest schema, with empty dependentQuests and childQuests
 */
export function convertQuestCanvas(canvasData: CanvasData): QuestSchema {
  const questNode = findQuestNode(canvasData);
  if (!questNode) {
    throw new Error('Quest node not found in canvas data');
  }
  return convertQuestNode(questNode, canvasData);
}

/**
 * Extract data from a journey node.
 * @param journeyNode Journey node
 * @returns Journey schema, with empty questShortMap and 0 questCount
 */
export function extractDataFromJourneyNode(journeyNode: CanvasNode): JourneySchema {
  if (!journeyNode.text) {
    throw new Error('Journey text is required');
  }

  const lines = journeyNode.text.split('\n');
  const firstLine = lines[0];
  const {tag, name, id} = getMetadata(firstLine);
  
  if (!id) {
    throw new Error('Journey id is required: ' + journeyNode.text);
  }
  if (!name) {
    throw new Error('Journey name is required: ' + journeyNode.text);
  }

  const rawContent = lines.slice(1).join('\n').trim();
  const {content: desc, category, devStatus} = convertRawContent(rawContent, ['category:', 'devStatus:']);

  const categoryMap: Record<string, Category> = {
    'foundational': Category.FOUNDATIONAL,
    'analysis': Category.ANALYSIS,
    'algebra': Category.ALGEBRA,
    'probability': Category.PROBABILITY
  }

  if (!categoryMap[category]) {
    throw new Error('Invalid category: ' + category);
  }
  
  const devStatusMap: Record<string, DevStatus> = {
    'in_development': 'in_development',
    'coming_soon': 'coming_soon',
    'available': 'available'
  }

  if (!devStatusMap[devStatus]) {
    throw new Error('Invalid dev status: ' + devStatus);
  }

  return {
    id,
    name,
    desc,
    category: categoryMap[category],
    devStatus: devStatusMap[devStatus],
    questCount: 0,
    updatedAt: new Date(),
    createdAt: new Date(),
    questShortMap: {}
  }
}

import {
  QuestSchema,
  JourneySchema,
  QuestShortSchema,
  Category,
  DevStatus,
} from './schemas';


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


export interface Metadata {
  tag: string;
  name: string;
  id: string;
}


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

  journey.questCount = Object.keys(questShortMap).length;

  return journey;
}

/**
 * Find all quest markdown file paths in the journey.
 * Quest markdown files are named with the format `*.quest.md`.
 * @param journeyCanvas Journey canvas data
 * @returns quest markdown file paths
 */
export function findQuestMarkdown(journeyCanvas: CanvasData): string[] {
  return journeyCanvas.nodes
    .filter(node => 
      node.type === 'file' && 
      node.file && 
      node.file.endsWith('.quest.md')
    )
    .map(node => node.file as string);
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

  const dataMap: Record<string, string> = {};
  lines.slice(1).forEach(line => {
    const key = line.split(':')[0].trim();
    const value = line.split(':')[1].trim();
    dataMap[key] = value;
  });

  const desc = dataMap['desc'] as string;
  const category = dataMap['category'] as string;
  const devStatus = dataMap['devStatus'] as string;

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

/**
 * Check if a journey canvas is available.
 * @param journeyCanvas Journey canvas data
 * @returns true if the journey is available, false otherwise
 */
export function isJourneyCanvasAvailable(journeyCanvas: CanvasData): boolean {
  const journeyNode = findJourneyNode(journeyCanvas);
  if (!journeyNode) {
    throw new Error('Journey node not found in canvas data');
  }

  const journey = extractDataFromJourneyNode(journeyNode);
  return journey.devStatus === 'available';
}
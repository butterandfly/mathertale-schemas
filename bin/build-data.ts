import { read, readFileSync } from "fs"
import { findQuestCanvases, convertQuestCanvas, JourneySchema, QuestSchema, convertJourneyCanvas} from "../src"
import { readdirSync } from "fs"
import path from "path"
import { isJourneyCanvasAvailable } from "../src/extract-content"
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { JourneyShortSchema } from '../src/schemas';

/**
 * Build journey data from a journey canvas file.
 * @param journeyPath - The path to the journey canvas file.
 * @returns An object containing the journey and its quests.
 */
export function buildJourneyData(journeyPath: string): {
    journey:JourneySchema,
    quests:QuestSchema[]
} {
    // Read journeyPath and jsonify it
    const journeyCanvas = JSON.parse(readFileSync(journeyPath, 'utf8'))
    const questPaths = findQuestCanvases(journeyCanvas)

    const pathQuestMap: Record<string, QuestSchema> = {}

    questPaths.forEach(questPath => {
        const questCanvas = JSON.parse(readFileSync(questPath, 'utf8'))
        const quest = convertQuestCanvas(questCanvas)
        pathQuestMap[questPath] = quest
    })

    const journey = convertJourneyCanvas(journeyCanvas, pathQuestMap)

    // console.log(journey.questShortMap)

    // Copy dependency information from journey to pathQuestMap
    Object.values(pathQuestMap).forEach(quest => {
        quest.dependentQuests = [...journey.questShortMap[quest.id].dependentQuests]
        quest.childQuests = [...journey.questShortMap[quest.id].childQuests]
    })

    return {
        journey,
        quests: questPaths.map(path => pathQuestMap[path])
    }
}

export function buildJourneyDataFiles(journeyPath: string, outputDir: string = 'output'): void {
    // 确保输出目录存在
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir);
    }

    // 构建journey数据
    const { journey, quests } = buildJourneyData(journeyPath);
    
    // 保存journey文件
    const journeyFileName = `journey-${journey.id}.json`;
    writeFileSync(
        path.join(outputDir, journeyFileName),
        JSON.stringify(journey, null, 2)
    );
    
    // 创建并保存quest文件
    const questDirName = `journey-${journey.id}`;
    const questDirPath = path.join(outputDir, questDirName);
    if (!existsSync(questDirPath)) {
        mkdirSync(questDirPath);
    }
    
    quests.forEach(quest => {
        const questFileName = `quest-${quest.id}.json`;
        writeFileSync(
            path.join(questDirPath, questFileName),
            JSON.stringify(quest, null, 2)
        );
    });
}

export function findAllAvailableJourneyFilesRecursive(dir: string): string[] {
    let journeyFiles: string[] = [];
    
    // 读取当前目录下的所有文件和文件夹
    const items = readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
            // 递归处理子目录
            journeyFiles = journeyFiles.concat(findAllAvailableJourneyFilesRecursive(fullPath));
        } else if (item.isFile() && item.name.endsWith('.journey.canvas')) {
            // 检查文件是否可用
            try {
                const content = JSON.parse(readFileSync(fullPath, 'utf8'));
                if (isJourneyCanvasAvailable(content)) {
                    journeyFiles.push(fullPath);
                }
            } catch (error) {
                console.warn(`Warning: Failed to process ${fullPath}`, error);
            }
        }
    }
    
    return journeyFiles;
}

function buildJourneyShortsFromJourneys(journeys: JourneySchema[]): JourneyShortSchema[] {
    return journeys.map(({ questShortMap, ...journeyShort }) => journeyShort);
}

/**
 * Build demo quest data from a demo quest canvas file.
 * @param rootDir - The root directory where the demo quest canvas file is located.
 * @param outputDir - The directory to output the demo quest data to.
 * @returns The demo quest data.
 */
export function buildDemoQuest(rootDir: string, outputDir: string = 'data'): QuestSchema {
    // Ensure output directory exists
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir);
    }

    // Create a demo directory in the output directory
    const demoDir = path.join(outputDir, 'demo');
    if (!existsSync(demoDir)) {
        mkdirSync(demoDir);
    }

    // Direct path to the demo quest canvas file
    const demoQuestPath = path.join(rootDir, 'Demo.quest.canvas');
    
    if (!existsSync(demoQuestPath)) {
        throw new Error(`Demo quest canvas file not found at ${demoQuestPath}`);
    }

    try {
        // Read and parse the demo quest canvas file
        const demoQuestCanvas = JSON.parse(readFileSync(demoQuestPath, 'utf8'));
        const demoQuest = convertQuestCanvas(demoQuestCanvas);

        // Save the demo quest data with the simplified name
        writeFileSync(
            path.join(demoDir, 'quest-demo.json'),
            JSON.stringify(demoQuest, null, 2)
        );

        console.log(`Demo quest data built successfully: ${demoQuest.name}`);
        return demoQuest;
    } catch (error) {
        console.error(`Error building demo quest data: ${error}`);
        throw error; // Re-throw the error to propagate it
    }
}

export function buildDatabase(rootDir: string, outputDir: string = 'data'): void {
    // 确保输出目录存在
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir);
    }

    // 使用递归函数找到所有可用的journey文件
    const journeyFiles = findAllAvailableJourneyFilesRecursive(rootDir);
    const allJourneys: JourneySchema[] = [];
    
    // 处理每个journey文件
    journeyFiles.forEach(journeyFile => {
        // 复用 buildJourneyDataFiles 来生成单个 journey 的文件
        buildJourneyDataFiles(journeyFile, outputDir);
        
        // 收集journey信息用于生成journeys.json
        const { journey } = buildJourneyData(journeyFile);
        allJourneys.push(journey);
    });
    
    // 生成并保存journeys.json
    const journeyShorts = buildJourneyShortsFromJourneys(allJourneys);
    writeFileSync(
        path.join(outputDir, 'journeys.json'),
        JSON.stringify(journeyShorts, null, 2)
    );

    // Build demo quest data
    buildDemoQuest(rootDir, outputDir);
}
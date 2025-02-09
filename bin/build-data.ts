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

export function findAllAvailableJourneyFiles(rootDir: string): string[] {
    const journeyFiles = readdirSync(rootDir, { withFileTypes: true })
        .filter(dirent => dirent.isFile() && dirent.name.endsWith('.journey.canvas'))
        .map(dirent => path.join(rootDir, dirent.name))

    return journeyFiles.filter(journeyFile => isJourneyCanvasAvailable(JSON.parse(readFileSync(journeyFile, 'utf8'))))
}

function buildJourneyShortsFromJourneys(journeys: JourneySchema[]): JourneyShortSchema[] {
    return journeys.map(({ questShortMap, ...journeyShort }) => journeyShort);
}

export function buildDatabase(rootDir: string, outputDir: string = 'data'): void {
    // 确保输出目录存在
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir);
    }

    // 找到所有可用的journey文件
    const journeyFiles = findAllAvailableJourneyFiles(rootDir);
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
}
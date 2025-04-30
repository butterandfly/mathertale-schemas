import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { buildDatabase, buildJourneyData, findAllAvailableJourneyFilesRecursive, buildDemoQuest, buildAllSoloQuestData } from './build-data'
import { existsSync, readFileSync, rmSync } from 'fs'
import path from 'path'
import { SoloQuestShortSchema } from '../src/schemas'

describe('buildJourneyData', () => {
    it('should build journey data correctly', () => {
        const journeyPath = './test/Journey 1.journey.canvas'
        const {journey, quests} = buildJourneyData(journeyPath)
        const questShortMap = journey.questShortMap

        expect(journey.name).toEqual('Journey 1')
        expect(journey.category).toEqual('Fundamental Mathematics')

        expect(Object.keys(questShortMap).length).toEqual(4)

        expect(quests.length).toEqual(4)
        expect(quests[0].name).toEqual('Quest 1')
        expect(quests[1].name).toEqual('Quest Name 2')
        expect(quests[1].dependentQuests.length).toEqual(0)
        expect(quests[2].dependentQuests.length).toEqual(2)

        const quest3 = quests[2]
        const questShort3 = questShortMap[quest3!.id]
        expect(quest3.dependentQuests).toEqual(questShort3.dependentQuests)
        expect(quest3.childQuests).toEqual(questShort3.childQuests)
    })
})

describe('findAllJourneyFiles', () => {
    it('should find all journey files in the given directory', () => {
        const journeyFiles = findAllAvailableJourneyFilesRecursive('./test')
        expect(journeyFiles.length).toEqual(1)
        expect(journeyFiles[0]).toEqual('test/Journey 1.journey.canvas')
    })
})

describe('buildDemoQuest', () => {
    beforeEach(() => {
        if (existsSync('./test/output')) {
            rmSync('./test/output', { recursive: true })
        }
    })

    it('should build demo quest data correctly', () => {
        const demoQuest = buildDemoQuest('./test', './test/output')
        
        expect(demoQuest).toBeDefined()
        expect(demoQuest.id).toEqual('00000000-0000-0000-0000-000000000001')
        expect(demoQuest.name).toEqual('Demo Quest')
        
        // Check if the file was created
        const demoQuestPath = path.join('./test/output/demo', 'quest-demo.json')
        expect(existsSync(demoQuestPath)).toBeTruthy()
        
        // Check the content of the file
        const demoQuestData = JSON.parse(readFileSync(demoQuestPath, 'utf8'))
        expect(demoQuestData.name).toEqual('Demo Quest')
        expect(demoQuestData.sections.length).toEqual(1)
        expect(demoQuestData.sections[0].name).toEqual('Demo Section')
        expect(demoQuestData.sections[0].blocks.length).toEqual(1)
        expect(demoQuestData.sections[0].blocks[0].type).toEqual('PARA')
    })
})

describe('buildDatabase', () => {
    beforeEach(() => {
        if (existsSync('./test/output')) {
            rmSync('./test/output', { recursive: true })
        }
    })

    it('should build the database correctly', () => {
        buildDatabase('./test', './test/output')

        // Check journeys.json
        const data = readFileSync('./test/output/journeys.json', 'utf8')
        const journeys = JSON.parse(data)
        expect(journeys.length).toEqual(1)
        expect(journeys[0].name).toEqual('Journey 1')
        
        // Check demo quest
        const demoQuestPath = path.join('./test/output/demo', 'quest-demo.json')
        expect(existsSync(demoQuestPath)).toBeTruthy()
        
        const demoQuestData = JSON.parse(readFileSync(demoQuestPath, 'utf8'))
        expect(demoQuestData.name).toEqual('Demo Quest')
    })
})

describe('buildAllSoloQuestData', () => {
    beforeEach(() => {
        if (existsSync('./test/output/soloquests')) {
            rmSync('./test/output/soloquests', { recursive: true });
        }
    });

    it('should build solo quest data correctly', () => {
        buildAllSoloQuestData('./test', './test/output');

        // Check soloquests.json
        const soloquestsData = readFileSync('./test/output/soloquests/soloquests.json', 'utf8');
        const soloquests = JSON.parse(soloquestsData);
        expect(soloquests.length).toBeGreaterThan(0);

        // Check if individual solo quest files are created
        soloquests.forEach((soloquest: SoloQuestShortSchema) => {
            const soloquestPath = path.join('./test/output/soloquests', `soloquest-${soloquest.id}.json`);
            expect(existsSync(soloquestPath)).toBeTruthy();

            const soloquestData = JSON.parse(readFileSync(soloquestPath, 'utf8'));
            expect(soloquestData.id).toEqual(soloquest.id);
        });
    });
});
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { buildDatabase, buildJourneyData, findAllAvailableJourneyFilesRecursive, buildAllSoloQuestData } from './build-data'
import { existsSync, readFileSync, rmSync } from 'fs'
import path from 'path'
import { SoloQuestShortSchema } from '../src/schemas'

// describe('buildJourneyData', () => {
//     it('should build journey data correctly', () => {
//         const journeyPath = './test/Journey 1.journey.canvas'
//         const {journey, quests} = buildJourneyData(journeyPath)
//         const questShortMap = journey.questShortMap

//         expect(journey.name).toEqual('Journey 1')
//         expect(journey.category).toEqual('Fundamental Mathematics')

//         expect(Object.keys(questShortMap).length).toEqual(4)

//         expect(quests.length).toEqual(4)
//         expect(quests[0].name).toEqual('Quest 1')
//         expect(quests[1].name).toEqual('Quest Name 2')
//         expect(quests[1].dependentQuests.length).toEqual(0)
//         expect(quests[2].dependentQuests.length).toEqual(2)

//         const quest3 = quests[2]
//         const questShort3 = questShortMap[quest3!.id]
//         expect(quest3.dependentQuests).toEqual(questShort3.dependentQuests)
//         expect(quest3.childQuests).toEqual(questShort3.childQuests)
//     })
// })

// describe('buildDatabase', () => {
//     beforeEach(() => {
//         if (existsSync('./test/output')) {
//             rmSync('./test/output', { recursive: true })
//         }
//     })

//     it('should build the database correctly', () => {
//         buildDatabase('./test', './test/output')

//         // Check journeys.json
//         const data = readFileSync('./test/output/journeys.json', 'utf8')
//         const journeys = JSON.parse(data)
//         expect(journeys.length).toEqual(1)
//         expect(journeys[0].name).toEqual('Journey 1')
        
//         // Check demo quest
//         const demoQuestPath = path.join('./test/output/demo', 'quest-demo.json')
//         expect(existsSync(demoQuestPath)).toBeTruthy()
        
//         const demoQuestData = JSON.parse(readFileSync(demoQuestPath, 'utf8'))
//         expect(demoQuestData.name).toEqual('Demo Quest')

//         // Check assets copied
//         const assetPath = path.join('./test/output/assets', 'sans.png')
//         expect(existsSync(assetPath)).toBeTruthy()
//     })
// })

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
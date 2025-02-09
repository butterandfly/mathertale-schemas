import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { buildDatabase, buildJourneyData, findAllAvailableJourneyFiles } from './build-data'
import { existsSync, readFileSync, rmSync } from 'fs'

describe('buildJourneyData', () => {
    it('should build journey data correctly', () => {
        const journeyPath = './test/Journey 1.journey.canvas'
        const {journey, quests} = buildJourneyData(journeyPath)
        const questShortMap = journey.questShortMap

        expect(journey.name).toEqual('Journey 1')
        expect(journey.category).toEqual('Foundational Mathematics')

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
        const journeyFiles = findAllAvailableJourneyFiles('./test')
        expect(journeyFiles.length).toEqual(1)
        expect(journeyFiles[0]).toEqual('test/Journey 1.journey.canvas')
    })
})

describe('buildDatabase', () => {
    beforeEach(() => {
        if (existsSync('./test/data')) {
            rmSync('./test/data', { recursive: true })
        }
    })

    it('should build the database correctly', () => {
        buildDatabase('./test', './test/data')

        const data = readFileSync('./test/data/journeys.json', 'utf8')
        const journeys = JSON.parse(data)
        expect(journeys.length).toEqual(1)
        expect(journeys[0].name).toEqual('Journey 1')
    })
})
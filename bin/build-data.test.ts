import { describe, it, expect, beforeEach, vi } from 'vitest'
import { buildJourneyData } from './build-data'
import { readFileSync } from 'fs'
import * as path from 'path'

// Mock fs.readFileSync
// vi.mock('fs', () => ({
//     readFileSync: vi.fn()
// }))

const journeyPath = './test/Journey 1.canvas'

describe('buildJourneyData', () => {
    it('should build journey data correctly', () => {
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

// describe('buildJourneyData', () => {
//     beforeEach(() => {
//         vi.clearAllMocks()
//     })

//     it('should build journey data correctly', () => {
//         // Mock journey canvas data
//         const mockJourneyCanvas = {
//             nodes: [
//                 {"id":"journey-node-1","type":"text","text":"#journey Proofcraft 101 ^8a51c4c7-6efd-463e-9c4d-e5f127aa236e\n\nThe very first class on serious mathematics.\n\ncategory:\nfoundational\n\ndevStatus:\navailable","x":-220,"y":-400,"width":399,"height":294},
//                 { id: 'quest-node-1', path: 'path/to/quest1.quest.canvas' },
//                 { id: 'quest-node-2', path: 'path/to/quest2.quest.canvas' }
//             ],
//             edges: [
//                 {
//                     id: 'edge-1',
//                     fromNode: 'journey-node-1',
//                     fromSide: 'bottom',
//                     toNode: 'quest-node-1',
//                     toSide: 'top'
//                 },
//                 {
//                     id: 'edge-2',
//                     fromNode: 'journey-node-1',
//                     fromSide: 'bottom',
//                     toNode: 'quest-node-2',
//                     toSide: 'top'
//                 }
//             ]
//         }

//         // Mock quest canvas data
//         const mockQuestCanvas1 = {
//             id: 'quest1',
//             title: 'Quest 1'
//         }

//         const mockQuestCanvas2 = {
//             id: 'quest2',
//             title: 'Quest 2'
//         }

//         // Setup readFileSync mock implementations
//         const readFileSyncMock = readFileSync as any
//         readFileSyncMock
//             .mockImplementationOnce(() => JSON.stringify(mockJourneyCanvas))
//             .mockImplementationOnce(() => JSON.stringify(mockQuestCanvas1))
//             .mockImplementationOnce(() => JSON.stringify(mockQuestCanvas2))

//         // Execute
//         const result = buildJourneyData('fake/path/journey.canvas')

//         // Verify
//         expect(readFileSyncMock).toHaveBeenCalledTimes(3)
//         // expect(result).toHaveProperty('journey')
//         // expect(result).toHaveProperty('quests')
//         // expect(result.quests).toHaveLength(2)
//     })

//     it('should throw error when journey file is invalid', () => {
//         const readFileSyncMock = readFileSync as any
//         readFileSyncMock.mockImplementation(() => 'invalid json')

//         expect(() => {
//             buildJourneyData('fake/path/journey.canvas')
//         }).toThrow()
//     })
// }) 
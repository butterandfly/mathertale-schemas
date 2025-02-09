import { read, readFileSync } from "fs"
import { findQuestCanvases, convertQuestCanvas, JourneySchema, QuestSchema, convertJourneyCanvas} from "../src"

const journeyPaths = [
    '../mathertale/proofcraft 101/Proofcraft 101.journey.canvas'
]

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
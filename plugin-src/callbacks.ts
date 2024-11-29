import { Language } from "./types"
import { processCollection } from "./helpers"

export async function onPreferencesChanged(event: CodegenPreferencesEvent) {
    if (event.propertyName === "iframe") {
        figma.showUI(
            __html__,
            {
                width: 300,
                height: 300,
                // https://www.figma.com/plugin-docs/css-variables/#api-details
                themeColors: true,
            }
        )
        
        console.log("Preferences changed", event)
        const localCollections = await figma.variables.getLocalVariableCollectionsAsync()
    
        const files = []
        for (const localCollection of localCollections) {
            const collectionFiles = await processCollection(localCollection)
            files.push(...collectionFiles)
        }
        console.log({ files })
    }

}

export async function onGenerate(event: CodegenEvent): Promise<CodegenResult[]> {
    const { node, language } = event

    const nodeObject = {
        type: node.type,
        name: node.name,
        width: node.width,
        height: node.height,
    }

    const blocks: CodegenResult[] = []

    if (language === Language.Omniverse || language === Language.JSON) {
        const block1: CodegenResult = {
            title: `Omniverse`,
            code: JSON.stringify(nodeObject),
            language: "HTML",
        }
        blocks.push(block1)

        const block2: CodegenResult = {
            title: `Custom JSON`,
            code: JSON.stringify(nodeObject),
            language: "JSON",
        }
        blocks.push(block2)
    }

    // For each block, add FORMAT, ID, and post it to the UI to be formatted
    blocks.forEach(({ language, code }, index) => {
        const message = { type: "FORMAT", code, language, id: index }
        figma.ui.postMessage(message)
    })

    console.log({ blocks })

    let expectedMessageCount = blocks.length
    const results: any[] = []

    let promiseResolve: (value: CodegenResult[]) => void
    const promise = new Promise<CodegenResult[]>((resolve) => {
        promiseResolve = resolve
    })

    figma.ui.onmessage = (message) => {
        if (message.type === "FORMAT_RESULT") {
            const item = blocks[message.id]
            results[message.id] = Object.assign(item, {
                code: message.result,
            })
            expectedMessageCount--
            if (expectedMessageCount <= 0) {
                promiseResolve(results)
            }
        }
    }

    return promise
}
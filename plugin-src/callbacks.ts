import { Language, MessageEvents, PreferencePropertyTypes } from "./types"
import { processCollection } from "./helpers"

export async function onPreferencesChanged(event: CodegenPreferencesEvent) {
    if (event.propertyName === PreferencePropertyTypes.IFRAME) {
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

        // Send the message to the UI with the generated files
        const message = {
            event: MessageEvents.PREFERENCES_CHANGED,
            files,
        }

        figma.ui.postMessage(message)
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

    if (language.toLowerCase() === Language.JSON) {
        const block2: CodegenResult = {
            title: `Custom JSON`,
            code: JSON.stringify(nodeObject),
            language: "JSON",
        }
        blocks.push(block2)
    }

    // For each block, add FORMAT, ID, and post it to the UI to be formatted
    blocks.forEach(({ language, code }, index) => {
        const message = {
            event: MessageEvents.FORMAT,
            id: index,
            code,
            language,
        }

        figma.ui.postMessage(message)
    })

    let expectedMessageCount = blocks.length
    const formattedBlocks: any[] = []

    let promiseResolve: (value: CodegenResult[]) => void
    const promise = new Promise<CodegenResult[]>((resolve) => {
        promiseResolve = resolve
    })

    figma.ui.onmessage = (message) => {
        if (message.event === MessageEvents.FORMAT_RESULT) {
            // Create block using with original block with the formatted code
            const originalBlock = blocks[message.id]
            formattedBlocks[message.id] = Object.assign(originalBlock, { code: message.result, })

            // Decrement the expected message count
            expectedMessageCount -= 1
        
            // If no remaining messages expected, then resolve the promise with the results
            if (expectedMessageCount <= 0) {
                promiseResolve(formattedBlocks)
            }
        }
    }

    return promise
}
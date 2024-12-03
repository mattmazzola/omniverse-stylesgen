import { Language, MessageEvents, PreferencePropertyTypes } from "./types"
import { processCollection } from "./helpers"

export async function onPreferencesChanged(event: CodegenPreferencesEvent) {
    if (event.propertyName === PreferencePropertyTypes.IFRAME) {
        figma.showUI(
            __html__,
            {
                width: 500,
                height: 200,
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
    return []
}
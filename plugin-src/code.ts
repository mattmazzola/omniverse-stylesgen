import { Language } from "./types"

if (figma.mode === "codegen") {
  figma.codegen.on("preferenceschange", async (event: CodegenPreferencesEvent) => {
    console.log("Preferences changed", event)
  
    if (event.propertyName === "example") {
      figma.showUI(
        "<style>body { font-family: system-ui, -apple-system, sans-serif; }</style><p>An iframe for external requests or custom settings!</p>",
        {
          width: 300,
          height: 300,
        }
      )
    }
  })

  figma.showUI(__html__, { visible: false })

  figma.codegen.on("generate", (event) => {
    const { node, language } = event
    const languageIsOmniverse = !language || language === Language.Omniverse

    return new Promise(async (resolve) => {
      const { unit, scaleFactor } = figma.codegen.preferences

      const formatUnit = (number: number) =>
        unit === "SCALED" && typeof scaleFactor == "number"
          ? `${(number * scaleFactor).toFixed(3)}su`
          : `${number}px`

      const nodeObject = {
        type: node.type,
        name: node.name,
        width: formatUnit(node.width),
        height: formatUnit(node.height),
      }

      const localCollections = await figma.variables.getLocalVariableCollectionsAsync()
      console.log({ localCollections })
      const files = []
      for (const localCollection of localCollections) {
        files.push(...(await processCollection(localCollection)))
      }
      console.log({ files })

      const blocks: CodegenResult[] = []

      if (language === Language.Omniverse) {
        const block: CodegenResult = {
          title: `Omniverse`,
          code: JSON.stringify(nodeObject),
          language: "JSON",
        }
        blocks.push(block)
      }

      if (language === Language.JSON) {
        const block: CodegenResult = {
          title: `Custom JSON`,
          code: JSON.stringify(nodeObject),
          language: "JSON",
        }
        blocks.push(block)
      }
    
      // For each block, add FORMAT, ID, and post it to the UI
      blocks.forEach(({ language, code }, index) => {
        const message = { type: "FORMAT", code, language, id: index }
        figma.ui.postMessage(message)
      })

      let promiseCount = blocks.length
      const results = []
      figma.ui.onmessage = (message) => {
        if (message.type === "FORMAT_RESULT") {
          const item = blocks[message.id]
          results[message.id] = Object.assign(item, {
            code: message.result,
          })
          promiseCount--
          if (promiseCount <= 0) {
            resolve(results)
          }
        }
      }
    })
  })
}

async function processCollection({ name, modes, variableIds }) {
  const files = []
  for (const mode of modes) {
    const file = { fileName: `${name}.${mode.name}.tokens.json`, body: {} }
    for (const variableId of variableIds) {
      const variable = await figma.variables.getVariableByIdAsync(variableId)
      const { name, resolvedType, valuesByMode } = variable

      const value = valuesByMode[mode.modeId]
      if (value !== undefined && ["COLOR", "FLOAT"].includes(resolvedType)) {
        let obj = file.body
        name.split("/").forEach((groupName) => {
          obj[groupName] = obj[groupName] || {}
          obj = obj[groupName]
        })
        obj.$type = resolvedType === "COLOR" ? "color" : "number"
        if (value.type === "VARIABLE_ALIAS") {
          const currentVar = await figma.variables.getVariableByIdAsync(
            value.id
          )
          obj.$value = `{${currentVar.name.replace(/\//g, ".")}}`
        } else {
          obj.$value = resolvedType === "COLOR" ? rgbToHex(value) : value
        }
      }
    }
    files.push(file)
  }
  return files
}

function rgbToHex({ r, g, b, a }) {
  // If the alpha is not 1, return an rgba string since hex doesn't support alpha
  if (a !== 1) {
    // Convert rgb floats to integers
    const colorInts = [r, g, b].map((n) => Math.round(n * 255))

    return `rgba(${colorInts.join(", ")}, ${a.toFixed(4)})`
  }

  const hex = [toHex(r), toHex(g), toHex(b)].join("")
  return `#${hex}`
}

function toHex(value) {
  const hex = Math.round(value * 255).toString(16)
  return hex.padStart(2, "0")
}
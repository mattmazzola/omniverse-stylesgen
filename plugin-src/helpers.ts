import { FileDescription } from "./types"
import { deepMerge, rgbToHex } from "./utilities"

export async function processCollection(collection: VariableCollection) {
  const files = []

  if (collection.name.toLowerCase().includes("primitives")) {
    const primativeFiles = await getPrimativesFiles(collection)
    files.push(...primativeFiles)
  }

  return files
}

async function getPrimativesFiles(collection: VariableCollection): Promise<FileDescription[]> {
  const { variableIds, modes } = collection
  
  // TODO: Add support for multiple modes
  const mode = modes[0]
  
  const colorsFile: FileDescription = { name: "colors.ts", data: {}, serializedData: "Empty Data" }
  const fontsFile: FileDescription = { name: "fonts.ts", data: {}, serializedData: "Empty Data" }
  const spacingFile: FileDescription = { name: "spacing.ts", data: {}, serializedData: "Empty Data" }
  
  for (const variableId of variableIds) {
    const variable = await figma.variables.getVariableByIdAsync(variableId)
    if (!variable) {
      throw new Error(`Variable with ID ${variableId} not found`)
    }
    
    if (variable.name.toLowerCase().includes("color")) {
      const processedColorVariable = await processColorVariable(variable, mode)
      deepMerge(colorsFile.data, processedColorVariable["color"])
    }
  }

  const files = [
    colorsFile,
    fontsFile,
    spacingFile,
  ]

  return files
}


async function getTokensFile(collection: VariableCollection) {
  return getPrimativesFiles(collection)
}

function getRootFile(collection: VariableCollection) {
  const file = { fileName: "__init__.ts", body: {} }

  return file
}

type VariableMode = {
  modeId: string
  name: string
}

async function processColorVariable(variable: Variable, mode: VariableMode) {
  const { name, resolvedType, valuesByMode } = variable
  const rootObj: any = {}
  let obj = rootObj

  const value = valuesByMode[mode.modeId]
  if (value !== undefined && ["COLOR", "FLOAT"].includes(resolvedType)) {

    name.split("/").forEach((groupName) => {
      obj[groupName] = obj[groupName] || {}
      obj = obj[groupName]
    })

    obj.$type = resolvedType === "COLOR" ? "color" : "number"

    const variableAlias = value as VariableAlias
    if (variableAlias.type === "VARIABLE_ALIAS") {
      const currentVar = await figma.variables.getVariableByIdAsync(variableAlias.id)
      if (!currentVar) {
        throw new Error(`Variable with ID ${variableAlias.id} not found`)
      }
      obj.$value = `{${currentVar.name.replace(/\//g, ".")}}`
    } else {
      if (resolvedType === "COLOR") {
        // Assume COLOR is always RGBA ?
        const rgba = value as RGBA
        obj.$value = rgbToHex(rgba)
      } else {
        obj.$value = value
      }
    }
  }

  return rootObj
}
import { FileDescription, FileGroup } from "./types"
import { deepMerge, rgbToHex } from "./utilities"

export async function processCollection(collection: VariableCollection) {
  const files = []

  if (collection.name.toLowerCase().includes("primitives")) {
    const primativeFiles = await getPrimativesFiles(collection)
    files.push(...primativeFiles)
  }

  return files
}

async function serializeData(data: object): Promise<string> {
  return JSON.stringify(data, null, 2)
}

async function getPrimativesFiles(collection: VariableCollection): Promise<FileDescription<object | string>[]> {
  const { variableIds, modes } = collection

  // TODO: Add support for multiple modes
  const mode = modes[0]

  const filesInformation: FileGroup[] = [
    {
      variableRootType: "color",
      data: {},
      jsonFile: {
        name: "colors.json",
        data: "Empty Data",
      },
      pythonFile: {
        name: "colors.py",
        data: "Empty Data",
      }
    }, 
    {
      variableRootType: "structure",
      data: {},
      jsonFile: {
        name: "structure.json",
        data: "Empty Data",
      },
      pythonFile: {
        name: "structure.py",
        data: "Empty Data",
      }
    }
  ]

  for (const variableId of variableIds) {
    const variable = await figma.variables.getVariableByIdAsync(variableId)
    if (!variable) {
      throw new Error(`Variable with ID ${variableId} not found`)
    }

    for (const fileInformation of filesInformation) {
      if (variable.name.toLowerCase().includes(fileInformation.variableRootType)) {
        const processedVariable = await processColorOrFloatVariable(variable, mode)
        deepMerge(fileInformation.data, processedVariable[fileInformation.variableRootType])
        
        fileInformation.jsonFile.data = JSON.stringify(fileInformation.data, null, 2)
      }
    }
  }

  console.log({ filesInformation })

  const files = filesInformation.flatMap(fi => [fi.jsonFile, fi.pythonFile])

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

async function processColorOrFloatVariable(variable: Variable, mode: VariableMode) {
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
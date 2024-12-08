import { FileDescription, FileGroup } from "./types"
import { deepMerge, rgbaToHsla, rgbToHex } from "./utilities"
import { template as colorsTemplate } from "./templates/colors"
import { template as structureTemplate } from "./templates/structure"
import { template as tokensTemplate } from "./templates/tokens"
import { template as fontsTemplate } from "./templates/fonts"

export async function processCollection(collection: VariableCollection) {
  const files: FileDescription[] = []

  if (collection.name.toLowerCase().includes("primitives")) {
    const primativeFiles = await getPrimativesFiles(collection)
    files.push(...primativeFiles)
  }
  else if (collection.name.toLowerCase().includes("tokens")) {
    const tokensFiles = await getTokensFiles(collection)
    files.push(...tokensFiles)
  }

  return files
}


async function getPrimativesFiles(collection: VariableCollection): Promise<FileDescription[]> {
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
      },
      serializer: serializeData("color", colorsTemplate),
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
      },
      serializer: serializeData("structure", structureTemplate),
    },
    {
      variableRootType: "font",
      data: {},
      jsonFile: {
        name: "fonts.json",
        data: JSON.stringify({}),
      },
      pythonFile: {
        name: "fonts.py",
        data: "Empty Data",
      },
      serializer: getTemplate(fontsTemplate),
    },
  ]

  // Merge all variable data into the filesInformation
  for (const variableId of variableIds) {
    const variable = await figma.variables.getVariableByIdAsync(variableId)
    if (!variable) {
      throw new Error(`Variable with ID ${variableId} not found`)
    }

    for (const fileInformation of filesInformation) {
      if (variable.name.toLowerCase().includes(fileInformation.variableRootType)) {
        const processedVariable = await processColorOrFloatVariable(variable, mode)
        deepMerge(fileInformation.data, processedVariable[fileInformation.variableRootType])
      }
    }
  }

  // Serialize the data and add it to the files
  for (const fileInformation of filesInformation) {
    fileInformation.jsonFile.data = JSON.stringify(fileInformation.data, null, 2)
    fileInformation.pythonFile.data = await fileInformation.serializer(fileInformation.data)
  }

  const files = filesInformation.flatMap(fi => [fi.jsonFile, fi.pythonFile])

  return files
}


async function getTokensFiles(collection: VariableCollection): Promise<FileDescription[]> {
  const fileGroups: FileGroup[] = [
    {
      variableRootType: "token",
      data: {},
      jsonFile: {
        name: "tokens.json",
        data: JSON.stringify({}),
      },
      pythonFile: {
        name: "tokens.py",
        data: "Empty Data",
      },
      serializer: getTemplate(tokensTemplate),
    },
  ]

  // Serialize the data and add it to the files
  for (const fileGroup of fileGroups) {
    fileGroup.jsonFile.data = JSON.stringify(fileGroup.data, null, 2)
    fileGroup.pythonFile.data = await fileGroup.serializer(fileGroup.data)
  }

  const files = fileGroups.flatMap(fi => [fi.pythonFile])

  return files
}

function getTemplate(template: string) {
  return async function innerSerialize(data: object): Promise<string> {
    return template
  }
}

function serializeData(root_type: string, template: string) {
  return async function innerSerialize(data: object): Promise<string> {

    const sequences = getKeysToLeaf(data)
    const lines = sequences.map(s => getLine(s))
    const serializedData = lines.join("\n") + "\n"

    return `
${serializedData}

${template}
`
  }
}

type ValueSequence = (number | string | object)[]

function getKeysToLeaf(data: object): ValueSequence {
  return []
}

function getLine(sequence: number | string | object): string {
  return ""
}

function getLinesOld(data: object): [number, string[]] {
  const lines = []
  let hue = 0

  let line = ``

  for (const [key, value] of Object.entries(data)) {
    line = `${key.toLowerCase().replace(/-/g, "_")}`

    if (typeof value !== "object") {
      line += ` = ${value}`
      lines.push(line)
    }
    else if (typeof value === "object") {
      // If the value has a $type key, then it's a leaf object
      if (typeof value["$type"] === "string"
        && typeof value["$rgba"] === "object") {
        const { r, g, b, a: rbgAlpha } = value["$rgba"]
        const rInt = Math.round(r * 255)
        const gInt = Math.round(g * 255)
        const bInt = Math.round(b * 255)
        const { h, s, l, a: hslAlpha } = value["$hsla"]
        hue = h

        line += ` = convert_hsl_to_colorshade(${h.toFixed(0)}, ${s.toFixed(0)}, ${l.toFixed(0)})`
        lines.push(line)
      }
      else {
        const [h, ls] = getLines(value)
        hue = h
        lines.push(...ls)
      }
    }
  }

  return [hue, lines]
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
        // TODO: Support other color types
        // This code assumes COLOR is always RGBA which NOT be true
        const rgba = value as RGBA
        if (typeof rgba !== "object") {
          throw new Error(`Expected RGBA to be object, but got ${typeof rgba}. Variable: ${name} Value: ${value}`)
        }

        obj.$rgba = rgba
        obj.$hsla = rgbaToHsla(rgba)
        obj.$value = rgbToHex(rgba)
      } else {
        obj.$value = value
      }
    }
  }

  return rootObj
}
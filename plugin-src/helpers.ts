import { FileDescription, FileGroup, HSLA } from "./types"
import { deepMerge, rgbaToHsla, rgbToHex } from "./utilities"
import { getTemplate as getColorsTemplate } from "./templates/colors"
import { getTemplate as getStructureTemplate } from "./templates/structure"
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

  const fileGroups: FileGroup[] = [
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
      serializer: serializeData("color", getColorsTemplate),
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
      serializer: serializeData("structure", getStructureTemplate),
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
      serializer: getStaticTemplate(fontsTemplate),
    },
  ]

  console.log({ fileGroups })

  // Merge all variable data into the filesInformation
  for (const variableId of variableIds) {
    const variable = await figma.variables.getVariableByIdAsync(variableId)
    if (!variable) {
      throw new Error(`Variable with ID ${variableId} not found`)
    }

    for (const fileInformation of fileGroups) {
      if (variable.name.toLowerCase().includes(fileInformation.variableRootType)) {
        const processedVariable = await processColorOrFloatVariable(variable, mode)
        deepMerge(fileInformation.data, processedVariable[fileInformation.variableRootType])
      }
    }
  }

  // Serialize the data and add it to the files
  for (const fileInformation of fileGroups) {
    fileInformation.jsonFile.data = JSON.stringify(fileInformation.data, null, 2)
    fileInformation.pythonFile.data = await fileInformation.serializer(fileInformation.data)
  }

  const files = fileGroups.flatMap(fi => [fi.jsonFile, fi.pythonFile])

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
      serializer: getStaticTemplate(tokensTemplate),
    },
  ]

  console.log({ fileGroups })

  // Serialize the data and add it to the files
  for (const fileGroup of fileGroups) {
    fileGroup.jsonFile.data = JSON.stringify(fileGroup.data, null, 2)
    fileGroup.pythonFile.data = await fileGroup.serializer(fileGroup.data)
  }

  const files = fileGroups.flatMap(fi => [fi.pythonFile])

  return files
}

function getStaticTemplate(template: string) {
  return async function innerSerialize(data: object): Promise<string> {
    return template
  }
}

function serializeData(root_type: string, templateFunc: (values: string) => string) {
  return async function innerSerialize(data: object): Promise<string> {
    const sequences = getKeysToLeaf(data)
    const lines = sequences
      .map(s => getLine(s as ValueSequence))
      .map(l => `${root_type}_${l}`)
      .sort()

    const joinedLines = lines.join("\n") + "\n"
    const contents = templateFunc(joinedLines)
    // console.info({ root_type, data, sequences, lines, joinedLines, templateEmpty: templateFunc(''), contents })

    return contents
  }
}

type ValueSequence = (number | string | object)[]

function getKeysToLeaf(data: Record<string, any>): ValueSequence[] {
  // If the data is a leaf object, then return the sequence of value
  if (typeof data["$type"] === "string") {
    // If the data has an $hsla object, then return that
    // Otherwise, return the value
    if (typeof data["$hsla"] === "object") {
      const hsla = data["$hsla"]
      return [[hsla]]
    }
    else {
      const value = data["$value"]
      return [[value]]
    }
  }

  // If the data is not leaf, then get sequence of value, then prepend key to sequences
  const sequences: ValueSequence[] = []

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "object") {
      const keySequences = getKeysToLeaf(value).map(s => [key, ...s])
      sequences.push(...keySequences)
    }
    else {
      const keySequences = [[key, value]]
      sequences.push(...keySequences)
    }
  }

  return sequences
}

function getLine(sequence: ValueSequence): string {
  /**
   * Given sequence of [key1, key2, ..., color object] return
   * color_gray_16 = convert_hsl_to_colorshade(0, 0, 16)
   */

  const last = sequence.pop()
  const keys = sequence
  const variableName = keys.map(s => s.toString().replace('-', '_')).join('_')
  let variableValue

  if (typeof last === "object") {
    const hsla = last as HSLA
    variableValue = `convert_hsl_to_colorshade(${hsla.h.toFixed(0)}, ${hsla.s.toFixed(0)}, ${hsla.l.toFixed(0)})`
  }
  else {
    variableValue = last
  }

  return `${variableName} = ${variableValue}`
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
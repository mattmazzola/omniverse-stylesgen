import { FileDescription, FileGroup } from "./types"
import { deepMerge, rgbaToHsla, rgbToHex } from "./utilities"
import { template as colorsTemplate } from "./templates/colors"

export async function processCollection(collection: VariableCollection) {
  const files = []

  if (collection.name.toLowerCase().includes("primitives")) {
    const primativeFiles = await getPrimativesFiles(collection)
    files.push(...primativeFiles)
  }

  return files
}

function serializeData(root_type: string) {
  return async function innerSerialize(data: object): Promise<string> {
    let serializedData = ''

    for (const [key, value] of Object.entries(data)) {
      const [color_hue, color_value_lines] = getLines(value)
      const full_lines = color_value_lines.map(l => `${root_type}_${key}_${l}`)
      serializedData += `color_hue = ${color_hue}\n`
      serializedData += full_lines.join("\n") + "\n"
    }

    return `
${serializedData}

${colorsTemplate}
`
  }
}

function getLines(data: object): [number, string[]] {
  const lines = []
  let hue = 0

  let line = ``
  debugger

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
        const { r, g, b, a } = value["$rgba"]
        const rInt = Math.round(r * 255)
        const gInt = Math.round(g * 255)
        const bInt = Math.round(b * 255)
        const { h, s, l } = rgbaToHsla(r, g, b, a)
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
      serializer: serializeData("color"),
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
      serializer: serializeData("structure"),
    }
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
        if (typeof rgba !== "object") {
          throw new Error(`Expected RGBA to be object, but got ${typeof rgba}. Variable: ${name} Value: ${value}`)
        }

        obj.$rgba = rgba
        obj.$value = rgbToHex(rgba)
      } else {
        obj.$value = value
      }
    }
  }

  return rootObj
}
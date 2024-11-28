import { rgbToHex } from "./utilities"

export async function processCollection({ name, modes, variableIds }: { name: string, modes: any[], variableIds: string[] }) {
    const files = []
    for (const mode of modes) {
      const file = { fileName: `${name}.${mode.name}.tokens.json`, body: {} }
      for (const variableId of variableIds) {
        const variable: Variable = await figma.variables.getVariableByIdAsync(variableId)
        const { name, resolvedType, valuesByMode } = variable
  
        const value = valuesByMode[mode.modeId]
        if (value !== undefined && ["COLOR", "FLOAT"].includes(resolvedType)) {
          let obj: any = file.body
          
          name.split("/").forEach((groupName) => {
            obj[groupName] = obj[groupName] || {}
            obj = obj[groupName]
          })
          
          obj.$type = resolvedType === "COLOR" ? "color" : "number"
          if (value.type === "VARIABLE_ALIAS") {
            const currentVar: Variable = await figma.variables.getVariableByIdAsync(
              value.id
            )
            obj.$value = `{${currentVar.name.replace(/\//g, ".")}}`
          } else {
            if (resolvedType === "COLOR") {
                const rgba: RGBA = value
                obj.$value = rgbToHex(rgba)
            } else {
                obj.$value = value
            }
          }
        }
      }
      files.push(file)
    }
    return files
  }
  
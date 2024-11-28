import { Language } from "./types"
import { onPreferencesChanged, onGenerate } from "./callbacks"

if (figma.mode === "codegen") {
  figma.codegen.on("preferenceschange", onPreferencesChanged)
  figma.showUI(__html__, { visible: false })

  figma.codegen.on("generate", onGenerate)
}

import { onPreferencesChanged, onGenerate } from "./callbacks"

if (figma.mode === "codegen") {
  figma.codegen.on("preferenceschange", onPreferencesChanged)
  figma.codegen.on("generate", onGenerate)
  figma.showUI(__html__, { visible: false })
}

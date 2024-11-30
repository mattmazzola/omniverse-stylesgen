import prettier from "prettier/esm/standalone.mjs"
import parserBabel from "prettier/esm/parser-babel.mjs"
import parserHTML from "prettier/esm/parser-html.mjs"
import parserCSS from "prettier/esm/parser-postcss.mjs"
import JSZip from "jszip"

const MessageEvents = {
  FORMAT: "FORMAT",
  FORMAT_RESULT: "FORMAT_RESULT",
  PREFERENCES_CHANGED: "PREFERENCES_CHANGED",
}

const PRINT_WIDTH = 50

function formatCode({ language, code, printWidth = PRINT_WIDTH }) {
  switch (language) {
    case "HTML":
      return prettier.format(code, {
        printWidth,
        parser: "html",
        plugins: [parserHTML],
        htmlWhitespaceSensitivity: "ignore",
        bracketSameLine: false,
      })
    case "CSS":
      return prettier.format(code, {
        printWidth,
        parser: "css",
        plugins: [parserCSS],
      })
    case "JSON":
      return JSON.stringify(JSON.parse(code), null, 2)
    case "JAVASCRIPT":
    case "TYPESCRIPT":
      return prettier.format(code, {
        printWidth,
        parser: "babel-ts",
        plugins: [parserBabel],
        semi: true,
      })
  }
}

function onFormatMessage(pluginMessage) {
  const result = formatCode(pluginMessage)
  parent.postMessage(
    {
      pluginMessage: {
        event: MessageEvents.FORMAT_RESULT,
        id: pluginMessage.id,
        result,
      },
    },
    "*"
  )
}

async function onPreferencesChangeMessage(pluginMessage) {
  const downloadButton = document.getElementById("download")
  console.log({ downloadButton })

  const zip = new JSZip()
  pluginMessage.files.forEach(file => {
    const { name, data, serializedData } = file
    zip.file(name, serializedData)
  })

  const filesBlob = await zip.generateAsync({ type: "blob" })
  const url = URL.createObjectURL(filesBlob)
  const a = document.createElement("a")
  a.href = url
  a.download = "files.zip"
  a.click()
}

const messageEventToHandler = {
  [MessageEvents.FORMAT]: onFormatMessage,
  [MessageEvents.PREFERENCES_CHANGED]: onPreferencesChangeMessage,
}

window.onmessage = (message) => {

  console.log("UI.onmessage", { message })

  const { data: { pluginMessage } } = message
  if (!pluginMessage) {
    console.log("Message did not contain pluginMessage!")
    return
  }

  const messageHandler = messageEventToHandler[pluginMessage.event]
  console.log({ messageHandler })
  if (messageHandler) {
    messageHandler(pluginMessage)
  }
};


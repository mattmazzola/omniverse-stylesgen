import JSZip from "jszip"

const MessageEvents = {
  PREFERENCES_CHANGED: "PREFERENCES_CHANGED",
}


async function onPreferencesChangeMessage(pluginMessage) {

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


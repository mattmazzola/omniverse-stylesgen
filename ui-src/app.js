import JSZip from "jszip"

const MessageEvents = {
  PREFERENCES_CHANGED: "PREFERENCES_CHANGED",
}

async function onPreferencesChangeMessage(pluginMessage) {

  const zip = new JSZip()
  pluginMessage.files.forEach(file => {
    const { name, data } = file
    zip.file(name, data)
  })

  async function simulateDownload() {
    const filesBlob = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(filesBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = "omniverse_design_files.zip"
    a.click()
  }

  const downloadButton = document.getElementById("download")
  downloadButton.onclick = simulateDownload
}

const messageEventToHandler = {
  [MessageEvents.PREFERENCES_CHANGED]: onPreferencesChangeMessage,
}

function onMessageEvent(message) {
  console.debug("UI.onmessage", { message })

  // Get plugin message from the event
  // Note: Figma sends messages without data so we must check before processing
  const { data: { pluginMessage } } = message
  if (!pluginMessage) {
    console.log("Message did not contain pluginMessage!")
    return
  }

  const messageHandler = messageEventToHandler[pluginMessage.event]
  if (messageHandler) {
    messageHandler(pluginMessage)
  }
  else {
    console.warn(`No handler for event: ${pluginMessage.event}`)
  }
}

window.onmessage = onMessageEvent


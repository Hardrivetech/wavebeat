const { contextBridge, ipcRenderer } = require('electron')

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electronAPI', {
  // Renderer to main:
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
})

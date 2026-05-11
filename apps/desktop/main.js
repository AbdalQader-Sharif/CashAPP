const { app, BrowserWindow } = require('electron')
const { spawn } = require('node:child_process')
const path = require('node:path')

let mainWindow
let serverProcess

function startServer() {
  const serverFile = app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked', '..', '..', 'apps', 'server', 'dist', 'server.js')
    : path.join(__dirname, '..', 'server', 'src', 'server.ts')

  const command = app.isPackaged ? 'node' : 'npx'
  const args = app.isPackaged ? [serverFile] : ['tsx', serverFile]
  serverProcess = spawn(command, args, {
    cwd: app.isPackaged ? process.resourcesPath : path.join(__dirname, '..', '..'),
    stdio: 'ignore',
    shell: true
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'BrewPoint POS'
  })

  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '..', 'client', 'dist', 'index.html')}`
  mainWindow.loadURL(startUrl)
}

app.whenReady().then(() => {
  startServer()
  createWindow()
})

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill()
  if (process.platform !== 'darwin') app.quit()
})

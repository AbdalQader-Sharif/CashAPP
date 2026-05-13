const { app, BrowserWindow, dialog } = require('electron')
const fs = require('node:fs')
const { spawn } = require('node:child_process')
const path = require('node:path')

let mainWindow
let serverProcess

function startServer() {
  const serverFile = app.isPackaged
    ? path.join(process.resourcesPath, 'apps', 'server', 'dist', 'server.js')
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

  const devUrl = process.env.ELECTRON_START_URL
  if (devUrl) {
    mainWindow.loadURL(devUrl)
    return
  }

  if (!app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'))
    return
  }

  const appPath = app.getAppPath()
  const packagedCandidates = [
    path.join(appPath, 'apps', 'client', 'dist', 'index.html'),
    path.join(appPath, 'client', 'dist', 'index.html'),
    path.join(process.resourcesPath, 'apps', 'client', 'dist', 'index.html'),
    path.join(process.resourcesPath, 'client', 'dist', 'index.html')
  ]
  const indexPath = packagedCandidates.find((candidate) => fs.existsSync(candidate))
  if (!indexPath) {
    const message = `Packaged client index.html not found. Attempted paths:\n- ${packagedCandidates.join('\n- ')}\n\nVerify the desktop build output and packaging configuration includes the client dist bundle.`
    console.error(message)
    dialog.showErrorBox('BrewPoint POS - Missing UI Bundle', message)
    app.quit()
    return
  }
  mainWindow.loadFile(indexPath)
}

app.whenReady().then(() => {
  startServer()
  createWindow()
})

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill()
  if (process.platform !== 'darwin') app.quit()
})

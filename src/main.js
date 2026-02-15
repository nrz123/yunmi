const { app, BrowserWindow, Menu, session, ipcMain, dialog, net, shell, WebContentsView } = require('electron')
const path = require('path');
const Excel = require('exceljs')
const fs = require('fs')
const crypto = require('crypto')
const { Run } = require('./run.js')
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg')
const ffmpeg = require('fluent-ffmpeg')
ffmpeg.setFfmpegPath(ffmpegInstaller.path.replace('app.asar', 'app.asar.unpacked'))
if (!app.requestSingleInstanceLock()) app.quit()
app.commandLine.appendSwitch('disable-site-isolation-trials')
app.commandLine.appendSwitch("disable-web-security")
app.commandLine.appendSwitch('ignore-certificate-errors')
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors')
app.commandLine.appendSwitch('disable-features', 'UserAgentClientHint')
app.commandLine.appendSwitch('disable-blink-features', 'AutomationControlled')
app.commandLine.appendSwitch('enable-gpu-rasterization')
app.commandLine.appendSwitch('ignore-gpu-blocklist')
Menu.setApplicationMenu(null)
let password = ''
let protocal = 'http://'
let serverHost = '127.0.0.1:80'
let single = false
let downloaddir = 'download'
let appPath = app.getAppPath()
let login = () => net.fetch(protocal + serverHost + '/users/login', {
  method: "POST",
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    password: password
  })
}).then(res => res.json())
ipcMain.on('downloaddir', event => event.returnValue = app.isPackaged ? path.dirname(app.getPath('exe')) : appPath + '/' + downloaddir)
ipcMain.on('protocal', event => event.returnValue = protocal)
ipcMain.on('serverHost', event => event.returnValue = serverHost)
ipcMain.on('password', event => event.returnValue = password)
ipcMain.on('single', event => event.returnValue = single)
ipcMain.on('setCookie', (event, cookie) => session.defaultSession.cookies.set(cookie))
ipcMain.on('openWeb', (event, path) => new BrowserWindow({
  width: 800,
  height: 500,
  alwaysOnTop: true,
  webPreferences: {
    webSecurity: false,
    nodeIntegration: true,
    contextIsolation: false,
    backgroundThrottling: false,
  }
}).webContents.loadURL(path))
ipcMain.on('quit', event => app.quit())
ipcMain.on('external', (event, url) => shell.openExternal(url))
ipcMain.handle('fetch', (event, url, options) => net.fetch(url, options).then(res => res.json()))
let init = async () => {
  let cookies = await session.defaultSession.cookies.get({ url: "http://127.0.0.1:52126" })
  cookies.forEach(cookie => {
    if (cookie.name == 'protocal') protocal = cookie.value
    if (cookie.name == 'password') password = cookie.value
    if (cookie.name == 'serverHost') serverHost = cookie.value
  })
}
let webContentsSet = new Set()
let createWindow = () => {
  const win = new BrowserWindow({
    width: 1600,
    height: 1000,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false,
    }
  })
  let viewMap = {}
  win.on('resize', () => {
    const bounds = win.getBounds()
    win.contentView.children.forEach(view => {
      view.setBounds({
        ...view.getBounds(),
        height: bounds.height - 152
      })
    })
  })
  ipcMain.handle('viewManage', (event, id, type, ...args) => {
    let view = viewMap[id]
    if (!view || view.webContents.isDestroyed()) {
      switch (type) {
        case 'viewShow': {
          view = viewMap[id] = new WebContentsView({
            webPreferences: {
              webSecurity: false,
              backgroundThrottling: false,
              sandbox: true,
              plugins: true,
              partition: id,
              disableDialogs: true,
              contextIsolation: false,
              preload: appPath + '/src/preload.js'
            }
          })
          view.viewMode = true
          webContentsSet.add(view.webContents)
          view.webContents.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"
          )
          view.webContents.on('destroyed', () => {
            webContentsSet.delete(view.webContents)
          })
          view.webContents.on('ipc-message', (event, channel, value) => {
            if (channel == 'XPath') {
              win.webContents.send('XPath-' + id, value)
            }
            if (channel == 'setListener') {
              view.viewMode && view.webContents.executeJavaScript('window.runApi.SetListener()')
            }
          })
          view.webContents.setWindowOpenHandler(detail => {
            const { url, referrer, postBody } = detail
            const loadOptions = { httpReferrer: referrer }
            if (postBody != null) {
              const { data, contentType, boundary } = postBody
              loadOptions.postData = data
              loadOptions.extraHeaders = `content-type: ${contentType}; boundary=${boundary}`
            }
            view.webContents.loadURL(url, loadOptions)
            return { action: 'deny' }
          })
          view.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
            if (view.webContents) details.requestHeaders['User-Agent'] = view.webContents.getUserAgent()
            details.requestHeaders['Sec-CH-UA'] = '"Google Chrome";v="137", "Chromium";v="137"'
            details.requestHeaders['Sec-CH-UA-Platform'] = '"Windows"'
            callback({ requestHeaders: details.requestHeaders })
          })
          view.webContents.on('did-finish-load', e => view.viewMode && view.webContents.executeJavaScript('window.runApi.SetListener()'))
          view.webContents.on('did-frame-finish-load', e => view.viewMode && view.webContents.executeJavaScript('window.runApi.SetListener()'))
        } break
        default: return
      }
    }
    switch (type) {
      case 'viewShow': {
        win.contentView.addChildView(view)
      } break
      case 'viewResize': {
        view.setBounds({ ...view.getBounds(), ...args[0] })
      } break
      case 'viewHide': {
        win.contentView.removeChildView(view)
      } break
      case 'viewRemove': {
        win.contentView.removeChildView(view)
        view.webContents.destroy()
        delete viewMap[id]
      } break
      case 'devTools': {
        view.webContents.isDevToolsOpened() ? view.webContents.closeDevTools() : view.webContents.openDevTools()
      } break
      case 'viewEnter': {
        let array = Array.from(args[0])
        args[1] && array.push('Enter')
        let f = () => {
          let t = array.shift()
          if (!t) return
          view.webContents.sendInputEvent({ type: "keyDown", keyCode: t })
          view.webContents.sendInputEvent({ type: "char", keyCode: t })
          view.webContents.sendInputEvent({ type: "keyUp", keyCode: t })
          setTimeout(f, 100)
        }
        f()
      } break
      case 'setCookies': return Promise.all(args[0].map(cookie => view.webContents.session.cookies.set(cookie)))
      case 'clearCookies': return view.webContents.session.clearStorageData({ storages: ['cookies'] })
      case 'viewCookies': {
        let url = view.webContents.getURL()
        return view.webContents.session.cookies.get({ url: url }).then(cookies => cookies.map(cookie => {
          return { url: url, ...cookie }
        }))
      }
      case 'viewMode': {
        view.viewMode = args[0]
        view.webContents.executeJavaScript(view.viewMode ? 'window.runApi.SetListener()' : 'window.runApi.ClearListener()')
      } break
      case 'setProxy': {
        view.webContents.session.setProxy({ proxyRules: args[0] })
      } break
      case 'setUserAgent': {
        view.webContents.setUserAgent(args[0])
      } break
      default: return view.webContents[type](...args)
    }
  })
  win.webContents.session.webRequest.onBeforeSendHeaders({ urls: ['ws://*/*', 'wss://*/*'] }, async (details, callback) => {
    let cookies = await session.defaultSession.cookies.get({ url: details.url })
    details.requestHeaders['Cookie'] = ''
    cookies.forEach(cookie => {
      details.requestHeaders['Cookie'] += (cookie.name + '=' + cookie.value + ';')
    })
    callback({ requestHeaders: details.requestHeaders })
  })
  win.webContents.loadURL(app.isPackaged ? 'file:///' + appPath + '/build/index.html' : 'http://127.0.0.1:3000/')
  win.on('closed', () => app.quit())
  app.on('second-instance', (event, commandLine, workingDirectory) => win.focus())
}
let start = async () => {
  await init()
  const win = new BrowserWindow({
    width: 305,
    height: 450,
    resizable: false,
    scrollBounce: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false,
    }
  })
  win.webContents.on('ipc-message', (event, channel, value) => {
    if (channel == 'login') {
      protocal = value.protocal
      serverHost = value.serverHost
      password = value.password
      let date = Math.round(new Date().getTime() / 1000) + 30 * 24 * 60 * 60
      session.defaultSession.cookies.set({ url: "http://127.0.0.1:52126", name: 'protocal', value: protocal, expirationDate: date })
      session.defaultSession.cookies.set({ url: "http://127.0.0.1:52126", name: 'serverHost', value: serverHost, expirationDate: date })
      session.defaultSession.cookies.set({ url: "http://127.0.0.1:52126", name: 'password', value: password, expirationDate: date })
      login().then(data => {
        if (data == 'success') {
          console.log('登录成功')
          createWindow()
          win.destroy()
          return
        }
        console.log('登录失败')
        win.webContents.send('message', '登录失败')
      }).catch(e => {
        console.log('登录失败')
        win.webContents.send('message', '登录失败')
      })
    } else if (channel == 'single') {
      single = true
      createWindow()
      win.destroy()
    }
  })
  win.webContents.loadURL(app.isPackaged ? 'file:///' + appPath + '/build/index.html#login' : 'http://127.0.0.1:3000/#login')
}
app.whenReady().then(start)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    start()
  }
})
ipcMain.handle('export', (event, options) => dialog.showSaveDialog(options))
ipcMain.handle('import', (event, options) => dialog.showOpenDialog(options))
const importData = (id, datas) => net.fetch(serverHost + "/users/importData", {
  method: "POST",
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id: id,
    datas: datas
  })
})
ipcMain.on('excelImport', async (event, id, path) => {
  let workbookReader = new Excel.stream.xlsx.WorkbookReader(path, {
    worksheets: 'emit',
  })
  let datas = []
  let length = 0
  for await (const worksheetReader of workbookReader) {
    for await (const row of worksheetReader) {
      let data = []
      if (!length) length = row.values.length - 1
      for (let i = 0; i < length; i++)data[i] = row.values[i + 1] ? row.values[i + 1] : ''
      datas.push(data)
      if (row._number == 1) {
        await importData(id, datas)
        datas.length = 0
        continue
      }
      if (datas.length == 50) {
        importData(id, datas)
        datas.length = 0
      }
    }
  }
  if (datas.length > 0) {
    importData(id, datas)
    datas.length = 0
  }
})
const works = {}
ipcMain.handle('excelExport', (event, path, data, key) => new Promise(resolve => {
  if (!works[key]) {
    works[key] = {
      workbook: new Excel.stream.xlsx.WorkbookWriter({
        filename: path,
        useStyles: true,
        useSharedStrings: true
      })
    }
    works[key].worksheet = works[key].workbook.addWorksheet('sheet1')
  }
  const worksheet = works[key].worksheet
  data.forEach(d => worksheet.addRow(d).commit())
  resolve()
}))
ipcMain.handle('excelEnd', (event, key) => new Promise(resolve => {
  works[key] ? works[key].workbook.commit().then(() => resolve('success')) : resolve('error')
  works[key] = undefined
}))
ipcMain.handle('write', (event, filePath, data) => new Promise(resolve => fs.writeFile(filePath, data, e => { resolve(e ? 'error' : 'success') })))
ipcMain.handle('read', (event, filePath) => new Promise(resolve => fs.readFile(filePath, 'utf8', (e, data) => { resolve(e ? null : data) })))
let videoMap = {}
let vend = (webContents, fid) => {
  let fmap = videoMap[webContents]
  if (fmap) {
    let umap = fmap[fid]
    if (umap) {
      let f = ffmpeg()
      for (let uid in umap) {
        if (umap[uid]) {
          umap[uid].stream.end()
          f = f.input(downloaddir + '/' + fid + '/' + umap[uid].filename + '.mp4')
        }
      }
      f.outputOptions(['-c copy']).save(downloaddir + '/' + fid + '/0.mp4').on('end', () => {
        console.log('Merge done:')
      }).on('error', (err) => {
        console.error('ffmpeg merge error:')
      })
      delete fmap[fid]
    }
  }
}
ipcMain.on('videoend', (event, fid) => {
  vend(event.sender, fid)
})
ipcMain.on('video', (event, fid, uid, mimeType, buffer) => {
  let webContents = event.sender
  if (webContentsSet.has(webContents)) {
    event.returnValue = true
    return
  }
  if (!videoMap[webContents]) {
    videoMap[webContents] = {}
    webContents.on('destroyed', () => {
      let fmap = videoMap[webContents]
      if (fmap) {
        for (let fid in fmap) {
          vend(webContents, fid)
        }
        delete videoMap[webContents]
      }
    })
  }
  let fmap = videoMap[webContents]
  if (!fmap[fid]) {
    fmap[fid] = {}
  }
  let umap = fmap[fid]
  if (!umap[uid]) {
    fs.existsSync(downloaddir) || fs.mkdirSync(downloaddir)
    fs.existsSync(downloaddir + '/' + fid) || fs.mkdirSync(downloaddir + '/' + fid)
    const kind = mimeType.includes("audio") ? "audio" : mimeType.includes("video") ? "video" : "unknown"
    let filename = kind + Object.keys(umap).filter(key => {
      return umap[key].filename.includes(kind)
    }).length
    umap[uid] = { stream: fs.createWriteStream(downloaddir + '/' + fid + '/' + filename + '.mp4'), mimeType: mimeType, filename: filename }
  }
  let fBuffer = Buffer.from(buffer)
  umap[uid].stream.write(fBuffer)
  event.returnValue = true
})
let tasks = {}
ipcMain.on('runTask', (event, task) => {
  let win = new BrowserWindow({
    width: 1200,
    height: 800,
    resizable: false
  })
  let { id, step } = task
  step = JSON.parse(step)
  let run = tasks[id] = new Run(step, appPath + '/src/preload.js', id, win)
  run.log = console.log
  run.checkData = async () => {
    return false
  }
  win.on('closed', () => run.stop())
  run.on('data', data => {
    data.forEach(d => {
      if (d.type == 'IMG') {
        fs.existsSync(downloaddir) || fs.mkdirSync(downloaddir)
        let value = d.value
        value = value.substring(22)
        value = Buffer.from(value, 'base64')
        let fname = crypto.createHash('md5').update(value).digest('hex')
        d.value = fname + '.png'
        fs.writeFile(downloaddir + "/" + d.value, value, e => { })
      }
    })
    event.sender.send('saveData', id, data)
  })
  run.on('end', e => {
    delete tasks[id]
    run.removeAllListeners()
    event.sender.send('end', id)
  })
  run.start()
})
ipcMain.on('stopTask', (event, id) => {
  let run = tasks[id]
  run && run.stop()
})
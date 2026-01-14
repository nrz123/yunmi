const { WebContentsView } = require('electron')
const crypto = require('crypto')
const { encode } = require('urlencode')
const base64Encode = s => s ? Buffer.from(encode(s)).toString('base64') : ''
class Run extends require('events').EventEmitter {
    constructor(step, preload, id, win, bounds) {
        super()
        this.step = step
        this.preload = preload
        this.id = id
        this.win = win
        this.bounds = bounds ? bounds : { x: 0, y: 0, width: 1185, height: 762 }
        this.data = []
        this.head = []
        this.hashSet = new Set()
        let init = s => {
            s.nodeName == 'ExtractDataAction' && s.List.forEach(extract => this.head.push({ key: extract.key, name: extract.name, type: extract.type }))
            s.steps && s.steps.forEach(s => init(s))
        }
        init(this.step)
    }
    start = () => {
        this.log('start')
        this.data.length = 0
        this.initView()
        this.view.webContents.session.on('will-download', (event, item, webContents) => {
            event.preventDefault()
        })
        let end = e => {
            this.senddata()
            this.clear()
            this.emit('end', e)
        }
        this.isStop = undefined
        this.run(this.step).then(end).catch(end)
    }
    stop = () => {
        this.log('stop')
        this.isStop = true
        this.reject && this.reject()
    }
    senddata = () => this.data.map(d => d.value).find(d => d) && this.emit('data', this.head.map(h => {
        let d = this.data.find(d => d.key == h.key)
        return { value: d ? d.value : '', ...h }
    }))
    clear = () => {
        clearTimeout(this.timeout)
        clearTimeout(this.exectimeout)
        clearTimeout(this.entertimeout)
        if (this.view && this.view.webContents) {
            this.view.webContents.session.clearCache()
            this.view.webContents.session.clearStorageData()
            this.view.webContents.session.clearAuthCache()
            this.view.webContents.session.clearHostResolverCache()
            this.view.webContents.destroy()
        }
        this.win && !this.win.isDestroyed() && this.win.destroy()
    }
    initView = () => {
        this.view = new WebContentsView({
            webPreferences: {
                webSecurity: false,
                backgroundThrottling: false,
                offscreen: !this.win,
                sandbox: true,
                plugins: true,
                partition: this.id,
                disableDialogs: true,
                preload: this.preload,
                contextIsolation: false
            }
        })
        this.log('newview')
        this.step.proxy && this.view.webContents.session.setProxy({ proxyRules: this.step.proxy })
        this.view.webContents.setWindowOpenHandler(detail => {
            return { action: 'deny' }
        })
        this.step.userAgent && this.view.webContents.setUserAgent(this.step.userAgent ? this.step.userAgent : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36")
        this.view.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
            if (this.view.webContents) details.requestHeaders['User-Agent'] = this.view.webContents.getUserAgent()
            callback({ requestHeaders: details.requestHeaders })
        })
        this.win && !this.win.isDestroyed() && this.win.contentView.addChildView(this.view)
        this.view.setBounds(this.bounds)
    }
    exec = (script, view) => new Promise(resolve => {
        this.log('exec')
        if (!view) view = this.view
        let listener = null
        let end = ret => {
            view.webContents.removeListener('ipc-message', listener)
            clearTimeout(this.exectimeout)
            this.log('execend')
            resolve(ret)
        }
        listener = (event, channel) => {
            if (channel == 'refresh') {
                clearTimeout(this.exectimeout)
                this.exectimeout = setTimeout(end, 12000)
            }
        }
        listener(null, 'refresh')
        view.webContents.on('ipc-message', listener)
        view.webContents.executeJavaScript(script).then(end)
    })
    waitFinish = (time, next) => new Promise(resolve => {
        this.log('wait:' + time)
        let view = this.view
        let removeListener = () => {
            clearTimeout(this.timeout)
            if (!view.webContents) return
            view.webContents.setWindowOpenHandler(detail => {
                return { action: 'deny' }
            })
            view.webContents.removeAllListeners('did-start-loading')
            view.webContents.removeAllListeners('did-stop-loading')
            view.webContents.removeAllListeners('dom-ready')
            view.webContents.removeAllListeners('did-navigate-in-page')
            view.webContents.removeAllListeners('did-fail-load')
        }
        let end = error => {
            removeListener()
            next && view != this.view && view.webContents && view.webContents.destroy()
            this.log('error:' + error)
            resolve(error)
        }
        let loadfinish = error => {
            this.XPath = undefined
            end(error)
        }
        let ready
        view.webContents.setWindowOpenHandler(detail => {
            if (this.win && !this.win.isDestroyed()) {
                this.bounds = this.view.getBounds()
                this.win.contentView.removeChildView(this.view)
            }
            removeListener()
            this.initView()
            const { url, referrer, postBody } = detail
            const loadOptions = { httpReferrer: referrer }
            if (postBody != null) {
                const { data, contentType, boundary } = postBody
                loadOptions.postData = data
                loadOptions.extraHeaders = `content-type: ${contentType}; boundary=${boundary}`
            }
            this.waitFinish(time, true).then(loadfinish)
            this.view.webContents.loadURL(url, loadOptions)
            return { action: 'deny' }
        })
        view.webContents.on('did-start-loading', () => {
            clearTimeout(this.timeout)
            this.timeout = setTimeout(() => this.view.webContents.reload(), 10000)
        })
        view.webContents.on('did-stop-loading', () => {
            clearTimeout(this.timeout)
            this.timeout = setTimeout(loadfinish, ready ? 1000 : 4000)
        })
        view.webContents.on('dom-ready', () => {
            ready = true
            clearTimeout(this.timeout)
            this.timeout = setTimeout(loadfinish, 1000)
        })
        view.webContents.on('did-navigate-in-page', () => {
            ready = true
            clearTimeout(this.timeout)
            this.timeout = setTimeout(loadfinish, 1000)
        })
        view.webContents.on('did-fail-load', (event, error, errorDescription, validatedURL, isMainFrame, frameProcessId, frameRoutingId) => {
            if (isMainFrame) {
                clearTimeout(this.timeout)
                this.timeout = setTimeout(loadfinish, 1000, error)
            }
        })
        clearTimeout(this.timeout)
        this.timeout = setTimeout(end, time * 1000, 'timeout')
    })
    enterText = (text, enter) => new Promise(resolve => {
        this.log('enterText:' + text)
        let array = Array.from(text)
        enter && array.push('Enter')
        let f = () => {
            let t = array.shift()
            if (!t) return resolve()
            this.view.webContents.sendInputEvent({ type: "keyDown", keyCode: t })
            this.view.webContents.sendInputEvent({ type: "char", keyCode: t })
            this.view.webContents.sendInputEvent({ type: "keyUp", keyCode: t })
            this.entertimeout = setTimeout(f, 100)
        }
        f()
    })
    review = view => {
        this.log('review')
        if (this.view == view) return
        if (this.win && !this.win.isDestroyed()) {
            this.bounds = this.view.getBounds()
            this.win.contentView.removeChildView(this.view)
            this.win.contentView.addChildView(view)
            view.setBounds(this.bounds)
        }
        this.view.webContents.destroy()
        this.view = view
    }
    runSteps = steps => new Promise((resolve, reject) => {
        this.reject = reject
        if (steps) {
            let Judge = this.Judge
            let oldView = this.view
            let end = ret => {
                this.log('stepsend:' + ret)
                this.Judge = Judge
                this.review(oldView)
                resolve(ret)
            }
            let setReject = () => this.reject = e => {
                this.view != oldView && this.view.webContents && this.view.webContents.destroy()
                this.view = oldView
                reject(e)
            }
            let index = 0
            let f = () => {
                let step = steps[index++]
                if (step) {
                    let view = this.view
                    this.isStop || this.run(step).then(ret => {
                        this.log(step.nodeName + ':end:' + ret)
                        view != this.view && view != oldView && view.webContents && view.webContents.destroy()
                        setReject()
                        ret ? end(ret) : f()
                    }).catch(error => {
                        this.log('error:' + error)
                        view != this.view && view != oldView && view.webContents && view.webContents.destroy()
                        setReject()
                        this.reject(error)
                    })
                } else {
                    end()
                }
            }
            f()
        } else {
            resolve()
        }
    })
    run = step => new Promise((resolve, reject) => {
        let setReject = ret => { this.reject = reject; return ret }
        setReject()
        this.log(step.nodeName)
        switch (step.nodeName) {
            case 'NavigateAction': {
                step.RecList = []
                let index = 0
                let loop = () => {
                    if (this.isStop) return
                    let value
                    while (true) {
                        value = step.List[index++]
                        if (!value || !value.RecInvalids || value.RecInvalids.indexOf(this.RecAction ? this.RecAction.recursion : 0) == -1)
                            break
                    }
                    if (!value) value = step.RecList.shift()
                    if (value) {
                        let RecAction = this.RecAction
                        this.RecAction = step
                        this.RecAction.recursion = value.recursion ? value.recursion : 0
                        this.waitFinish(step.WaitSeconds == null ? 3 : step.WaitSeconds).then(error => error == 'timeout' ? loop() : this.isStop || this.runSteps(step.steps).then(setReject).then(ret => {
                            this.RecAction = RecAction
                            this.log(ret)
                            ret == 'Break' ? resolve() : loop()
                        }).catch(reject))
                        this.log('open:' + value.value)
                        this.view.webContents.loadURL(value.value)
                    } else {
                        resolve()
                    }
                }
                this.isStop || loop()
            } break
            case 'CookieAction': {
                let index = 0
                let loop = () => {
                    if (this.isStop) return
                    let value
                    while (true) {
                        value = step.List[index++]
                        if (!value || !value.RecInvalids || value.RecInvalids.indexOf(this.RecAction ? this.RecAction.recursion : 0) == -1)
                            break
                    }
                    value ? new Promise(resolve => {
                        step.Clear ? this.view.webContents.session.clearStorageData({ storages: ['cookies'] }).then(resolve) : resolve()
                    }).then(() => {
                        Promise.all(value.map(cookie => this.view.webContents.session.cookies.set(cookie))).then(() => {
                            this.isStop || this.runSteps(step.steps).then(setReject).then(ret => {
                                this.log(ret)
                                ret == 'Break' ? resolve() : loop()
                            }).catch(reject)
                        })
                    }) : resolve()
                }
                this.isStop || loop()
            } break
            case 'LoopAction': {
                let index = 0
                let loop = () => {
                    if (this.isStop) return
                    let ListBase64 = base64Encode(JSON.stringify(step.List.map(x => x.RecInvalids && x.RecInvalids.indexOf(this.RecAction ? this.RecAction.recursion : 0) > -1 ? '' : [this.XPath, x.value].join(''))))
                    let code = `window.runApi.XPaths('${ListBase64}')`
                    this.exec(code).then(XPaths => {
                        if (!XPaths) return resolve()
                        let XPath = XPaths[index++]
                        if (XPath) {
                            [XPath, this.XPath] = [this.XPath, XPath]
                            this.log('xpah:' + [this.XPath, XPath].join(''))
                            this.isStop || this.runSteps(step.steps).then(setReject).then(ret => {
                                [XPath, this.XPath] = [this.XPath, XPath]
                                this.log(ret)
                                ret == 'Break' ? resolve() : loop()
                            }).catch(reject)
                        } else {
                            resolve()
                        }
                    }).catch(reject)
                }
                this.isStop || loop()
            } break
            case 'EnterTextAction': {
                let index = 0
                let loop = () => {
                    if (this.isStop) return
                    let value
                    while (true) {
                        value = step.List[index++]
                        if (!value || !value.RecInvalids || value.RecInvalids.indexOf(this.RecAction ? this.RecAction.recursion : 0) == -1)
                            break
                    }
                    if (value) {
                        this.log('xpah:' + [this.XPath, step.XPath].join(''))
                        let XPathBase64 = base64Encode([this.XPath, step.XPath].join(''))
                        let operasBase64 = base64Encode(JSON.stringify(['mouseover', 'mousedown', 'click', 'mouseup', 'change']))
                        let code = `window.runApi.Opera('${XPathBase64}','${operasBase64}')`
                        this.exec(code).then(() => this.enterText(value.value, step.Enter).then(() => {
                            this.isStop || this.runSteps(step.steps).then(setReject).then(ret => {
                                this.log(ret)
                                ret == 'Break' ? resolve() : loop()
                            }).catch(reject)
                        }).catch(reject)).catch(reject)
                    } else {
                        resolve()
                    }
                }
                this.isStop || loop()
            } break
            case 'ClickAction': {
                this.log('xpah:' + [this.XPath, step.XPath].join(''))
                let XPathBase64 = base64Encode([this.XPath, step.XPath].join(''))
                let operasBase64 = base64Encode(JSON.stringify(['mouseover', 'mousedown', step.Right ? 'contextmenu' : 'click', 'mouseup', 'change']))
                let code = `window.runApi.Opera('${XPathBase64}','${operasBase64}')`
                this.waitFinish(step.WaitSeconds == null ? 3 : step.WaitSeconds).then(error => {
                    this.Judge = error != 'timeout'
                    resolve()
                })
                this.exec(code).catch(reject)
            } break
            case 'ExtractDataAction': {
                let code = `window.runApi.Datas('${base64Encode(JSON.stringify(step.List))}','${base64Encode(this.XPath)}')`
                this.exec(code).then(async data => {
                    if (data.length == 0) return resolve()
                    data = await Promise.all(data.map(async d => {
                        let { key, value, recursion, regs } = d
                        regs && regs.forEach(reg => {
                            let { source, target } = reg
                            try { value = value.replace(new RegExp(source ? source : '', 'img'), target ? target : '') } catch { }
                        })
                        if (recursion && value && this.RecAction && this.RecAction.recursion < recursion) {
                            this.RecAction.RecList.push({ value: value, recursion: this.RecAction.recursion + 1 })
                        }
                        return { key: key, value: value }
                    }))
                    if (step.Isduplicate) {
                        let hash = crypto.createHash('md5').update(data.map(d => d.value).join()).digest('hex')
                        this.Judge = !this.hashSet.has(hash)
                        if (!this.Judge) return resolve()
                        this.hashSet.add(hash)
                    }
                    if (step.IsAppend) {
                        data.forEach(d => {
                            let td = this.data.find(t => t.key == d.key)
                            td ? td.value = td.value + '\n' + d.value : this.data.push(d)
                        })
                    } else {
                        let index = this.data.findIndex(t => t.key == data[0].key)
                        if (index > -1) {
                            this.senddata()
                            this.data.length = index
                        }
                        this.data = this.data.concat(data)
                    }
                    resolve()
                }).catch(reject)
            } break
            case 'WaitAction': {
                let LoopTime = step.LoopTime ? step.LoopTime : 1
                let loop = () => this.isStop || this.runSteps(step.steps).then(setReject).then(ret => ret == 'Break' ? resolve() : this.timeout = setTimeout(() => --LoopTime ? loop() : resolve(), 1000 * (step.WaitSeconds ? step.WaitSeconds : 0))).catch(reject)
                loop()
            } break
            case 'EditAction': {
                this.log('xpah:' + [this.XPath, step.XPath].join(''))
                this.exec(`window.runApi.Edit('${base64Encode(JSON.stringify(step.List))}','${base64Encode([this.XPath, step.XPath].join(''))}')`).then(resolve).catch(reject)
            } break
            case 'PageAction': {
                this.waitFinish(step.WaitSeconds == null ? 1 : step.WaitSeconds).then(() => resolve()).catch(reject)
                this.log(step.Type)
                switch (step.Type) {
                    case 'Scroll': this.exec('window.scrollBy(0,document.documentElement.clientHeight)').catch(reject); break
                    case 'Back': this.exec('window.history.back()').catch(reject); break
                    case 'Reload': this.view.webContents.reload(); break
                }
            } break
            case 'BranchAction': {
                this.log('last:' + this.Judge)
                new Promise(resolve => {
                    if (this.Judge && step.Else) {
                        resolve(false)
                    } else if (step.CheckData) {
                        this.checkData().then(resolve)
                    } else {
                        this.log('xpah:' + [this.XPath, step.XPath].join(''))
                        let XPathBase64 = base64Encode(JSON.stringify([[this.XPath, step.XPath].join('')]))
                        let code = `window.runApi.XPaths('${XPathBase64}')`
                        this.exec(code).then(XPaths => resolve(XPaths && XPaths.length > 0)).catch(reject)
                    }
                }).then(Judge => {
                    this.log('judge:' + Judge)
                    this.Judge = Judge
                    this.Judge ? this.isStop || this.runSteps(step.steps).then(setReject).then(resolve).catch(reject) : resolve()
                }).catch(reject)
            } break
            case 'QuitAction': step.Type == 'End' ? reject() : resolve(step.Type); break
            default: this.isStop || this.runSteps(step.steps).then(setReject).then(resolve).catch(reject); break
        }
    })
}
exports.Run = Run
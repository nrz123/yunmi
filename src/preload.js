const { ipcRenderer } = require('electron')
delete window.process
window.chrome = { runtime: {} }
Object.defineProperty(navigator, 'webdriver', { get: () => false })
Object.defineProperty(navigator, 'platform', { get: () => 'Win32' })
Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.' })
Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 })
Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 })
const getParameter = WebGLRenderingContext.prototype.getParameter
WebGLRenderingContext.prototype.getParameter = function (param) {
    if (param === 37445) return 'Intel Inc.'
    if (param === 37446) return 'Intel Iris OpenGL Engine'
    return getParameter.call(this, param)
}
const getNodes = xpath => {
    let result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
    let arr = []
    for (var i = 0; i < result.snapshotLength; i++) {
        arr.push(result.snapshotItem(i))
    }
    return arr
}
let nodeXPath = node => {
    let XPath = []
    for (let p = node; p != document; p = p.parentNode) {
        let children = p.parentNode.children
        let index = 1
        for (let i = 0; i < children.length; i++) {
            if (children[i] == p) break
            if (children[i].tagName == p.tagName) index++
        }
        const { tagName, id, className } = p
        XPath.unshift({ tagName: tagName, index: index, id: id, className: typeof (className) == 'string' ? className.split(' ').filter(x => x) : [] })
    }
    return XPath
}
let toXPath = XPath => {
    let xs = []
    let s = ''
    XPath.forEach(x => {
        s = x.id ? '//' + x.tagName + '[' + '@id="' + x.id + '"]' : s + '/' + x.tagName + (x.index ? '[' + x.index + ']' : '')
    })
    if (s) xs.push(s)
    return xs.join('')
}
let selects = new Set()
let similarity = new Set()
let absXPaths = []
let loopXPath = []
let relXPaths = []
let useLoop
let equalXPath = (a, b) => {
    if (a.length != b.length) return false
    let equal = true
    for (let i = 0; i < a.length; i++) {
        if (a[i].tagName != b[i].tagName || a[i].index != b[i].index) {
            equal = false
            break
        }
    }
    return equal
}
let initloop = () => {
    loopXPath.length = 0
    if (absXPaths[0]) {
        let len
        for (let j = 0; j < absXPaths[0].length; j++) {
            let { tagName, index, id, className } = absXPaths[0][j]
            for (let i = 0; i < absXPaths.length; i++) {
                let XPath = absXPaths[i]
                if (j == XPath.length) {
                    tagName = undefined
                    break
                }
                tagName = tagName == XPath[j].tagName ? tagName : undefined
                index = index == XPath[j].index ? index : undefined
                id = id == XPath[j].id ? id : undefined
                className = className.filter(c => XPath[j].className.indexOf(c) > -1)
            }
            if (tagName == undefined) break
            if (index == undefined) len = j + 1
            loopXPath.push({ tagName: tagName, index: index, id: id, className: className })
        }
        if (len) loopXPath.length = len
    }
}
let stopevent = e => {
    e.stopPropagation()
    e.preventDefault()
    return false
}
let mouseover = e => {
    if (!document.browserMode) {
        let target = e.target
        if (target && !selects.has(target)) {
            if (!similarity.has(target)) target.cssText = target.style.cssText
            target.style.cssText = target.cssText + 'background-image: radial-gradient(ellipse, rgba(51, 186, 255, 0.5), rgba(71, 180, 234, 0.5));'
        }
        return stopevent(e)
    }
}
let mouseout = e => {
    if (!document.browserMode) {
        let target = e.target
        if (target && !selects.has(target)) {
            target.style.cssText = target.cssText + (similarity.has(target) ? 'background-color:#FFEDED;outline:1px #FF5050 dashed;' : '')
        }
        return stopevent(e)
    }
}
let click = e => {
    if (!document.browserMode) {
        let target = e.target
        stopevent(e)
        if (!selects.has(target)) {
            selects.add(target)
            target.style.cssText = target.cssText + 'background-color:#E5F5E9;outline:1px #00A23B solid;'
            let XPath = nodeXPath(target)
            if (similarity.has(target)) {
                useLoop = true
                similarity.forEach(node => {
                    node.style.cssText = node.cssText + 'background-color:#E5F5E9;outline:1px #00A23B solid;'
                    selects.add(node)
                })
                similarity.clear()
                let len = loopXPath.length
                absXPaths.forEach(XPath => {
                    XPath.splice(0, len)
                    if (!relXPaths.find(x => equalXPath(XPath, x))) relXPaths.push(XPath)
                })
                absXPaths.length = 0
            } else {
                if (useLoop) {
                    let isloop = XPath.length >= loopXPath.length
                    if (isloop) {
                        for (let i = 0; i < loopXPath.length; i++) {
                            let xn = XPath[i]
                            let ln = loopXPath[i]
                            if (xn.tagName != ln.tagName || (ln.index && ln.index != xn.index) || (!ln.index && ln.className.length > 0 && ln.className.filter(x => xn.className.indexOf(x) > -1).length == 0)) {
                                isloop = false
                                break
                            }
                        }
                    }
                    if (isloop) {
                        XPath.splice(0, loopXPath.length)
                        relXPaths.push(XPath)
                        getNodes(toXPath([...loopXPath, ...XPath])).forEach(node => {
                            if (!selects.has(node)) {
                                selects.add(node)
                                node.cssText = node.style.cssText
                                node.style.cssText = node.cssText + 'background-color:#E5F5E9;outline:1px #00A23B solid;'
                            }
                        })
                    } else {
                        absXPaths.push(XPath)
                    }
                } else {
                    absXPaths.push(XPath)
                    initloop()
                    similarity.forEach(node => node.style.cssText = node.cssText)
                    similarity.clear()
                    absXPaths.forEach(abs => {
                        let rel = abs.slice(loopXPath.length, abs.length)
                        getNodes(toXPath([...loopXPath, ...rel])).forEach(node => {
                            if (!selects.has(node) && !similarity.has(node)) {
                                similarity.add(node)
                                node.cssText = node.style.cssText
                                node.style.cssText = node.cssText + 'background-color:#FFEDED;outline:1px #FF5050 dashed;'
                            }
                        })
                    })
                }
            }
            ipcRenderer.send('XPath', { absXPaths: absXPaths.map(abs => toXPath(abs)), loopXPath: toXPath(loopXPath), relXPaths: relXPaths.map(rel => toXPath(rel)), useLoop: useLoop })
        }
        return false
    }
}
let clear = () => {
    selects.forEach(x => x.style.cssText = x.cssText)
    selects.clear()
    similarity.forEach(x => x.style.cssText = x.cssText)
    similarity.clear()
    absXPaths.length = 0
    loopXPath.length = 0
    relXPaths.length = 0
    useLoop = undefined
}
let setListener = document => {
    document.removeEventListener('mouseover', mouseover, true)
    document.removeEventListener('mouseout', mouseout, true)
    document.removeEventListener('click', click, true)
    document.addEventListener('mouseover', mouseover, true)
    document.addEventListener('mouseout', mouseout, true)
    document.addEventListener('click', click, true)
}
let removeListener = document => {
    document.removeEventListener('mouseover', mouseover, true)
    document.removeEventListener('mouseout', mouseout, true)
    document.removeEventListener('click', click, true)
}
let clearListener = document => {
    clear()
    removeListener(document)
}
let base64Decode = s => s ? decodeURIComponent(window.atob(s)) : ''
function e() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
function guid() {
    return (e() + e() + e() + e() + e() + e() + e() + e());
}
let uMap = {}
let createObjectURL = URL.createObjectURL
URL.createObjectURL = function (obj) {
    let url = createObjectURL.apply(this, arguments)
    if (obj instanceof MediaSource) {
        let fid = uMap[url] = guid()
        let addSourceBuffer = obj.addSourceBuffer
        obj.addSourceBuffer = function (mimeType) {
            let sb = addSourceBuffer.apply(this, arguments)
            let uid = guid()
            let appendBuffer = sb.appendBuffer
            sb.appendBuffer = function (source) {
                ipcRenderer.sendSync('video', fid, uid, mimeType, source)
                return appendBuffer.apply(this, arguments)
            }
            return sb
        }
        let isTypeSupported = obj.isTypeSupported
        obj.isTypeSupported = function (mimeType) {
            if (mimeType.includes("mp4a.40.5")) {
                console.warn("Blocking HE-AAC, forcing fallback to AAC-LC");
                return false
            }
            return isTypeSupported.apply(this, arguments)
        }
    }
    return url
}
window.runApi = {
    SetListener: () => setListener(document),
    ClearListener: () => clearListener(document),
    Clear: () => clear(),
    XPaths: ListBase64 => {
        let List = JSON.parse(base64Decode(ListBase64))
        let XPaths = []
        List.forEach(XPath => XPath ? XPaths.push(...getNodes(XPath).map(node => {
            let x = ''
            for (let p = node; p != document; p = p.parentNode) {
                let children = p.parentNode.children
                let index = 1
                for (let i = 0; i < children.length; i++) {
                    if (children[i] == p) break
                    if (children[i].tagName == p.tagName) index++
                }
                x = '/' + p.tagName + '[' + index + ']' + x
            }
            return x
        })) : undefined)
        return XPaths
    },
    Edit: (ListBase64, XPathBase64) => {
        let node = getNodes(base64Decode(XPathBase64))[0]
        if (!node) return
        JSON.parse(base64Decode(ListBase64)).forEach(item => { node[item.name] = item.value })
    },
    Datas: (ListBase64, XPathBase64, reqType) => Promise.all(JSON.parse(base64Decode(ListBase64)).map(async extract => {
        let XPath = base64Decode(XPathBase64)
        let value = ''
        let valueType = 'value'
        let type = extract.type
        switch (type) {
            case 'URL': value = window.location.href; break
            case 'Source': value = document.documentElement.outerHTML; break
            case 'Value': value = extract.value; break
            case 'Title': value = document.title; break
            case 'Time': value = Date(); break
            default: {
                let node = getNodes([XPath, extract.XPath].join(''))[0]
                if (node) {
                    switch (type) {
                        case 'Text': value = node.innerText; break
                        case 'IMG': {
                            if (node.tagName == 'IMG') {
                                let canvas = document.createElement('canvas')
                                canvas.height = node.naturalHeight
                                canvas.width = node.naturalWidth
                                canvas.getContext('2d').drawImage(node, 0, 0)
                                value = canvas.toDataURL()
                            } else if (node.tagName == 'VIDEO') {
                                let canvas = document.createElement('canvas')
                                canvas.height = node.videoHeight
                                canvas.width = node.videoWidth
                                canvas.getContext('2d').drawImage(node, 0, 0)
                                value = canvas.toDataURL()
                            } else {
                                value = ''
                            }
                        } break
                        case 'VIDEO': {
                            if (node.tagName == 'IMG') {
                                let canvas = document.createElement('canvas')
                                canvas.height = node.naturalHeight
                                canvas.width = node.naturalWidth
                                canvas.getContext('2d').drawImage(node, 0, 0)
                                value = canvas.toDataURL()
                            } else if (node.tagName == 'VIDEO') {
                                value = node.src
                                if (!value) {
                                    for (let childNode of node.childNodes) {
                                        if (childNode.tagName == 'SOURCE') {
                                            value = childNode.src
                                            if (value) break
                                        }
                                    }
                                }
                                if (reqType != 'preview') {
                                    if (value.startsWith('blob:')) {
                                        value = uMap[value]
                                        if (value) {
                                            let time = 0
                                            let interval = setInterval(() => {
                                                ipcRenderer.send('refresh')
                                                node.play()
                                                let t = node.buffered.end(0)
                                                if (t - time > 2) {
                                                    time = t
                                                    node.currentTime = time - 2
                                                }
                                            }, 1000)
                                            await new Promise(resolve => {
                                                node.addEventListener('ended', resolve, false)
                                            })
                                            ipcRenderer.send('videoend', value)
                                            clearInterval(interval)
                                            value = value + '/0.mp4'
                                        }
                                    }
                                }
                            } else {
                                value = ''
                            }
                        } break
                        case 'Html': value = node.outerHTML; break
                        default: value = node.getAttribute(type); break
                    }
                }
            }; break
        }
        if (typeof (value) != 'string') value = ''
        return { ...extract, value: value, valueType: valueType }
    })),
    Opera: (XPathBase64, operasBase64) => {
        let XPath = base64Decode(XPathBase64)
        let operas = JSON.parse(base64Decode(operasBase64))
        let node = getNodes(XPath)[0]
        if (!node) return
        document.browserMode = true
        let focusevent = document.createEvent("HTMLEvents")
        focusevent.initEvent("focus", true, false)
        node.dispatchEvent(focusevent)
        operas.forEach(opera => {
            let e = document.createEvent("MouseEvents")
            e.initEvent(opera, true, true)
            node.dispatchEvent(e)
        })
        node.focus()
        document.browserMode = false
    }
}
ipcRenderer.send('setListener')
window.onload = () => {
    ipcRenderer.send('setListener')
}
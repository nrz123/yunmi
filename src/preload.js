import html2canvas from 'html2canvas'
const { ebyXPath } = require('./engine.js')
const { clear, setListener, clearListener } = require('./webEvent.js')
const { ipcRenderer } = require('electron')
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
        List.forEach(XPath => XPath ? XPaths.push(...ebyXPath(XPath).map(node => {
            let x = ''
            for (let p = node; p != document; p = p.parentNode) {
                if (p.nodeType == 9) {
                    if (!p.parent) ebyXPath('//iframe').forEach(iframe => iframe.contentDocument.parent = iframe)
                    p = p.parent
                }
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
        let node = ebyXPath(base64Decode(XPathBase64))[0]
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
                let node = ebyXPath([XPath, extract.XPath].join(''))[0]
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
                                let canvas = await html2canvas(node)
                                value = canvas.toDataURL()
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
                                        let fid = value = uMap[value]
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
                                            ipcRenderer.send('videoend', fid)
                                            clearInterval(interval)
                                        }
                                    }
                                }
                            } else {
                                let canvas = await html2canvas(node)
                                value = canvas.toDataURL()
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
        let node = ebyXPath(XPath)[0]
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
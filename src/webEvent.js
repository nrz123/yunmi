const { ebyXPath } = require('./engine.js')
const { ipcRenderer } = require('electron')
let nodeXPath = node => {
    let XPath = []
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
        if (x.tagName == 'IFRAME') {
            xs.push(s)
            s = ''
        }
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
            //if(lootagName=='LI'||tagName=='A'||tagName=='SPAN'||tagName=='TR'||tagName=='TD')index=undefined
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
                        ebyXPath(toXPath([...loopXPath, ...XPath])).forEach(node => {
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
                        ebyXPath(toXPath([...loopXPath, ...rel])).forEach(node => {
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
export let clear = () => {
    selects.forEach(x => x.style.cssText = x.cssText)
    selects.clear()
    similarity.forEach(x => x.style.cssText = x.cssText)
    similarity.clear()
    absXPaths.length = 0
    loopXPath.length = 0
    relXPaths.length = 0
    useLoop = undefined
}
export let setListener = document => {
    document.removeEventListener('mouseover', mouseover, true)
    document.removeEventListener('mouseout', mouseout, true)
    document.removeEventListener('click', click, true)
    document.addEventListener('mouseover', mouseover, true)
    document.addEventListener('mouseout', mouseout, true)
    document.addEventListener('click', click, true)
    document.querySelectorAll('iframe').forEach(iframe => setListener(iframe.contentDocument))
}
let removeListener = document => {
    document.removeEventListener('mouseover', mouseover, true)
    document.removeEventListener('mouseout', mouseout, true)
    document.removeEventListener('click', click, true)
    document.querySelectorAll('iframe').forEach(iframe => removeListener(iframe.contentDocument))
}
export let clearListener = document => {
    clear()
    removeListener(document)
}
import { message } from 'antd'
const { ipcRenderer } = window.require('electron')
export function loadWebPage(id) {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/loadWebPage", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id
        })
    }).catch(e => message.info("网络错误"))
}
export function saveWebPage(WebPage) {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/saveWebPage", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            WebPage: WebPage
        })
    }).then(data => {
        message.info(data)
        return data
    })
}
export function deleteWebPage(id) {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/deleteWebPage", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id
        })
    }).then(data => {
        message.info(data)
        return data
    }).catch(e => message.info("网络错误"))
}
export function WebPageList(offset, rows) {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/WebPageList", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            offset: offset,
            rows: rows
        })
    }).catch(e => {
        message.info("网络错误")
    })
}
export function WebPageSum() {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/WebPageSum", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: ''
    }).catch(e => {
        message.info("网络错误")
    })
}
export function runWebPage(id) {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/runWebPage", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id
        })
    })
}
export function stopWebPage(id) {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/stopWebPage", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id
        })
    })
}
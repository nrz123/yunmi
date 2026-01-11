import { message } from 'antd'
const { ipcRenderer } = window.require('electron')
export function loadModel(id) {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/loadModel", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id
        })
    }).catch(e => message.info("网络错误"))
}
export function saveModel(model) {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/saveModel", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model
        })
    }).then(data => {
        message.info(data)
        return data
    })
}
export function deleteModel(id) {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/deleteModel", {
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
export function modelList(offset, rows) {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/modelList", {
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
export function modelSum() {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/modelSum", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: ''
    }).catch(e => {
        message.info("网络错误")
    })
}
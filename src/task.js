import { message } from 'antd'
const { ipcRenderer } = window.require('electron')
export function taskList(offset, rows) {
    console.log(global.serverHost)
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/taskList", {
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
export function pageList(offset, rows) {
    return ipcRenderer.invoke('fetch', global.serverHost + "/resource/pageList", {
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
export function taskSum() {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/taskSum", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: ''
    }).catch(e => {
        message.info("网络错误")
    })
}
export function pageSum() {
    return ipcRenderer.invoke('fetch', global.serverHost + "/resource/pageSum", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: ''
    }).catch(e => {
        message.info("网络错误")
    })
}
export function loadTask(id) {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/loadTask", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id
        })
    }).catch(e => {
        message.info("网络错误")
    })
}
export function loadPage(id) {
    return ipcRenderer.invoke('fetch', global.serverHost + "/resource/loadPage", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id
        })
    }).catch(e => {
        message.info("网络错误")
    })
}
export function saveTask(task) {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/saveTask", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            task: task
        })
    }).then(data => {
        message.info(data)
        return data
    }).catch(e => message.info("网络错误"))
}
export function savePage(page) {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/savePage", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            page: page
        })
    }).then(data => {
        message.info(data)
        return data
    }).catch(e => message.info("网络错误"))
}
export function deleteTask(id) {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/deleteTask", {
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
export function deletePage(id) {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/deletePage", {
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
export function cloudsState(ids) {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/tasksState", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ids: ids
        })
    }).catch(e => {
        message.info("网络错误")
    })
}
export function runCloud(id) {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/runTask", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id
        })
    })
}
export function stopCloud(id) {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/stopTask", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id
        })
    })
}
export function cloudRunSum() {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/runsum", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    }).catch(e => {
        message.info("网络错误2")
    })
}
export function cloudRunning(offset, rows) {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/running", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            offset: offset,
            rows: rows
        })
    }).catch(e => {
        message.info("网络错误3")
    })
}
export function cloudLoadRun(sliceId) {
    return ipcRenderer.invoke('fetch', global.serverHost + "/users/loadRun", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sliceId: sliceId
        })
    }).catch(e => {
        message.info("网络错误")
    })
}
const { ipcRenderer } = window.require('electron')
let opendb = (id, version) => {
    let request = window.indexedDB.open(id, version)
    request.onupgradeneeded = event => {
        let db = event.target.result
        db.objectStoreNames.contains('datas') || db.createObjectStore('datas', { autoIncrement: true, keyPath: 'id' })
    }
    return request
}
export function saveData(id, data) {
    return new Promise(resolve => {
        opendb(id, 1).onsuccess = event => event.target.result.transaction("datas", 'readwrite').objectStore("datas").put(data).onsuccess = event => resolve('success')
    })
}
export function dataSum(id) {
    return new Promise(resolve => {
        opendb(id, 1).onsuccess = event => event.target.result.transaction("datas").objectStore("datas").count().onsuccess = event => resolve(event.target.result)
    })
}
export function loadData(id, offset, size) {
    return new Promise(resolve => {
        let data = []
        let index = null
        opendb(id, 1).onsuccess = event => event.target.result.transaction("datas").objectStore("datas").openCursor().onsuccess = event => {
            let res = event.target.result
            if (!res) return resolve(data)
            if (index == null) {
                index = 0
                if (offset != 0) return res.advance(offset)
            }
            data.push(res.value)
            if (++index < size) return res.continue()
            resolve(data)
        }
    })
}
export function getData(id, key) {
    return new Promise(resolve => {
        opendb(id, 1).onsuccess = event => event.target.result.transaction('datas', "readonly").objectStore('datas').get(key).onsuccess = event => resolve(event.target.result)
    })
}
export function deleteData(id, key) {
    return new Promise(resolve => {
        opendb(id, 1).onsuccess = event => event.target.result.transaction('datas', 'readwrite').objectStore('datas').delete(key).onsuccess = event => resolve('success')
    })
}
export function clearData(id) {
    window.indexedDB.deleteDatabase(id)
}
ipcRenderer.on('saveData', (event, id, data) => saveData(id, data))
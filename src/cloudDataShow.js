import React from 'react'
import { Input, Table, message, Modal } from 'antd'
import { RedoOutlined, VerticalAlignTopOutlined, VerticalAlignBottomOutlined, DeleteOutlined } from '@ant-design/icons'
import guid from './uuid.js'
import Delete from './delete.js'
const { ipcRenderer } = window.require('electron')
class CloudDataShow extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            columns: [],
            dataSource: [],
            pagination: {
                position: ['none', 'bottomLeft'],
                current: 1,
                pageSize: 10
            },
        }
    }
    tabSelect() {
        this.updata(this.state.pagination)
    }
    componentDidMount() {
        this.updata(this.state.pagination)
    }
    updata = pagination => {
        ipcRenderer.invoke('fetch', global.serverHost + "/users/cloudData", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: this.props.taskId,
                offset: 0,
                rows: 1
            })
        }).then(data => {
            let d = data[0]
            if (!d) return
            let columns = []
            Object.keys(d).forEach(key => {
                if (key != 'columna5efb0e073a1fd48971c5e713f4d9200' && key != 'column6fd9d90906ab18e9513e99dcdd4e3536' && !key.startsWith('hash') && columns.findIndex(c => c.key == key) == -1) {
                    columns.push({
                        title: <div style={{
                            fontSize: '18px',
                            fontWeight: '300'
                        }} onClick={() => {
                            this.ckey = key.slice(6)
                            this.setState({ visible: true, ckey: this.ckey, cname: d[key] })
                        }}>{d[key]}</div>,
                        dataIndex: key,
                        key: key,
                        ellipsis: true,
                        width: 200,
                    })
                }
            })
            this.setState({ columns: columns })
        })
        ipcRenderer.invoke('fetch', global.serverHost + "/users/dataSum", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: this.props.taskId
            })
        }).then(sum => {
            this.state.pagination.total = sum - 1
            this.setState({})
        })
        ipcRenderer.invoke('fetch', global.serverHost + "/users/cloudData", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: this.props.taskId,
                offset: (pagination.current - 1) * pagination.pageSize + 1,
                rows: pagination.pageSize
            })
        }).then(data => {
            pagination.total = this.state.pagination.total
            this.setState({
                dataSource: data.map(d => {
                    let ret = {}
                    Object.keys(d).forEach(k => {
                        let value = '' + d[k]
                        ret[k] = <div>
                            {value.split('\n').map(v => <p style={{
                                fontSize: '18px',
                                fontWeight: '300',
                                cursor: 'pointer'
                            }} onClick={() => ipcRenderer.send('openWeb', global.serverHost + '/' + v)}>{v}</p>)}
                        </div>
                    })
                    return ret
                }), pagination: pagination
            })
        })
    }
    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <Modal title="设置" visible={this.state.visible} onOk={() => {
                    ipcRenderer.invoke('fetch', global.serverHost + "/users/changecolumn", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id: this.props.taskId,
                            uid: this.ckey,
                            nid: this.state.ckey
                        })
                    }).then(data => {
                        if (data != 'success') return
                        this.updata(this.state.pagination)
                    })
                    this.setState({ visible: false })
                }} onCancel={() => { this.setState({ visible: false }) }}>
                    <Input value={this.state.ckey} onChange={e => this.setState({ ckey: e.target.value })}></Input>
                    <div style={{ height: '14px' }}></div>
                    <Input value={this.state.cname} onChange={e => this.setState({ cname: e.target.value })}></Input>
                    <div style={{ height: '14px' }}></div>
                </Modal>
                <Delete title={"确认删除"} visible={this.state.delete} ok={() => {
                    ipcRenderer.invoke('fetch', global.serverHost + "/users/clearData", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id: this.props.taskId
                        })
                    })
                    this.setState({ dataSource: [], columns: [] })
                }} close={() => this.setState({ delete: undefined })}></Delete>
                <Table style={{ width: '100%', height: 'calc(100% - 65px)' }} scroll={{ y: true }} columns={this.state.columns} dataSource={this.state.dataSource} pagination={this.state.pagination} onChange={pagination => {
                    this.updata(pagination)
                }}></Table>
                <div style={{
                    position: 'absolute',
                    bottom: '15px',
                    right: '20px'
                }}>
                    <RedoOutlined onClick={() => {
                        this.updata(this.state.pagination)
                    }} style={{ fontSize: '30px' }} />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <VerticalAlignTopOutlined onClick={() => {
                        ipcRenderer.invoke('import', {
                            filters: [
                                { name: 'Excel', extensions: ['xlsx'] }
                            ]
                        }).then(e => {
                            if (!e.filePaths[0]) return
                            ipcRenderer.send('excelImport', this.props.taskId, e.filePaths[0])
                        })
                    }} style={{ fontSize: '30px' }} />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <VerticalAlignBottomOutlined onClick={() => {
                        ipcRenderer.invoke('export', {
                            defaultPath: this.props.taskName,
                            filters: [
                                { name: 'Excel', extensions: ['xlsx'] }
                            ]
                        }).then(e => {
                            if (!e.filePath) return
                            let key = guid()
                            let offset = 0
                            let f = () => {
                                offset > this.state.pagination.total ? ipcRenderer.invoke('excelEnd', key).then(ret => message.info(ret)) : ipcRenderer.invoke('fetch', global.serverHost + "/users/cloudData", {
                                    method: "POST",
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        id: this.props.taskId,
                                        offset: offset,
                                        rows: 1000
                                    })
                                }).then(data => {
                                    offset += 1000
                                    ipcRenderer.invoke('excelExport', e.filePath, data.map(d => {
                                        let datas = []
                                        Object.keys(d).forEach(key => key != 'columna5efb0e073a1fd48971c5e713f4d9200' && key != 'column6fd9d90906ab18e9513e99dcdd4e3536' && !key.startsWith('hash') && datas.push(d[key]))
                                        return datas
                                    }), key).then(f)
                                })
                            }
                            f()
                        })
                    }} style={{ fontSize: '30px' }} />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <DeleteOutlined onClick={() => this.setState({ delete: true })} style={{ fontSize: '30px' }} />
                </div>
            </div>
        )
    }
}
export default CloudDataShow
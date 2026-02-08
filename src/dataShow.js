import React from 'react'
import { Table, message } from 'antd'
import { RedoOutlined, VerticalAlignBottomOutlined, DeleteOutlined } from '@ant-design/icons'
import guid from './uuid.js'
import Delete from './delete.js'
import { loadData, dataSum, clearData } from './data.js'
const { ipcRenderer } = window.require('electron')
class DataShow extends React.Component {
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
        dataSum(this.props.taskId).then(sum => {
            this.state.pagination.total = sum
            this.setState({})
        })
        loadData(this.props.taskId, (pagination.current - 1) * pagination.pageSize, pagination.pageSize).then(datas => {
            if (!datas) return
            let columns = []
            let dataSource = datas.map(data => {
                let d = {}
                data.forEach(c => {
                    let value = c.value ? c.value : ''
                    if (columns.findIndex(p => p.key == c.key) == -1) {
                        columns.push({
                            title: <div style={{
                                fontSize: '18px',
                                fontWeight: '300'
                            }}>{c.name}</div>,
                            name: c.name,
                            dataIndex: c.key,
                            key: c.key,
                            ellipsis: true,
                            width: 200,
                        })
                    }
                    d[c.key] = <div>
                        {value.split('\n').map(v => <p style={{
                            fontSize: '18px',
                            fontWeight: '300',
                            cursor: 'pointer'
                        }} onClick={() => ipcRenderer.send('openWeb', global.downloaddir + '/' + v)}>{v}</p>)}
                    </div>
                })
                return d
            })
            pagination.total = this.state.pagination.total
            this.setState({ dataSource: dataSource, pagination: pagination, columns: columns })
        })
    }
    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <Delete title={"确认删除"} visible={this.state.delete} ok={() => {
                    clearData(this.props.taskId)
                    this.setState({ dataSource: [], columns: [] })
                }} close={() => this.setState({ delete: undefined })}></Delete>
                <Table style={{ width: '100%', height: 'calc(100% - 60px)' }} scroll={{ y: true }} columns={this.state.columns} dataSource={this.state.dataSource} pagination={this.state.pagination} onChange={pagination => {
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
                                offset > this.state.pagination.total ? ipcRenderer.invoke('excelEnd', key).then(ret => message.info(ret)) : loadData(this.props.taskId, offset, 1000).then(datas => {
                                    offset += 1000
                                    ipcRenderer.invoke('excelExport', e.filePath, datas.map(data => data.map(d => d.value)), key).then(f)
                                })
                            }
                            ipcRenderer.invoke('excelExport', e.filePath, [this.state.columns.map(c => c.name)], key).then(f)
                        })
                    }} style={{ fontSize: '30px' }} />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <DeleteOutlined onClick={() => this.setState({ delete: true })} style={{ fontSize: '30px' }} />
                </div>
            </div>
        )
    }
}
export default DataShow
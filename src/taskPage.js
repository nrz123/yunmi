import React from 'react'
import './taskPage.css'
import { Table, Button, message } from 'antd'
import { PlusOutlined, PlayCircleOutlined, PauseCircleOutlined, VerticalAlignBottomOutlined, DeleteOutlined, VerticalAlignTopOutlined } from '@ant-design/icons'
import { taskList, taskSum, deleteTask, saveTask, loadTask } from './task.js'
import Browser from './browser.js'
import DataShow from './dataShow'
import guid from './uuid'
import Delete from './delete.js'
import { ref } from './tabRef.js'
import moment from 'moment'
import 'moment/locale/zh-cn'
moment.locale('zh-cn')
const { ipcRenderer } = window.require('electron')
class TaskPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            tasks: [],
            pagination: {
                position: ['none', 'bottomLeft'],
                current: 1,
                pageSize: 10,
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
        taskSum().then(sum => {
            this.state.pagination.total = sum
            this.setState({})
        })
        taskList((pagination.current - 1) * pagination.pageSize, pagination.pageSize).then(tasks => {
            if (!tasks) return []
            pagination.total = this.state.pagination.total
            this.setState({ tasks: tasks, pagination: pagination })
            return tasks
        })
    }
    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <Delete visible={this.state.showDelete} title="确定删除" ok={() => {
                    let deleteId = this.state.deleteId
                    deleteTask(deleteId).then(ret => {
                        if (ret != 'success') return
                        window.indexedDB.deleteDatabase(deleteId)
                        this.updata(this.state.pagination)
                    })
                }} close={() => this.setState({ showDelete: false })}></Delete>
                <Table style={{ width: '100%', height: 'calc(100% - 65px)' }} pagination={this.state.pagination} onChange={pagination => {
                    this.updata(pagination)
                }} columns={[{
                    title: <div style={{
                        fontSize: '18px',
                        fontWeight: '300'
                    }}>{'任务名'}</div>,
                    dataIndex: 'name',
                    key: 'name',
                }, {
                    title: <div style={{
                        fontSize: '18px',
                        fontWeight: '300'
                    }}>{'本地采集'}</div>,
                    dataIndex: 'state',
                    key: 'state',
                }, {
                    title: <div style={{
                        fontSize: '18px',
                        fontWeight: '300'
                    }}>{'查看数据'}</div>,
                    dataIndex: 'showData',
                    key: 'showData',
                }, {
                    title: <div style={{
                        fontSize: '18px',
                        fontWeight: '300'
                    }}>{'最近编辑时间'}</div>,
                    dataIndex: 'time',
                    key: 'time',
                }, {
                    title: <div style={{
                        fontSize: '18px',
                        fontWeight: '300'
                    }}>{'更多操作'}</div>,
                    dataIndex: 'opera',
                    key: 'opera'
                }]} dataSource={this.state.tasks.map(task => {
                    return {
                        name: <a style={{
                            fontSize: '18px',
                            fontWeight: '300'
                        }} onClick={() => {
                            loadTask(task.id).then(task => {
                                this.props.addPane(<Browser ref={ref} tabKey={task.id} tab={task.name} taskName={task.name} task={task} saveTask={saveTask}></Browser>)
                            })
                        }}>{task.name}</a>, state: global.runState[task.id] ? <PauseCircleOutlined style={{ fontSize: '24px', color: '#08c' }} onClick={() => {
                            ipcRenderer.send('stopTask', task.id)
                        }} /> : <PlayCircleOutlined style={{ fontSize: '24px', color: '#08c' }} onClick={() => {
                            loadTask(task.id).then(task => {
                                let end = (event, id) => {
                                    if (id == task.id) {
                                        delete global.runState[task.id]
                                        this.setState({})
                                        ipcRenderer.removeListener('end', end)
                                    }
                                }
                                ipcRenderer.on('end', end)
                                ipcRenderer.send('runTask', task)
                                global.runState[task.id] = true
                                this.setState({})
                            })
                        }} />, showData: <a style={{
                            fontSize: '18px',
                            fontWeight: '300'
                        }} onClick={() => {
                            this.props.addPane(<DataShow ref={ref} tabKey={task.id + '-data'} tab={'查看数据'} taskId={task.id} taskName={task.name}></DataShow>)
                        }}>本地数据</a>, time: <div style={{
                            fontSize: '18px',
                            fontWeight: '300'
                        }}>{new moment(task.editTime).format()}</div>, opera: <div>
                            <VerticalAlignBottomOutlined onClick={() => {
                                loadTask(task.id).then(task => {
                                    ipcRenderer.invoke('export', {
                                        defaultPath: task.name, filters: [
                                            { name: 'Task', extensions: ['kld'] }
                                        ]
                                    }).then(e => {
                                        if (!e.filePath) return
                                        ipcRenderer.invoke('write', e.filePath, task.step).then(ret => {
                                            message.info(ret)
                                        })
                                    })
                                })
                            }} style={{ fontSize: '26px' }} />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <DeleteOutlined onClick={() => this.setState({ showDelete: true, deleteId: task.id })} style={{ fontSize: '26px' }} />
                        </div>
                    }
                })} scroll={{ y: true }} />
                <VerticalAlignTopOutlined style={{
                    position: 'absolute',
                    fontSize: '30px',
                    right: '20px',
                    bottom: '15px'
                }} onClick={() => {
                    ipcRenderer.invoke('import', {
                        filters: [
                            { name: 'Task', extensions: ['kld'] }
                        ]
                    }).then(e => {
                        if (!e.filePaths[0]) return
                        let name = e.filePaths[0]
                        ipcRenderer.invoke('read', name).then(ret => {
                            if (!ret) return
                            saveTask({ id: guid(), name: name.substring(name.lastIndexOf('\\') + 1, name.lastIndexOf('.')), step: ret }).then(data => data == 'success' && this.updata(this.state.pagination))
                        })
                    })
                }} />
            </div>
        )
    }
}
export default TaskPage
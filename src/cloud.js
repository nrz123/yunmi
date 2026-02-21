import React from 'react'
import { Table } from 'antd'
import { PlayCircleOutlined, PauseCircleOutlined, DeleteOutlined, PlusCircleOutlined, CloudUploadOutlined } from '@ant-design/icons'
import Delete from './delete.js'
import CloudDataShow from './cloudDataShow.js'
import Browser from './browser.js'
import AddWeb from './addWeb.js'
import { saveTask, taskSum, deleteTask, stopCloud, runCloud, taskList, cloudsState, loadTask, loadPage } from './task.js'
import { ref } from './tabRef.js'
import moment from 'moment'
import 'moment/locale/zh-cn'
moment.locale('zh-cn')
class Cloud extends React.Component {
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
        global.upcloudState = taskState => {
            let task = this.state.tasks.find(task => task.id == taskState.id)
            if (!task) return
            task.cloudState = taskState.state
            this.setState({})
        }
        this.updata(this.state.pagination)
    }
    updata = pagination => {
        taskSum().then(sum => {
            this.state.pagination.total = sum
            this.setState({})
        })
        taskList((pagination.current - 1) * pagination.pageSize, pagination.pageSize).then(tasks => {
            if (!tasks) return []
            return tasks
        }).then(tasks => {
            this.setState({ tasks: tasks, pagination: pagination })
            cloudsState(tasks.map(task => task.id)).then(taskStates => {
                if (!taskStates) return
                tasks.forEach(task => {
                    task.cloudState = taskStates[task.id]
                })
                pagination.total = this.state.pagination.total
                this.setState({ tasks: tasks, pagination: pagination })
            })
        })
    }
    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <Delete visible={this.state.showDelete} title="确定删除" ok={() => deleteTask(this.state.deleteId).then(ret => {
                    if (ret != 'success') return
                    this.updata(this.state.pagination)
                })} close={() => this.setState({ showDelete: false })}></Delete>
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
                    }}>{'运行状态'}</div>,
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
                        }}>{task.name}</a>, state: <div>
                            {task.cloudState ? <PauseCircleOutlined style={{ fontSize: '24px', color: '#08c' }} onClick={() => {
                                stopCloud(task.id)
                            }} /> : <PlayCircleOutlined style={{ fontSize: '24px', color: '#08c' }} onClick={() => {
                                runCloud(task.id)
                            }} />}
                        </div>, showData: <a style={{
                            fontSize: '18px',
                            fontWeight: '300'
                        }} onClick={() => {
                            this.props.addPane(<CloudDataShow ref={ref} tabKey={task.id + '-cloudData'} tab={'集群数据'} taskId={task.id} taskName={task.name}></CloudDataShow>)
                        }}>集群数据</a>, opera: <div>
                            <PlusCircleOutlined style={{ fontSize: '24px', color: '#08c' }} onClick={() => {
                                runCloud(task.id)
                            }} />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <CloudUploadOutlined onClick={() => {
                                loadPage(task.id).then(page => {
                                    this.props.addPane(<AddWeb ref={ref} tabKey={task.id + '-addWeb'} tab={task.name + '-添加网页'} page={page} pid={task.id} pageName={task.name} addPane={this.props.addPane}></AddWeb>)
                                })
                            }} style={{ fontSize: '30px' }} />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <DeleteOutlined onClick={() => this.setState({ showDelete: true, deleteId: task.id })} style={{ fontSize: '26px' }} />
                        </div>
                    }
                })} scroll={{ y: true }} />
            </div>
        )
    }
}
export default Cloud
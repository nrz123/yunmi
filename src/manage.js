import React from 'react'
import { Table, message, Button } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import CloudDataShow from './cloudDataShow.js'
import Browser from './browser.js'
import { cloudRunSum, cloudRunning, cloudLoadRun } from './task.js'
import { ref } from './tabRef.js'
import moment from 'moment'
import 'moment/locale/zh-cn'
moment.locale('zh-cn')
class Manage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            tasks: [],
            clouds: 0,
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
        cloudRunSum().then(sum => {
            this.state.pagination.total = sum
            this.setState({})
        })
        cloudRunning((pagination.current - 1) * pagination.pageSize, pagination.pageSize).then(tasks => {
            pagination.total = this.state.pagination.total
            this.setState({ tasks: tasks, pagination: pagination })
        })
    }
    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
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
                            console.log(task)
                            cloudLoadRun(task.sliceId).then(task => {
                                task && this.props.addPane(<Browser ref={ref} tabKey={'manage' + task.sliceId} tab={task.name} taskName={task.name} task={task} saveTask={() => { }}></Browser>)
                            })
                        }}>{task.name}</a>, state: <div style={{
                            marginBottom: '0px',
                            fontSize: '18px',
                            fontWeight: '300'
                        }}>
                            {task.cloudState ? '正在运行' : '等待运行'}
                        </div>, showData: <a onClick={() => {
                            this.props.addPane(<CloudDataShow ref={ref} tabKey={task.id + '-cloudData'} tab={'集群数据'} taskId={task.id}></CloudDataShow>)
                        }} style={{
                            fontSize: '18px',
                            fontWeight: '300'
                        }}>查看数据</a>, opera: <DeleteOutlined onClick={() => { }} style={{ fontSize: '22px' }} />
                    }
                })} scroll={{ y: true }} />
            </div>
        )
    }
}
export default Manage
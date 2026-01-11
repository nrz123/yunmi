import React from 'react'
import './home.css'
import { Button, Row, Col, Card, Avatar, Input, Form, message, Modal, Collapse } from 'antd'
import { WeiboSquareOutlined, PlusOutlined } from '@ant-design/icons'
import VSplit from './vsplit'
const { Panel } = Collapse
const { TextArea } = Input
const { ipcRenderer } = window.require('electron')
class TaskModel extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            leftWidth: 800,
            params: {}
        }
    }
    componentDidMount = () => {
        this.upview(this.props.to)
        window.addEventListener('resize', this.resize)
    }
    componentWillUnmount = () => {
        window.removeEventListener('resize', this.resize)
    }
    upview = to => {
        ipcRenderer.invoke('fetch', global.serverHost + "/users/taskModel", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: to
            })
        }).then(taskModel => {
            if (!taskModel) return
            this.setState({ to: to, ...taskModel })
        }).catch(e => {
            message.info("网络错误")
        })
    }
    resize = () => {
        let root = document.body
        let width = root.clientWidth
        let height = root.clientHeight
        let viewWidth = 1200
        if (width < 1234) viewWidth = width - 34
        if (height < 756) width -= 15
        ipcRenderer.invoke('viewManage', 'taskModel', 'viewResize', { x: parseInt((width - viewWidth) / 2), y: 71, width: viewWidth, height: 608 })
    }
    render() {
        let links = []
        let view = <div></div>
        let { model, paths, to } = this.state
        paths && paths.forEach(path => {
            let { key, title } = path
            links.push(<a style={{
                fontSize: '18px'
            }}>{">"}</a>)
            links.push(<a style={{
                fontSize: '18px'
            }} onClick={() => this.upview(key)}>{title}</a>)
        })
        if (model) {
            switch (model.type) {
                case 'params': {
                    let { params } = model
                    if (!params) break
                    let items = []
                    params.forEach(param => {
                        let { type, title, key } = param
                        switch (type) {
                            case 'string': {
                                items.push(<Input placeholder={title} value={this.state.params[key]} onChange={e => {
                                    this.state.params[key] = e.target.value
                                    this.setState({})
                                }}></Input>)
                            } break
                            case 'list': {
                                items.push(<TextArea style={{ height: '200px' }} placeholder={title} value={this.state.params[key]} onChange={e => {
                                    this.state.params[key] = e.target.value
                                    this.setState({})
                                }}></TextArea>)
                            } break
                            case 'cookie': {
                                let values = this.state.params[key]
                                let i = 0
                                let list = values ? values.map(value => <Button style={{ width: '100%' }} onClick={() => {
                                    this.setState({ viewCookie: true, paramKey: key })
                                    setTimeout(() => {
                                        ipcRenderer.invoke('viewManage', 'taskModel', 'viewModel')
                                        this.resize()
                                        ipcRenderer.invoke('viewManage', 'taskModel', 'setCookies', value).then(() => {
                                            ipcRenderer.invoke('viewManage', 'taskModel', 'loadURL', param.url)
                                        })
                                    }, 300)
                                }}>{title + (i++)}</Button>) : []
                                items.push(<Collapse defaultActiveKey={['1']}>
                                    <Panel header="会话" key="1">
                                        {list}
                                        <Button icon={<PlusOutlined style={{
                                            fontSize: '24px'
                                        }} />} style={{ width: '100%' }} onClick={() => {
                                            this.setState({ viewCookie: true, paramKey: key })
                                            message.info(param.message)
                                            setTimeout(() => {
                                                ipcRenderer.invoke('viewManage', 'taskModel', 'viewModel')
                                                this.resize()
                                                ipcRenderer.invoke('viewManage', 'taskModel', 'clearCookies').then(() => {
                                                    ipcRenderer.invoke('viewManage', 'taskModel', 'loadURL', param.url)
                                                })
                                            }, 300)
                                        }}></Button>
                                    </Panel>
                                </Collapse>)
                            }
                        }
                    })
                    view = <VSplit right={<div style={{
                        width: '100%',
                        height: '100%',
                        padding: '20px',
                        overflow: 'auto'
                    }}>
                        {items}
                        <Button style={{ width: '100%' }} type="primary" onClick={() => {
                            ipcRenderer.invoke('fetch', global.serverHost + "/users/createTask", {
                                method: "POST",
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    to: to,
                                    params: this.state.params
                                })
                            }).then(ret => {
                                message.info(ret)
                            }).catch(e => {
                                message.info("网络错误")
                            })
                        }}>
                            确定
                        </Button>
                    </div>} left={<div style={{
                        width: '100%',
                        height: '100%'
                    }}>
                        <p style={{
                            fontSize: '24px',
                            fontWeight: '300',
                        }}>
                            {model.describe}
                        </p>
                    </div>} leftWidth={this.state.leftWidth} move={e => {
                        let width = e.clientX - e.currentTarget.offsetLeft
                        this.setState({ leftWidth: width })
                    }}></VSplit>
                } break
                default: {
                    let { childs } = model
                    if (!childs) break
                    let cols = []
                    childs.forEach(child => {
                        if (!child) return
                        let { key, value } = child
                        cols.push(<Col span={6}>
                            <Card title={value.title} bordered={false} style={{ width: '100%' }}>
                                <a onClick={() => this.upview(key)} >
                                    <Avatar shape="square" size={64} icon={<WeiboSquareOutlined />} />
                                </a>
                            </Card>
                        </Col>)
                    })
                    view = <Row gutter={[32, 32]}>
                        {cols}
                    </Row>
                }
            }
        }
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <Modal width={1202} style={{ top: '16px' }} title="添加用户" visible={this.state.viewCookie} onOk={() => {
                    let key = this.state.paramKey
                    if (!key) return
                    ipcRenderer.invoke('viewManage', 'taskModel', 'viewCookies').then(cookies => {
                        if (this.state.params[key]) {
                            this.state.params[key].push(cookies)
                        } else {
                            this.state.params[key] = [cookies]
                        }
                        this.setState({ viewCookie: false })
                        ipcRenderer.invoke('viewManage', 'taskModel', 'viewHide')
                    })
                }} onCancel={() => {
                    this.setState({ viewCookie: false })
                    ipcRenderer.invoke('viewManage', 'taskModel', 'viewHide')
                }}>
                    <div style={{ height: '560px' }}></div>
                </Modal>
                {links}
                {view}
            </div>
        )
    }
}
export default TaskModel
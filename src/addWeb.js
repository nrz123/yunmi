import React from 'react'
import './home.css'
import { Table, Button, Input, Select, Modal, Collapse,  Popover } from 'antd'
import { PlusOutlined, SaveOutlined, DeleteOutlined, EditOutlined, UpOutlined, DownOutlined } from '@ant-design/icons'
import HSplit from './hsplit'
import VSplit from './vsplit'
import { savePage } from './task'
import moment from 'moment'
import 'moment/locale/zh-cn'
const { Option } = Select
const { TextArea } = Input
const { Panel} = Collapse
const { ipcRenderer } = window.require('electron')
moment.locale('zh-cn')
class AddWeb extends React.Component {
    constructor(props) {
        super(props)
        this.page = this.props.page
        if (this.page) {
            this.placeholders = typeof (this.page.placeholders) == 'string' ? JSON.parse(this.page.placeholders) : this.page.placeholders
            this.directorys = typeof (this.page.directorys) == 'string' ? JSON.parse(this.page.directorys) : this.page.directorys
        } else {
            this.page = { id: this.props.pid, name: '', pagehtml: '' }
            this.directorys = []
            this.placeholders = []
        }
        this.state = {
            topHeight: 380,
            leftWidth: 850,
            columns: {},
            regs: [],
            pageName: this.page.name
        }
    }
    componentWillMount() {
        ipcRenderer.invoke('fetch', global.serverHost + "/users/cloudData", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: this.page.id,
                offset: 0,
                rows: 1
            })
        }).then(datas => {
            let data = datas[0]
            if (!data) return
            let columns = {}
            for (let key in data) {
                if (key != 'column6fd9d90906ab18e9513e99dcdd4e3536' && !key.startsWith('hash')) {
                    columns[key] = data[key]
                }
            }
            this.setState({
                columns: columns
            })
        })
    }
    calc = s => {
        if (!s || !s.regs || s.regs.length == 0) return
        let value = this.state.columns[s.column]
        s.regs.forEach(reg => {
            let { source, target } = reg
            try {
                reg.result = value = value.replace(new RegExp(source ? source : '', 'img'), target ? target : '')
            } catch {
                reg.result = value
            }
        })
    }
    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <Modal title="正则" visible={this.state.visible} onOk={() => {
                    this.setState({ visible: false })
                }} onCancel={() => {
                    this.setState({ visible: false })
                }}>
                    {this.state.x && this.state.x.regs ? this.state.x.regs.map(reg => {
                        let { source, target, result } = reg
                        return <div>
                            <div>
                                <UpOutlined onClick={() => {
                                    let index = this.state.x.regs.indexOf(reg)
                                    if (index > 0) {
                                        this.state.x.regs.splice(index, 1)
                                        this.state.x.regs.splice(index - 1, 0, reg)
                                        this.calc(this.state.x)
                                        this.setState({})
                                    }
                                }} style={{ fontSize: '24px' }} />
                                <DownOutlined onClick={() => {
                                    let index = this.state.x.regs.indexOf(reg)
                                    if (index < this.state.x.regs.length - 1) {
                                        this.state.x.regs.splice(index, 1)
                                        this.state.x.regs.splice(index + 1, 0, reg)
                                        this.calc(this.state.x)
                                        this.setState({})
                                    }
                                }} style={{ fontSize: '24px' }} />
                                <Popover content={<div>
                                    <TextArea style={{ width: '600px', height: '150px' }} placeholder="源正则表达式" value={source} onChange={e => {
                                        reg.source = e.target.value
                                        this.setState({})
                                    }} onBlur={e => {
                                        this.calc(this.state.x)
                                        this.setState({})
                                    }}></TextArea>
                                    <br />
                                    <TextArea style={{ width: '600px', height: '150px' }} placeholder="目标字符串" value={target} onChange={e => {
                                        reg.target = e.target.value
                                        this.setState({})
                                    }} onBlur={e => {
                                        this.calc(this.state.x)
                                        this.setState({})
                                    }}></TextArea>
                                </div>} trigger="click" placement="topLeft">
                                    <EditOutlined style={{ fontSize: '24px' }} />
                                </Popover>
                                <DeleteOutlined onClick={() => {
                                    let index = this.state.x.regs.indexOf(reg)
                                    if (index < 0) return
                                    this.state.x.regs.splice(index, 1)
                                    this.calc(this.state.x)
                                    this.setState({})
                                }} style={{ fontSize: '24px' }} />
                            </div>
                            <TextArea style={{ width: '100%', height: '200px' }} value={result}></TextArea>
                        </div>
                    }) : null}
                    <Button onClick={() => {
                        if (this.state.x && this.state.x.regs) {
                            this.state.x.regs.push({})
                            this.calc(this.state.x)
                            this.setState({})
                        }
                    }}>添加</Button>
                </Modal>
                <div className='tool' style={{
                    width: '100%',
                    height: '32px'
                }}>
                    <div className='tool' style={{
                        width: '100%',
                        height: '32px'
                    }}>
                        <div style={{
                            float: 'left'
                        }}>
                            <Input placeholder={'标题'} value={this.state.pageName} onChange={e => {
                                this.setState({ pageName: e.target.value })
                            }} onBlur={e => {
                                let pageName = this.state.pageName ? this.state.pageName : '新建页面'
                                this.setState({ pageName: pageName })
                            }}></Input>
                        </div>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <SaveOutlined style={{
                            fontSize: '32px'
                        }} onClick={e => {
                            this.page.name = this.state.pageName
                            this.page.directorys = JSON.stringify(this.directorys)
                            this.page.placeholders = JSON.stringify(this.placeholders)
                            savePage(this.page)
                        }} />
                        &nbsp;&nbsp;&nbsp;&nbsp;
                    </div>
                </div>
                <div style={{
                    width: '100%',
                    height: 'calc(100% - 32px)'
                }}>
                    <VSplit left={< div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: this.page.pagehtml }}>

                    </div >} right={<HSplit top={<div style={{ width: '100%', height: '100%', overflow: 'scroll' }}>
                        <TextArea style={{ width: '100%', height: '100%' }} value={this.page.pagehtml} onChange={e => {
                            this.page.pagehtml = e.target.value
                            this.setState({})
                        }}></TextArea>
                    </div>} bottom={<div style={{ width: '100%', height: '100%', overflow: 'scroll' }}>
                        <Table rowClassName="CookieActionRow" locale={{ emptyText: '暂无数据' }} style={{ width: '100%', marginTop: '0px' }} pagination={{
                            position: ['none', 'bottomLeft'],
                            pageSize: 5
                        }} scroll={{ x: 600 }} columns={[
                            {
                                title: '元素',
                                dataIndex: 'selector',
                                key: 'selector',
                                ellipsis: true,
                                width: 120,
                            },
                            {
                                title: '属性名',
                                dataIndex: 'attribute',
                                key: 'attribute',
                                ellipsis: true,
                                width: 120,
                            },
                            {
                                title: '列名',
                                dataIndex: 'column',
                                key: 'column',
                                ellipsis: true,
                                width: 120,
                            },
                            {
                                title: '正则',
                                dataIndex: 'regs',
                                key: 'regs',
                                ellipsis: true,
                                width: 120,
                            },
                            {
                                title: '编辑',
                                dataIndex: 'edit',
                                key: 'edit',
                                ellipsis: true,
                                width: 100,
                            },
                        ]} dataSource={this.placeholders.map(v => {
                            return {
                                selector: <Input value={v.selector} onChange={e => {
                                    v.selector = e.target.value
                                    this.setState({})
                                }}></Input>,
                                attribute: <Input value={v.attribute} onChange={e => {
                                    v.attribute = e.target.value
                                    this.setState({})
                                }}></Input>,
                                column: <Select value={v.column} style={{ width: '100%' }} onChange={key => {
                                    v.column = key
                                    this.setState({})
                                }}>
                                    {Object.entries(this.state.columns).map(kv => <Option value={kv[0]}>{kv[1]}</Option>)}
                                </Select>,
                                regs: <Button onClick={() => {
                                    if (!v.regs) v.regs = []
                                    this.calc(v)
                                    this.setState({ visible: true, x: v })
                                }}>添加正则</Button>,
                                edit: <div>
                                    <DeleteOutlined onClick={() => {
                                        let index = this.placeholders.indexOf(v)
                                        this.placeholders.splice(index, 1)
                                        this.setState({})
                                    }} style={{ fontSize: '24px' }} />
                                </div>,
                            }
                        })}>
                        </Table>
                        <Button icon={<PlusOutlined style={{
                            fontSize: '24px',
                        }} />} onClick={() => {
                            this.placeholders.push({})
                            this.setState({})
                        }} style={{
                            width: '100%',
                        }}></Button>
                        <Collapse defaultActiveKey={['1']}>
                            <Panel header="目录" key="1">
                                {this.directorys.map(directory => <div style={{ position: 'relative' }}>
                                    <Table rowClassName="CookieActionRow" locale={{ emptyText: '暂无数据' }} style={{ width: '100%', marginTop: '0px' }} pagination={{
                                        position: ['none', 'bottomLeft'],
                                        pageSize: 5
                                    }} scroll={{ x: 600 }} columns={[
                                        {
                                            title: '列名',
                                            dataIndex: 'column',
                                            key: 'column',
                                            ellipsis: true,
                                            width: 300,
                                        },
                                        {
                                            title: '编辑',
                                            dataIndex: 'edit',
                                            key: 'edit',
                                            ellipsis: true,
                                            width: 100,
                                        },
                                    ]} dataSource={directory.map(v => {
                                        return {
                                            column: <Select value={v.column} style={{ width: '100%' }} onChange={key => {
                                                v.column = key
                                                this.setState({})
                                            }}>
                                                {Object.entries(this.state.columns).map(kv => <Option value={kv[0]}>{kv[1]}</Option>)}
                                            </Select>,
                                            edit: <div>
                                                <DeleteOutlined onClick={() => {
                                                    let index = directory.indexOf(v)
                                                    directory.splice(index, 1)
                                                    this.setState({})
                                                }} style={{ fontSize: '24px' }} />
                                            </div>,
                                        }
                                    })}>
                                    </Table>
                                    <DeleteOutlined style={{
                                        position: 'absolute',
                                        fontSize: '24px',
                                        right: '0px',
                                        bottom: '20px'
                                    }} onClick={() => {
                                        let index = this.directorys.indexOf(directory)
                                        this.directorys.splice(index, 1)
                                        this.setState({})
                                    }}></DeleteOutlined>
                                    <PlusOutlined style={{
                                        position: 'absolute',
                                        fontSize: '24px',
                                        right: '30px',
                                        bottom: '20px'
                                    }} onClick={() => {
                                        directory.push({})
                                        this.setState({})
                                    }} />
                                </div>)}
                                <Button icon={<PlusOutlined style={{
                                    fontSize: '24px',
                                }} />} onClick={() => {
                                    this.directorys.push([])
                                    this.setState({})
                                }} style={{
                                    width: '100%',
                                }}></Button>
                            </Panel>
                        </Collapse>
                    </div>} topHeight={this.state.topHeight} move={e => {
                        this.setState({ topHeight: e.clientY - 75 })
                    }}></HSplit>} leftWidth={this.state.leftWidth} move={e => {
                        let width = e.clientX - 200
                        this.setState({ leftWidth: width })
                    }}></VSplit >
                </div>
            </div >
        )
    }
}
export default AddWeb
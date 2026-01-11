import React from 'react'
import { Collapse, Input, Checkbox, Button, Table, Radio, InputNumber, Popover } from 'antd'
import { EditOutlined, DeleteOutlined, UpOutlined, DownOutlined, PlusOutlined } from '@ant-design/icons'
import guid from './uuid.js'
const { Panel } = Collapse
const { TextArea } = Input
class ExtractDataAction extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            pageIndex: 0,
        }
    }
    render() {
        return (
            <div style={{ margin: '30px' }}>
                <div style={{ display: this.state.pageIndex == 0 ? '' : 'none' }}>
                    <Input value='提取数据' />
                    <Collapse defaultActiveKey={['1']}>
                        <Panel header="配置字段" key="1">
                            <Table rowClassName="ExtractDataActionRow" locale={{ emptyText: '暂无数据' }} style={{ width: '100%' }} scroll={{ x: 600 }} columns={[
                                {
                                    title: '列名',
                                    dataIndex: 'key',
                                    key: 'key',
                                    ellipsis: true,
                                    width: 120,
                                },
                                {
                                    title: '字段名',
                                    dataIndex: 'name',
                                    key: 'name',
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
                                {
                                    title: '递归',
                                    dataIndex: 'recursion',
                                    key: 'recursion',
                                    ellipsis: true,
                                    width: 110,
                                }
                            ]} dataSource={this.props.s.List.map(x => {
                                return {
                                    key: <Input value={x.key} onChange={e => {
                                        x.key = e.target.value
                                        this.setState({})
                                    }}></Input>,
                                    name: <Input value={x.name} onChange={e => {
                                        x.name = e.target.value
                                        this.setState({})
                                    }}></Input>,
                                    edit: <div>
                                        <UpOutlined onClick={() => {
                                            let index = this.props.s.List.indexOf(x)
                                            if (index > 0) {
                                                this.props.s.List.splice(index, 1)
                                                this.props.s.List.splice(index - 1, 0, x)
                                                this.setState({})
                                            }
                                        }} style={{ fontSize: '24px' }} />
                                        <DownOutlined onClick={() => {
                                            let index = this.props.s.List.indexOf(x)
                                            if (index < this.props.s.List.length - 1) {
                                                this.props.s.List.splice(index, 1)
                                                this.props.s.List.splice(index + 1, 0, x)
                                                this.setState({})
                                            }
                                        }} style={{ fontSize: '24px' }} />
                                        <EditOutlined onClick={() => this.setState({ pageIndex: 1, x: x })} style={{ fontSize: '24px' }} />
                                        <DeleteOutlined onClick={() => {
                                            let index = this.props.s.List.indexOf(x)
                                            this.props.s.List.splice(index, 1)
                                            this.setState({})
                                        }} style={{ fontSize: '24px' }} />
                                    </div>,
                                    recursion: <InputNumber min={0} onChange={value => {
                                        x.recursion = value
                                        this.setState({})
                                    }} value={x.recursion ? x.recursion : 0}></InputNumber>
                                }
                            })} pagination={false}></Table>
                            <Button icon={<PlusOutlined style={{
                                fontSize: '24px',
                            }} />} onClick={() => {
                                this.props.s.List.push({ key: guid(), name: this.props.header(), type: 'Text' })
                                this.setState({})
                            }} style={{
                                width: '100%',
                            }}></Button>
                            <Checkbox onChange={e => {
                                this.props.s.IsAppend = e.target.checked
                                this.setState({})
                            }} checked={this.props.s.IsAppend}>
                                合并数据
                            </Checkbox><br />
                            <Checkbox onChange={e => {
                                this.props.s.Isduplicate = e.target.checked
                                this.setState({})
                            }} checked={this.props.s.Isduplicate}>
                                去除重复
                            </Checkbox>
                        </Panel>
                    </Collapse>
                </div>
                <div style={{ width: '100%', display: this.state.pageIndex == 1 ? '' : 'none' }}>
                    <Input placeholder="XPath" value={this.state.XPath == undefined && this.state.x ? this.state.x.XPath : this.state.XPath} onChange={e => {
                        this.setState({ XPath: e.target.value })
                    }} onBlur={e => {
                        this.state.x.XPath = e.target.value
                        this.setState({ XPath: undefined })
                        this.props.updata()
                    }}></Input>
                    <Radio.Group onChange={e => {
                        this.state.x.type = e.target.value
                        this.setState({})
                        this.props.updata()
                    }} value={this.state.x ? this.state.x.type : null} style={{ width: '100%' }}>
                        <Radio value={'Text'}>抓取文本</Radio><br />
                        <Radio value={'IMG'}>抓取图片</Radio><br />
                        <Radio value={'VIDEO'}>抓取视频</Radio><br />
                        <Radio value={'Html'}>抓取源码</Radio><br />
                        <Radio value={'URL'}>页面网址</Radio><br />
                        <Radio value={'Title'}>页面标题</Radio><br />
                        <Radio value={'Source'}>页面源码</Radio><br />
                        <Radio value={'Time'}>当前时间</Radio><br />
                    </Radio.Group>
                    <Input placeholder="采集类型" value={this.state.type == undefined && this.state.x ? this.state.x.type : this.state.type} onChange={e => {
                        this.setState({ type: e.target.value })
                    }} onBlur={e => {
                        this.state.x.type = e.target.value
                        this.setState({ type: undefined })
                        this.props.updata()
                    }}></Input>
                    <TextArea style={{ width: '100%', height: '200px' }} value={this.state.x ? this.state.x.SampleText : undefined}></TextArea>
                    {this.state.x && this.state.x.regs ? this.state.x.regs.map(reg => {
                        let { source, target, result } = reg
                        return <div>
                            <div>
                                <UpOutlined onClick={() => {
                                    let index = this.state.x.regs.indexOf(reg)
                                    if (index > 0) {
                                        this.state.x.regs.splice(index, 1)
                                        this.state.x.regs.splice(index - 1, 0, reg)
                                        this.props.calc(this.state.x)
                                        this.setState({})
                                    }
                                }} style={{ fontSize: '24px' }} />
                                <DownOutlined onClick={() => {
                                    let index = this.state.x.regs.indexOf(reg)
                                    if (index < this.state.x.regs.length - 1) {
                                        this.state.x.regs.splice(index, 1)
                                        this.state.x.regs.splice(index + 1, 0, reg)
                                        this.props.calc(this.state.x)
                                        this.setState({})
                                    }
                                }} style={{ fontSize: '24px' }} />
                                <Popover content={<div>
                                    <TextArea style={{ width: '600px', height: '150px' }} placeholder="源正则表达式" value={source} onChange={e => {
                                        reg.source = e.target.value
                                        this.setState({})
                                    }} onBlur={e => {
                                        this.props.calc(this.state.x)
                                        this.setState({})
                                    }}></TextArea>
                                    <br />
                                    <TextArea style={{ width: '600px', height: '150px' }} placeholder="目标字符串" value={target} onChange={e => {
                                        reg.target = e.target.value
                                        this.setState({})
                                    }} onBlur={e => {
                                        this.props.calc(this.state.x)
                                        this.setState({})
                                    }}></TextArea>
                                </div>} trigger="click" placement="topLeft">
                                    <EditOutlined style={{ fontSize: '24px' }} />
                                </Popover>
                                <DeleteOutlined onClick={() => {
                                    let index = this.state.x.regs.indexOf(reg)
                                    if (index < 0) return
                                    this.state.x.regs.splice(index, 1)
                                    this.props.calc(this.state.x)
                                    this.setState({})
                                }} style={{ fontSize: '24px' }} />
                            </div>
                            <TextArea style={{ width: '100%', height: '200px' }} value={result}></TextArea>
                        </div>
                    }) : null}
                    <Button onClick={() => {
                        let value = this.state.x.SampleText
                        if (!this.state.x.regs) this.state.x.regs = []
                        let len = this.state.x.regs.length
                        if (len > 0) {
                            let { result } = this.state.x.regs[len - 1]
                            value = result
                        }
                        this.state.x.regs.push({ result: value })
                        this.setState({})
                    }}>添加正则替换</Button>
                    <Button onClick={() => this.setState({ pageIndex: 0 })} style={{ float: 'right' }}>返回</Button>
                </div>
            </div>
        )
    }
}
export default ExtractDataAction
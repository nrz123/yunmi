import React from 'react'
import { Collapse, Input, Checkbox, Button, Table, InputNumber, Select, message } from 'antd'
import { DeleteOutlined, PlusOutlined, VerticalAlignTopOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons'
const { ipcRenderer } = window.require('electron')
const { Option } = Select
const { Panel } = Collapse
class CookieAction extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        return (
            <div style={{ margin: '30px' }}>
                <Input value={'设置会话-' + this.props.s.key} />
                <Collapse defaultActiveKey={['1']}>
                    <Panel header="配置字段" key="1">
                        <Checkbox checked={this.props.s.Slice} onChange={e => {
                            this.props.s.Slice = e.target.checked
                            this.setState({})
                        }}>集群并行采集</Checkbox><br />
                        <Checkbox checked={this.props.s.Clear} onChange={e => {
                            this.props.s.Clear = e.target.checked
                            this.setState({})
                        }}>清空缓存</Checkbox><br />
                        <div style={{ marginTop: '20px' }}>
                            {this.props.s.List.map(cookies => <div style={{ position: 'relative' }}>
                                <Table rowClassName="CookieActionRow" locale={{ emptyText: '暂无数据' }} style={{ width: '100%', marginTop: '0px' }} pagination={{
                                    position: ['none', 'bottomLeft'],
                                    pageSize: 5
                                }} scroll={{ x: 600 }} columns={[
                                    {
                                        title: 'url',
                                        dataIndex: 'url',
                                        key: 'url',
                                        ellipsis: true,
                                        width: 300,
                                    },
                                    {
                                        title: 'name',
                                        dataIndex: 'name',
                                        key: 'name',
                                        ellipsis: true,
                                        width: 200,
                                    },
                                    {
                                        title: 'value',
                                        dataIndex: 'value',
                                        key: 'value',
                                        ellipsis: true,
                                        width: 200,
                                    },
                                    {
                                        title: 'domain',
                                        dataIndex: 'domain',
                                        key: 'domain',
                                        ellipsis: true,
                                        width: 200,
                                    },
                                    {
                                        title: 'path',
                                        dataIndex: 'path',
                                        key: 'path',
                                        ellipsis: true,
                                        width: 200,
                                    },
                                    {
                                        title: 'expirationDate',
                                        dataIndex: 'expirationDate',
                                        key: 'expirationDate',
                                        ellipsis: true,
                                        width: 200,
                                    },
                                    {
                                        title: 'hostOnly',
                                        dataIndex: 'hostOnly',
                                        key: 'hostOnly',
                                        ellipsis: true,
                                        width: 90,
                                    },
                                    {
                                        title: 'httpOnly',
                                        dataIndex: 'httpOnly',
                                        key: 'httpOnly',
                                        ellipsis: true,
                                        width: 90,
                                    },
                                    {
                                        title: 'secure',
                                        dataIndex: 'secure',
                                        key: 'secure',
                                        ellipsis: true,
                                        width: 90,
                                    },
                                    {
                                        title: 'sameSite',
                                        dataIndex: 'sameSite',
                                        key: 'sameSite',
                                        ellipsis: true,
                                        width: 200,
                                    },
                                    {
                                        title: 'session',
                                        dataIndex: 'session',
                                        key: 'session',
                                        ellipsis: true,
                                        width: 200,
                                    },
                                    {
                                        title: '编辑',
                                        dataIndex: 'edit',
                                        key: 'edit',
                                        ellipsis: true,
                                        width: 100,
                                    },
                                ]} dataSource={cookies.map(x => {
                                    return {
                                        url: <Input value={x.url} onChange={e => {
                                            x.url = e.target.value
                                            this.setState({})
                                        }}></Input>,
                                        name: <Input value={x.name} onChange={e => {
                                            x.name = e.target.value
                                            this.setState({})
                                        }}></Input>,
                                        value: <Input value={x.value} onChange={e => {
                                            x.value = e.target.value
                                            this.setState({})
                                        }}></Input>,
                                        domain: <Input value={x.domain} onChange={e => {
                                            x.domain = e.target.value
                                            this.setState({})
                                        }}></Input>,
                                        path: <Input value={x.path} onChange={e => {
                                            x.path = e.target.value
                                            this.setState({})
                                        }}></Input>,
                                        expirationDate: <InputNumber style={{ width: '100%' }} min={0} value={x.expirationDate} onChange={value => {
                                            x.expirationDate = value
                                            this.setState({})
                                        }}></InputNumber>,
                                        hostOnly: <Checkbox checked={x.hostOnly} onChange={e => {
                                            x.hostOnly = e.target.checked
                                            this.setState({})
                                        }}></Checkbox>,
                                        httpOnly: <Checkbox checked={x.httpOnly} onChange={e => {
                                            x.httpOnly = e.target.checked
                                            this.setState({})
                                        }}></Checkbox>,
                                        secure: <Checkbox checked={x.secure} onChange={e => {
                                            x.secure = e.target.checked
                                            this.setState({})
                                        }}></Checkbox>,
                                        session: <Checkbox checked={x.session} onChange={e => {
                                            x.session = e.target.checked
                                            this.setState({})
                                        }}></Checkbox>,
                                        sameSite: <Select style={{ width: '100%' }} value={x.sameSite} onChange={value => {
                                            x.sameSite = value
                                            this.setState({})
                                        }}>
                                            <Option value="unspecified">unspecified</Option>
                                            <Option value="no_restriction">no_restriction</Option>
                                            <Option value="lax">lax</Option>
                                            <Option value="strict">strict</Option>
                                        </Select>,
                                        edit: <div>
                                            <DeleteOutlined onClick={() => {
                                                let index = cookies.indexOf(x)
                                                cookies.splice(index, 1)
                                                this.setState({})
                                            }} style={{ fontSize: '24px' }} />
                                        </div>,
                                    }
                                })}>
                                </Table>
                                <PlusOutlined style={{
                                    position: 'absolute',
                                    fontSize: '24px',
                                    right: '120px',
                                    bottom: '20px'
                                }} onClick={() => {
                                    cookies.push({})
                                    this.setState({})
                                }} />
                                <VerticalAlignBottomOutlined style={{
                                    position: 'absolute',
                                    fontSize: '24px',
                                    right: '80px',
                                    bottom: '20px'
                                }} onClick={() => {
                                    ipcRenderer.invoke('export', {
                                        defaultPath: cookies.length == 0 ? 'out.json' : cookies[0].domain + '.json', filters: [
                                            { name: 'cookie', extensions: ['json'] }
                                        ]
                                    }).then(e => {
                                        ipcRenderer.invoke('write', e.filePath, JSON.stringify(cookies)).then(ret => {
                                            message.info(ret)
                                        })
                                    })
                                }} />
                                <VerticalAlignTopOutlined style={{
                                    position: 'absolute',
                                    fontSize: '24px',
                                    right: '40px',
                                    bottom: '20px'
                                }} onClick={() => {
                                    ipcRenderer.invoke('import', {
                                        filters: [
                                            { name: 'cookie', extensions: ['json'] }
                                        ]
                                    }).then(e => {
                                        if (!e.filePaths[0]) return
                                        ipcRenderer.invoke('read', e.filePaths[0]).then(ret => {
                                            cookies.length = 0
                                            cookies.push(...JSON.parse(ret).map(r => {
                                                if (!r.url) {
                                                    let { secure = false, domain = "", path = "" } = r
                                                    r.url = (secure ? "https://" : "http://") + domain.replace(/^\./, "") + path
                                                }
                                                return r
                                            }))
                                            this.setState({})
                                        })
                                    })
                                }} />
                                <DeleteOutlined style={{
                                    position: 'absolute',
                                    fontSize: '24px',
                                    right: '0px',
                                    bottom: '20px'
                                }} onClick={() => {
                                    let index = this.props.s.List.indexOf(cookies)
                                    this.props.s.List.splice(index, 1)
                                    this.setState({})
                                }} />
                            </div>)}
                        </div>
                        <div style={{}}>
                            <Button icon={<PlusOutlined style={{
                                fontSize: '24px',
                            }} />} onClick={() => {
                                this.props.cookie()
                                this.setState({})
                            }} style={{
                                width: '100%',
                            }}></Button>
                        </div>
                    </Panel>
                </Collapse>
            </div>
        )
    }
}
export default CookieAction
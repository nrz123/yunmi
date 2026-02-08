import React from 'react'
import { Collapse, Input, Button, Table } from 'antd'
import { DeleteOutlined, PlusOutlined, UpOutlined, DownOutlined } from '@ant-design/icons'
const { Panel } = Collapse
class EditAction extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        return (
            <div style={{ margin: '30px' }}>
                <Input value={'编辑元素-' + this.props.s.key} />
                <Collapse defaultActiveKey={['1']}>
                    <Panel header="配置字段" key="1">
                        <Input placeholder="XPath" value={this.state.XPath == undefined ? this.props.s.XPath : this.state.XPath} onChange={e => {
                            this.setState({ XPath: e.target.value })
                        }} onBlur={e => {
                            this.props.s.XPath = e.target.value
                            this.setState({ XPath: undefined })
                        }}></Input>
                        <div style={{ marginTop: '20px' }}>
                            <div style={{ position: 'relative' }}>
                                <Table rowClassName="CookieActionRow" locale={{ emptyText: '暂无数据' }} style={{ width: '100%', marginTop: '0px' }} pagination={{
                                    position: ['none', 'bottomLeft'],
                                    pageSize: 5
                                }} scroll={{ x: 600 }} columns={[
                                    {
                                        title: '属性',
                                        dataIndex: 'name',
                                        key: 'name',
                                        ellipsis: true,
                                        width: 200,
                                    },
                                    {
                                        title: '值',
                                        dataIndex: 'value',
                                        key: 'value',
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
                                ]} dataSource={this.props.s.List.map(x => {
                                    return {
                                        name: <Input value={x.name} onChange={e => {
                                            x.name = e.target.value
                                            this.setState({})
                                        }}></Input>,
                                        value: <Input value={x.value} onChange={e => {
                                            x.value = e.target.value
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
                                            <DeleteOutlined onClick={() => {
                                                let index = this.props.s.List.indexOf(x)
                                                this.props.s.List.splice(index, 1)
                                                this.setState({})
                                            }} style={{ fontSize: '24px' }} />
                                        </div>,
                                    }
                                })}>
                                </Table>
                                <Button icon={<PlusOutlined style={{
                                    fontSize: '24px',
                                }} />} onClick={() => {
                                    this.props.s.List.push({ name: '', value: '' })
                                    this.setState({})
                                }} style={{
                                    width: '100%',
                                }}></Button>
                            </div>
                        </div>
                    </Panel>
                </Collapse>
            </div>
        )
    }
}
export default EditAction
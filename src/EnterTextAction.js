import React from 'react'
import { Collapse,Input,Checkbox, Button,Table } from 'antd'
import {DeleteOutlined,PlusOutlined} from '@ant-design/icons'
const { Panel} = Collapse
class EnterTextAction extends React.Component {
    constructor(props) {
        super(props)
        this.state={}
    }
    render(){
        return(
            <div style={{margin:'30px'}}>
                <Input value='输入文本'></Input>
                <Collapse defaultActiveKey={['1']}>
                    <Panel header="设置" key="1">
                        <Checkbox checked={this.props.s.Slice} onChange={e=>{
                            this.props.s.Slice=e.target.checked
                            this.setState({})
                        }}>集群并行采集</Checkbox><br/>
                        <Checkbox checked={this.props.s.Enter} onChange={e=>{
                            this.props.s.Enter=e.target.checked
                            this.setState({})
                        }}>输入后按回车键</Checkbox><br/>
                        <Input placeholder="XPath" value={this.state.XPath==undefined?this.props.s.XPath:this.state.XPath} onChange={e=>{
                            this.setState({XPath:e.target.value})
                        }} onBlur={e=>{
                            this.props.s.XPath=e.target.value
                            this.setState({XPath:undefined})
                        }}></Input>
                        <Table rowClassName="EnterTextActionRow" locale={{ emptyText: '暂无数据' }} style={{width:'100%',marginTop:'0px'}} pagination={false} scroll={{x:600}} columns={[
                            {
                                title: '文本列表',
                                dataIndex: 'text',
                                key: 'text',
                                ellipsis: true,
                                width:500,
                            },
                            {
                                title: '删除',
                                dataIndex: 'delete',
                                key: 'delete',
                                ellipsis: true,
                                width:100,
                            },
                        ]} dataSource={this.props.s.List.map(x=>{
                            return {
                                text:<Input value={x.value} onChange={e=>{
                                    x.value=e.target.value
                                    this.setState({})
                                }}></Input>,
                                delete:<div>
                                    <DeleteOutlined onClick={()=>{
                                        let index=this.props.s.List.indexOf(x)
                                        this.props.s.List.splice(index,1)
                                        this.setState({})
                                    }} style={{fontSize:'24px'}}/>
                                </div>
                            }
                        })}>
                        </Table>
                        <Button icon={<PlusOutlined style={{
                            fontSize:'24px',
                        }}/>} onClick={()=>{
                            this.props.s.List.push({value:''})
                            this.setState({})
                        }}  style={{
                            width:'100%',
                        }}></Button>
                    </Panel>
                </Collapse>
            </div>
        )
    }
}
export default EnterTextAction
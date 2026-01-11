import React from 'react'
import { Collapse,Input,Button,List,Checkbox,Table} from 'antd'
import {DeleteOutlined,PlusOutlined} from '@ant-design/icons'
const { Panel} = Collapse
class LoopAction extends React.Component {
    constructor(props) {
        super(props)
        this.state={}
    }
    render(){
        if(this.props.s.TextList&&this.TextList!=this.props.s.TextList){
            this.TextList=this.props.s.TextList
            this.props.s.TextList=undefined
        }
        return(
            <div style={{margin:'30px'}}>
                <Input value='循环列表'></Input>
                <Collapse defaultActiveKey={['1']}>
                    <Panel header="设置" key="1">
                        <Checkbox checked={this.props.s.Slice} onChange={e=>{
                            this.props.s.Slice=e.target.checked
                            this.setState({})
                        }}>集群并行采集</Checkbox>
                        <Table rowClassName="LoopActionRow" locale={{ emptyText: '暂无数据' }} style={{width:'100%',marginTop:'0px'}} pagination={false} scroll={{x:600}} columns={[
                            {
                                title: '元素列表',
                                dataIndex: 'xpath',
                                key: 'xpath',
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
                                xpath:<Input placeholder='请输入XPath' value={x.value} onChange={e=>{
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
                        <hr style={{
                            height:'1px',
                            borderTop:'1px',
                            solid:'#555555'
                        }}/>
                        <List style={{
                            height:'200px',
                            overflowY:'scroll',
                        }}>
                            {this.TextList?this.TextList.map(text=><List.Item style={{
                                padding:'6px 0'
                            }}>
                                {text}
                            </List.Item>):undefined}
                        </List>
                    </Panel>
                </Collapse>
            </div>
        )
    }
}
export default LoopAction
import React from 'react'
import { Collapse,Input,Checkbox, Button,Popover,Table} from 'antd'
import {DeleteOutlined,PlusOutlined,UpOutlined,DownOutlined} from '@ant-design/icons'
const { Panel} = Collapse
class NavigateAction extends React.Component {
    constructor(props) {
        super(props)
        this.state={}
    }
    render(){
        return(
            <div style={{margin:'30px'}}>
                <Input value='打开网页'></Input>
                <Collapse defaultActiveKey={['1']}>
                    <Panel header="设置" key="1">
                        <Checkbox checked={this.props.s.Slice} onChange={e=>{
                            this.props.s.Slice=e.target.checked
                            this.setState({})
                        }}>集群并行采集</Checkbox>
                        <Table rowClassName="NavigateActionRow" locale={{ emptyText: '暂无数据' }} style={{width:'100%',marginTop:'0px'}} pagination={false} scroll={{x:600}} columns={[
                            {
                                title: '网址列表',
                                dataIndex: 'url',
                                key: 'url',
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
                                url:<Input value={x.value} onChange={e=>{
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
                        }}/>} onClick={this.props.add}  style={{
                            width:'100%',
                        }}></Button>
                    </Panel>
                </Collapse>
            </div>
        )
    }
}
export default NavigateAction
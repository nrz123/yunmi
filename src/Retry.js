import React from 'react'
import { Collapse,Input,Select,Checkbox, Button,Popover,Radio,InputNumber} from 'antd'
const { Option } = Select
class Retry extends React.Component {
    constructor(props) {
        super(props)
        this.state={}
    }
    render(){
        return(
            <div>
                <Checkbox checked={this.props.s.EnableRetry} onChange={e=>{
                    this.props.s.EnableRetry=e.target.checked
                    this.setState({})
                }}>如下条件满足时重试</Checkbox><br/>
                {this.props.s.RetryConditions?this.props.s.RetryConditions.map(RetryCondition=>
                    <div style={{padding:'5px',margin:'5px',border:'1px solid black',}}>
                        <table width='100%' style={{margin:'10px 0px 0px 0px'}}>
                            <tbody width='100%'>
                                <tr>
                                    <td width='100'>当前页面的</td>
                                    <td>
                                    <Select style={{ width: 120 }} value={RetryCondition.ConditionType} onChange={value=>{
                                        RetryCondition.ConditionType=value
                                        this.setState({})
                                    }}>
                                        <Option value='URLContain'>网址</Option>
                                        <Option value='ContainText'>文本</Option>
                                        <Option value='XPathContain'>元素</Option>
                                    </Select>
                                    <Button onClick={e=>{
                                        let index=this.props.s.RetryConditions.indexOf(RetryCondition)
                                        this.props.s.RetryConditions.splice(index,1)
                                        this.setState({})
                                    }}>删除</Button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Select style={{ width: 120 }} value={RetryCondition.ContainsOrNot?'Contains':'Not'} onChange={value=>{
                                            RetryCondition.ContainsOrNot=value=='Contains'
                                            this.setState({})
                                        }}>
                                            <Option value='Contains'>包含</Option>
                                            <Option value='Not'>不包含</Option>
                                        </Select>
                                    </td>
                                    <td>
                                        <Input value={this.state.MainValue==undefined?RetryCondition.MainValue:this.state.MainValue} onChange={e=>{
                                            this.setState({MainValue:e.target.value})
                                        }} onBlur={e=>{
                                            RetryCondition.MainValue=e.target.value
                                            this.setState({MainValue:undefined})
                                        }}></Input>
                                    </td>
                                </tr>
                                <tr style={{display:RetryCondition.ConditionType=='XPathContain'?'':'none'}}>
                                    <td>iframe Xpath</td>
                                    <td>
                                        <Input value={this.state.MinorValue==undefined?RetryCondition.MinorValue:this.state.MinorValue} onChange={e=>{
                                            this.setState({MinorValue:e.target.value})
                                        }} onBlur={e=>{
                                            RetryCondition.MinorValue=e.target.value
                                            this.setState({MinorValue:undefined})
                                        }}></Input>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ):null}
                <Button onClick={e=>{
                    let RetryCondition={
                        ConditionType:'ContainText',
                        ContainsOrNot:false
                    }
                    if(this.props.s.RetryConditions){
                        this.props.s.RetryConditions.push(RetryCondition)
                    }else{
                        this.props.s.RetryConditions=[RetryCondition]
                    }
                    this.setState({})
                }}>添加条件</Button>
                <table width='100%' style={{margin:'10px 0px 0px 0px'}}>
                    <tbody width='100%'>
                        <tr>
                            <td width='100'>重试次数</td>
                            <td>
                                <InputNumber min={0} value={this.props.s.MaxRetry==null?0:this.props.s.MaxRetry} onChange={value=>{
                                    this.props.s.MaxRetry=value
                                    this.setState({})
                                }}></InputNumber>
                            </td>
                        </tr>
                        <tr>
                            <td>时间间隔</td>
                            <td>
                                <InputNumber min={0} value={this.props.s.RetryTime==null?0:this.props.s.RetryTime} onChange={value=>{
                                    this.props.s.RetryTime=value
                                    this.setState({})
                                }}></InputNumber> 秒
                            </td>
                        </tr>
                        <tr>
                            <td>防封选项</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
                <Checkbox checked={this.props.s.EnableSwitchUserAgent} onChange={e=>{
                    this.props.s.EnableSwitchUserAgent=e.target.checked
                    this.setState({})
                }}>重试时同时切换浏览器版本</Checkbox>
            </div>
        )
    }
}
export default Retry
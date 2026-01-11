import React from 'react'
import { Input,Select,Checkbox,Radio,InputNumber } from 'antd'
const { Option } = Select
class Scroll extends React.Component {
    constructor(props) {
        super(props)
        this.state={}
    }
    render(){
        return(
            <div>
                <Checkbox checked={this.props.s.ScrollDown} onChange={e=>{
                    this.props.s.ScrollDown=e.target.checked
                    this.setState({})
                }}>页面加载后向下滚动</Checkbox><br/>
                <table width='100%' style={{display:this.props.s.ScrollDown?'':'none'}}>
                    <tbody>
                        <tr>
                            <td width='100'>滚动方式</td>
                            <td><Radio.Group onChange={e=>{
                                this.props.s.ScrollType=e.target.value
                                this.setState({})
                            }} value={this.props.s.ScrollType}>
                                <Radio value={'0'}>滚动到底部</Radio>
                                <Radio value={'1'}>向下滚动一屏</Radio>
                            </Radio.Group></td>
                        </tr>
                        <tr>
                            <td>滚动次数</td>
                            <td>
                                <InputNumber min={0} value={this.props.s.ScrollTime==null?0:this.props.s.ScrollTime} onChange={value=>{
                                    this.props.s.ScrollTime=value
                                    this.setState({})
                                }}></InputNumber>
                            </td>
                        </tr>
                        <tr>
                            <td>每次间隔</td>
                            <td>
                                <InputNumber min={0} value={this.props.s.ScrollInterval==null?0:this.props.s.ScrollInterval} onChange={value=>{
                                    this.props.s.ScrollInterval=value
                                    this.setState({})
                                }}></InputNumber> 秒
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}
export default Scroll
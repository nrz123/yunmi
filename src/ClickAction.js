import React from 'react'
import { Collapse,Input,Checkbox,InputNumber} from 'antd'
const { Panel} = Collapse
class ClickAction extends React.Component {
    constructor(props) {
        super(props)
        this.state={}
    }
    render(){
        return(
            <div style={{margin:'30px'}}>
                <Input value='点击元素'/>
                <Collapse defaultActiveKey={['1']}>
                    <Panel header="点击选项" key="1">
                        <Input placeholder="XPath" value={this.state.XPath==undefined?this.props.s.XPath:this.state.XPath} onChange={e=>{
                            this.setState({XPath:e.target.value})
                        }} onBlur={e=>{
                            this.props.s.XPath=e.target.value
                            this.setState({XPath:undefined})
                        }}></Input>
                        <Checkbox checked={this.props.s.Right} onChange={e=>{
                            this.props.s.Right=e.target.checked
                            this.setState({})
                        }}>右键点击</Checkbox><br/>
                        等待时长: <InputNumber min={0} value={this.props.s.WaitSeconds == null ? 3 : this.props.s.WaitSeconds} onChange={value => {
                            this.props.s.WaitSeconds = value
                            this.setState({})
                        }}></InputNumber> 秒<br />
                    </Panel>
                </Collapse>
            </div>
        )
    }
}
export default ClickAction
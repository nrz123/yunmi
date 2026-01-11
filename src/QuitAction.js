import React from 'react'
import { Collapse,Radio,Input} from 'antd'
const { Panel} = Collapse
class QuitAction extends React.Component {
    constructor(props) {
        super(props)
        this.state={}
    }
    render(){
        return(
            <div style={{margin:'30px'}}>
                <Input value='结束流程'></Input>
                <Collapse defaultActiveKey={['1']}>
                    <Panel header="类型" key="1">
                        <Radio.Group value={this.props.s.Type} onChange={e=>{
                            this.props.s.Type=e.target.value
                            this.setState({})
                        }}>
                            <Radio value={'Continue'}>退出本次循环</Radio><br/>
                            <Radio value={'Break'}>退出当前循环</Radio><br/>
                            <Radio value={'End'}>退出当前任务</Radio><br/>
                        </Radio.Group>
                    </Panel>
                </Collapse>
            </div>
        )
    }
}
export default QuitAction
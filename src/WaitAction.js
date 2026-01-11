import React from 'react'
import { Collapse, Input, InputNumber } from 'antd'
const { Panel } = Collapse
class WaitAction extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        return (
            <div style={{ margin: '30px' }}>
                <Input value='延时等待' />
                <Collapse defaultActiveKey={['1']}>
                    <Panel header="延时设置" key="1">
                        等待时长: <InputNumber min={0} value={this.props.s.WaitSeconds == null ? 0 : this.props.s.WaitSeconds} onChange={value => {
                            this.props.s.WaitSeconds = value
                            this.setState({})
                        }}></InputNumber> 秒<br />
                        循环次数: <InputNumber min={1} value={this.props.s.LoopTime == null ? 1 : this.props.s.LoopTime} onChange={value => {
                            this.props.s.LoopTime = value
                            this.setState({})
                        }}></InputNumber> 次<br />
                    </Panel>
                </Collapse>
            </div>
        )
    }
}
export default WaitAction
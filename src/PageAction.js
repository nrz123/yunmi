import React from 'react'
import { Collapse, Checkbox, Radio, Input } from 'antd'
const { Panel } = Collapse
class PageAction extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        return (
            <div style={{ margin: '30px' }}>
                <Input value={'操作页面-' + this.props.s.key}></Input>
                <Collapse defaultActiveKey={['1']}>
                    <Panel header="类型" key="1">
                        <Radio.Group value={this.props.s.Type} onChange={e => {
                            this.props.s.Type = e.target.value
                            this.setState({})
                        }}>
                            <Radio value={'Scroll'}>页面滚动</Radio><br />
                            <Radio value={'Back'}>页面回退</Radio><br />
                            <Radio value={'Reload'}>页面重载</Radio><br />
                        </Radio.Group>
                    </Panel>
                </Collapse>
            </div>
        )
    }
}
export default PageAction
import React from 'react'
import { Collapse, Input, Checkbox } from 'antd'
const { Panel } = Collapse
class BranchAction extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        return (
            <div style={{ margin: '30px' }}>
                <Input value={'条件判断-' + this.props.s.key} />
                <Collapse defaultActiveKey={['1']}>
                    <Panel header="成立条件" key="1">
                        <Checkbox checked={this.props.s.Else} onChange={e => {
                            this.props.s.Else = e.target.checked
                            this.setState({})
                        }}>else if</Checkbox><br />
                        <Checkbox checked={this.props.s.CheckData} onChange={e => {
                            this.props.s.CheckData = e.target.checked
                            this.setState({})
                        }}>数据查重</Checkbox>
                        <Input placeholder="XPath" value={this.state.XPath == undefined ? this.props.s.XPath : this.state.XPath} onChange={e => {
                            this.setState({ XPath: e.target.value })
                        }} onBlur={e => {
                            this.props.s.XPath = e.target.value
                            this.setState({ XPath: undefined })
                        }}></Input>
                    </Panel>
                </Collapse>
            </div>
        )
    }
}
export default BranchAction
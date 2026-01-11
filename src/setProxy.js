import React from 'react'
import { Checkbox, Input, Modal } from 'antd'
const { TextArea } = Input
class setProxy extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.visible) {
            this.setState({ proxy: nextProps.step.proxy, userAgent: nextProps.step.userAgent})
        }
    }
    render() {
        return (
            <Modal title="设置" visible={this.props.visible} onOk={() => this.props.onOk(this.state.proxy, this.state.userAgent)} onCancel={this.props.close}>
                <Input placeholder='代理服务器地址:http://ip:port' value={this.state.proxy} onChange={e => this.setState({ proxy: e.target.value })}></Input>
                <div style={{ height: '14px' }}></div>
                <Input placeholder='UserAgent' value={this.state.userAgent} onChange={e => this.setState({ userAgent: e.target.value })}></Input>
                <div style={{ height: '14px' }}></div>
            </Modal>
        )
    }
}
export default setProxy
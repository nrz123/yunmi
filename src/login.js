import React from 'react'
import './login.css'
import { Form, Input, Button, message, InputNumber, Select } from 'antd'
const { Option } = Select
const { ipcRenderer } = window.require('electron')
class Login extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            protocal: ipcRenderer.sendSync('protocal')
        }
    }
    componentDidMount() {
        ipcRenderer.on('message', (event, mess) => message.info(mess))
    }
    render() {
        const onFinish = values => {
            const { serverHost, password } = values
            ipcRenderer.send('login', {
                protocal: this.state.protocal,
                serverHost: serverHost,
                password: password
            })
        }
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <Form
                    initialValues={{
                        serverHost: ipcRenderer.sendSync('serverHost'),
                        password: ipcRenderer.sendSync('password')
                    }}
                    onFinish={onFinish}
                    style={{ width: '100%', position: 'absolute', padding: '0px 25px 0px 25px', top: '50px' }}
                >
                    <Form.Item name="serverHost">
                        <Input addonBefore={<Select value={this.state.protocal} onChange={value => this.setState({ protocal: value })} className="select-before">
                            <Option value="http://">http://</Option>
                            <Option value="https://">https://</Option>
                        </Select>} placeholder="服务器地址" />
                    </Form.Item>
                    <Form.Item name="password">
                        <Input.Password placeholder="密码" />
                    </Form.Item>
                    <Form.Item>
                        <Button style={{ width: '100%' }} type="primary" htmlType="submit">
                            登录
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button style={{ width: '100%' }} onClick={() => ipcRenderer.send('single')}>
                            单机
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button style={{ width: '100%' }} onClick={() => ipcRenderer.send('quit', '程序退出')}>
                            退出
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        )
    }
}
export default Login
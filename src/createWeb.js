import React from 'react'
import { Input, Button } from 'antd'
import { DeleteOutlined, UpOutlined, DownOutlined } from '@ant-design/icons'
import moment from 'moment'
import 'moment/locale/zh-cn'
moment.locale('zh-cn')
const { TextArea } = Input
const { ipcRenderer } = window.require('electron')
class createWeb extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            pages: []
        }
    }
    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                {this.state.pages.map(v => {
                    return <div>
                        <div>
                            <UpOutlined onClick={() => {
                                let index = this.state.pages.indexOf(v)
                                if (index > 0) {
                                    this.state.pages.splice(index, 1)
                                    this.state.pages.splice(index - 1, 0, v)
                                    this.setState({})
                                }
                            }} style={{ fontSize: '24px' }} />
                            <DownOutlined onClick={() => {
                                let index = this.state.pages.indexOf(v)
                                if (index < this.state.pages.length - 1) {
                                    this.state.pages.splice(index, 1)
                                    this.state.pages.splice(index + 1, 0, v)
                                    this.setState({})
                                }
                            }} style={{ fontSize: '24px' }} />
                            <DeleteOutlined onClick={() => {
                                let index = this.state.pages.indexOf(v)
                                if (index < 0) return
                                this.state.pages.splice(index, 1)
                                this.setState({})
                            }} style={{ fontSize: '24px' }} />
                        </div>
                        <TextArea style={{ width: '100%', height: '200px' }} value={v.value} onChange={e => {
                            v.value = e.target.value
                            this.setState({})
                        }}></TextArea>
                    </div>
                })}
                <Button onClick={() => {
                    this.state.pages.push({ value: '' })
                    this.setState({})
                }}>添加内容</Button>
                <Button onClick={() => {
                    this.state.pages.push({ value: '' })
                    this.setState({})
                }}>保存</Button>
            </div>
        )
    }
}
export default createWeb
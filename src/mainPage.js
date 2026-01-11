import React from 'react'
import guid from './uuid.js'
import { Input, message, } from 'antd'
import Browser from './browser'
import { saveTask } from './task.js'
import { ref } from './tabRef.js'
const { Search } = Input
class MainPage extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <Search
                    placeholder="输入网址"
                    allowClear
                    enterButton="新建任务"
                    size="large"
                    style={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '600px',
                        top: '200px'
                    }}
                    onSearch={value => value ? this.props.addPane(<Browser ref={ref} tabKey={guid()} tab={'新建任务'} taskName={'新建任务'} saveTask={saveTask} url={value}></Browser>) : message.info('网址不能为空')}
                />
            </div>
        )
    }
}
export default MainPage
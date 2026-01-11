import React from 'react'
import { Input } from 'antd'
const { Search } = Input
const {ipcRenderer}=window.require('electron')
class Set extends React.Component {
    constructor(props) {
        super(props)
        this.state={}
    }
    render(){
        return(
            <div style={{
                width:'100%',
                height:'100%',
                fontSize:'18px',
                fontWeight:'300'
            }}>
                <Search
                    value={global.set.filePath}
                    placeholder="文件下载路径"
                    allowClear
                    enterButton="选择文件夹"
                    size="large"
                    onChange={e=>{
                        global.set.filePath=e.target.value
                        this.setState({})
                    }}
                    onBlur={e=>{
                        let date = Math.round(new Date().getTime() / 1000) + 30 * 24 * 60 * 60
                        ipcRenderer.send('setCookie',{ url: "http://127.0.0.1:52126", name: 'set', value: JSON.stringify(global.set), expirationDate: date })
                    }}
                    onSearch={value=>ipcRenderer.invoke('import',{defaultPath:value,properties:['openDirectory']}).then(e=>{
                        if(!e.filePaths)return
                        global.set.filePath=e.filePaths[0]
                        this.setState({})
                    })}
                />
            </div>
        )
    }
}
export default Set
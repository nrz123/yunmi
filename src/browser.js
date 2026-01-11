import React from 'react'
import './browser.css'
import Flow from './flow.js'
import FlowData from './flowData.js'
import { Input, message, Switch } from 'antd'
import { ArrowLeftOutlined, SaveOutlined, SettingOutlined, ToolOutlined } from '@ant-design/icons'
import HSplit from './hsplit'
import VSplit from './vsplit'
import NavigateAction from './NavigateAction.js'
import CookieAction from './CookieAction.js'
import ClickAction from './ClickAction.js'
import EnterTextAction from './EnterTextAction.js'
import LoopAction from './LoopAction.js'
import WaitAction from './WaitAction.js'
import BranchAction from './BranchAction.js'
import QuitAction from './QuitAction.js'
import EditAction from './EditAction.js'
import PageAction from './PageAction.js'
import ExtractDataAction from './ExtractDataAction.js'
import SetProxy from './setProxy.js'
import EnterText from './enterText.js'
import { stepfind } from './stepfind.js'
import encode from './encode.js'
import guid from './uuid';
const { ipcRenderer } = window.require('electron')
class Browser extends React.Component {
    constructor(props) {
        super(props)
        let url
        let NavigateAction
        this.task = this.props.task
        if (this.task) {
            this.step = typeof (this.task.step) == 'string' ? JSON.parse(this.task.step) : this.task.step
            let step = stepfind(this.step, step => step.nodeName == 'NavigateAction')[0]
            if ((NavigateAction = step) && step.List[0]) url = step.List[0].value
        } else {
            this.task = { id: this.props.tabKey }
            url = this.props.url
            if (url && !url.startsWith('http')) url = 'https://' + url
            this.step = { steps: [NavigateAction = { nodeName: 'NavigateAction', key: guid(), List: url ? [{ value: url }] : [], steps: [] }] }
        }
        this.state = {
            topHeight: 380,
            leftWidth: 850,
            url: url,
            s: NavigateAction,
            taskName: this.props.taskName,
            page: 0
        }
    }
    tabSelect() {
        ipcRenderer.removeAllListeners('XPath-' + this.props.tabKey)
        ipcRenderer.on('XPath-' + this.props.tabKey, (event, value) => {
            this.XPaths = value
            let { absXPaths, relXPaths, useLoop } = this.XPaths
            this.setState({ useLoop: useLoop, only: (useLoop && relXPaths.length == 1) || (!useLoop && absXPaths.length == 1), has: true })
        })
        ipcRenderer.invoke('viewManage', this.props.tabKey, 'viewShow').catch(e => { })
    }
    tabLeave() {
        ipcRenderer.removeAllListeners('XPath-' + this.props.tabKey)
        ipcRenderer.invoke('viewManage', this.props.tabKey, 'viewHide').catch(e => { })
    }
    tabRemove() {
        ipcRenderer.removeAllListeners('XPath-' + this.props.tabKey)
        ipcRenderer.invoke('viewManage', this.props.tabKey, 'viewRemove').catch(e => { })
    }
    componentWillMount() {
        this.hindex = 0
        document.ondragstart = e => false
        this.flowData = new FlowData(this.step, this.select, this.state.s)
    }
    componentDidMount() {
        ipcRenderer.on('XPath-' + this.props.tabKey, (event, value) => {
            this.XPaths = value
            let { absXPaths, relXPaths, useLoop } = this.XPaths
            this.setState({ useLoop: useLoop, only: (useLoop && relXPaths.length == 1) || (!useLoop && absXPaths.length == 1), has: true })
        })
        let webview = document.getElementById(this.props.tabKey)
        let width = webview.offsetWidth
        let height = webview.offsetHeight
        ipcRenderer.invoke('viewManage', this.props.tabKey, 'viewShow').catch(e => { })
        ipcRenderer.invoke('viewManage', this.props.tabKey, 'viewResize', { x: 200, y: 113, width: width, height: height }).catch(e => { })
        this.step.proxy && ipcRenderer.invoke('viewManage', this.props.tabKey, 'setProxy', this.step.proxy).catch(e => { })
        ipcRenderer.invoke('viewManage', this.props.tabKey, 'setUserAgent', this.step.userAgent ? this.step.userAgent : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36").catch(e => { })
        let s = stepfind(this.step, step => step.nodeName == 'CookieAction')[0]
        s && ipcRenderer.invoke('viewManage', this.props.tabKey, 'setCookies', s.List[0]).catch(e => { })
        ipcRenderer.invoke('viewManage', this.props.tabKey, 'loadURL', this.state.url).catch(e => { })
    }
    opera = (channel, value) => {
        switch (channel) {
            case 'branch': {
                let { absXPaths } = this.XPaths
                let action = { nodeName: 'BranchAction', key: guid(), XPath: absXPaths[0], steps: [] }
                this.insert(action)
                this.flowData.select(action)
            } break
            case 'click': {
                let { absXPaths, loopXPath, relXPaths, useLoop } = this.XPaths
                let click = { nodeName: 'ClickAction', key: guid(), XPath: useLoop ? relXPaths[0] : absXPaths[0] }
                click = value == 'loop' ? { nodeName: 'WaitAction', key: guid(), WaitSeconds: 0, LoopTime: 50, steps: [click] } : click
                let action = useLoop ? { nodeName: 'LoopAction', key: guid(), List: [{ value: loopXPath }], steps: [click] } : click
                this.insert(action)
                this.flowData.select(click)
            } break
            case 'text': {
                let { absXPaths } = this.XPaths
                let action = { nodeName: 'EnterTextAction', key: guid(), List: [{ value: value }], XPath: absXPaths[0], steps: [] }
                this.insert(action)
                this.flowData.select(action)
            } break
            case 'extract': {
                let { absXPaths, loopXPath, relXPaths, useLoop } = this.XPaths
                if (!useLoop && this.state.s && this.state.s.nodeName == 'ExtractDataAction') {
                    this.state.s.List = this.state.s.List.concat(absXPaths.map(x => {
                        return { key: guid(), name: this.header(), type: 'Text', XPath: x }
                    }))
                    this.setState({})
                    this.updata()
                } else {
                    let extract = {
                        nodeName: 'ExtractDataAction', key: guid(), List: (useLoop ? relXPaths : absXPaths).map(x => {
                            return { key: guid(), name: this.header(), type: 'Text', XPath: x }
                        })
                    }
                    let action = useLoop ? { nodeName: 'LoopAction', key: guid(), List: [{ value: loopXPath }], steps: [extract] } : extract
                    this.insert(action)
                    this.flowData.select(extract)
                }
            } break
        }
        let code = `window.runApi.Clear()`
        ipcRenderer.invoke('viewManage', this.props.tabKey, 'executeJavaScript', code).catch(e => { })
        this.setState({ has: false })
        this.XPaths = {}
    }
    insert = s => {
        if (this.state.s.steps && (this.state.s.nodeName != 'ClickAction' || this.state.s.IsLoop)) {
            this.flowData.insert(s, this.state.s, this.state.s.steps.length)
        } else {
            let parent = stepfind(this.step, x => x == this.state.s)[1]
            if (!parent) return
            let index = parent.steps.indexOf(this.state.s) + 1
            this.flowData.insert(s, parent, index)
        }
    }
    header = () => '字段' + this.hindex++
    calc = s => {
        if (!s || !s.regs || s.regs.length == 0) return
        let value = s.SampleText
        s.regs.forEach(reg => {
            let { source, target } = reg
            try {
                reg.result = value = value.replace(new RegExp(source ? source : '', 'img'), target ? target : '')
            } catch {
                reg.result = value
            }
        })
    }
    updata = s => {
        if (!s) s = this.state.s
        if (!s) return
        switch (s.nodeName) {
            case 'LoopAction':
            case 'ExtractDataAction': {
                this.XPath(stepfind(this.step, x => x == s)).then(XPath => {
                    switch (s.nodeName) {
                        case 'LoopAction': {
                            let ListBase64 = encode(JSON.stringify(s.List.map(x => [XPath, x.value].join(''))))
                            let code = `window.runApi.XPaths('${ListBase64}')`
                            ipcRenderer.invoke('viewManage', this.props.tabKey, 'executeJavaScript', code).then(XPaths => {
                                let ListBase64 = encode(JSON.stringify(XPaths.map(x => {
                                    return { type: 'Text', XPath: x }
                                })))
                                let code = `window.runApi.Datas('${ListBase64}','','preview')`
                                ipcRenderer.invoke('viewManage', this.props.tabKey, 'executeJavaScript', code).then(Datas => {
                                    s.TextList = Datas.map(d => d.value)
                                    this.setState({})
                                }).catch(e => { })
                            }).catch(e => { })
                        } break
                        case 'ExtractDataAction': {
                            let code = `window.runApi.Datas('${encode(JSON.stringify(s.List))}','${encode(XPath)}','preview')`
                            ipcRenderer.invoke('viewManage', this.props.tabKey, 'executeJavaScript', code).then(datas => {
                                datas.forEach(data => {
                                    let extract = s.List.find(e => e.key == data.key)
                                    if (extract) {
                                        extract.SampleText = data.value.substring(0, 40)
                                        this.calc(extract)
                                    }
                                })
                                this.setState({})
                            }).catch(e => { })
                        } break
                        default:
                            break;
                    }
                })
            } break
        }
    }
    select = s => {
        switch (s.nodeName) {
            case 'ClickAction':
            case 'EnterTextAction':
            case 'EditAction':
            case 'BranchAction': {
                this.XPath(stepfind(this.step, x => x == s)).then(XPath => {
                    XPath = [XPath, s.XPath].join('')
                    switch (s.nodeName) {
                        case 'ClickAction': {
                            let code = `window.runApi.Opera('${encode(XPath)}','${encode(JSON.stringify(['mouseover', 'mousedown', s.Right ? 'contextmenu' : 'click', 'mouseup', 'change']))}')`
                            ipcRenderer.invoke('viewManage', this.props.tabKey, 'executeJavaScript', code).catch(e => { })
                        } break
                        case 'EnterTextAction': {
                            if (!s.List[0]) break
                            let text = s.List[0].value
                            if (text) {
                                let code = `window.runApi.Opera('${encode(XPath)}','${encode(JSON.stringify(['mouseover', 'mousedown', 'click', 'mouseup', 'change']))}')`
                                ipcRenderer.invoke('viewManage', this.props.tabKey, 'executeJavaScript', code).then(() => ipcRenderer.invoke('viewManage', this.props.tabKey, 'viewEnter', text, s.Enter).catch(e => { })).catch(e => { })
                            }
                        } break
                        case 'EditAction': {
                            let code = `window.runApi.Edit('${encode(JSON.stringify(s.List))}','${encode(XPath)}')`
                            ipcRenderer.invoke('viewManage', this.props.tabKey, 'executeJavaScript', code).catch(e => { })
                        } break
                        case 'BranchAction': {
                            let code = `window.runApi.XPaths('${encode(JSON.stringify([XPath]))}')`
                            ipcRenderer.invoke('viewManage', this.props.tabKey, 'executeJavaScript', code).then(XPaths => message.info(XPaths && XPaths.length > 0 ? 'true' : 'false')).catch(e => { })
                        } break
                    }
                })
            } break
            case 'NavigateAction': {
                if (!s.List[0]) break
                let url = s.List[0].value
                if (url) {
                    if (!url.startsWith('http')) url = 'http://' + url
                    ipcRenderer.invoke('viewManage', this.props.tabKey, 'loadURL', url).catch(e => { })
                }
            } break
            case 'CookieAction': {
                if (!s.List[0]) break
                ipcRenderer.invoke('viewManage', this.props.tabKey, 'setCookies', s.List[0]).catch(e => { })
            } break
            case 'PageAction': {
                switch (s.Type) {
                    case 'Scroll': ipcRenderer.invoke('viewManage', this.props.tabKey, 'executeJavaScript', 'window.scrollBy(0,document.documentElement.clientHeight)').catch(e => { }); break
                    case 'Back': ipcRenderer.invoke('viewManage', this.props.tabKey, 'executeJavaScript', 'window.history.back()').catch(e => { }); break
                    case 'Reload': ipcRenderer.invoke('viewManage', this.props.tabKey, 'reload').catch(e => { }); break
                }
            } break
        }
        this.setState({ s: s })
        this.updata(s)
    }
    XPath = path => new Promise(resolve => {
        let s = path.shift()
        path = path.filter(p => p.nodeName == 'LoopAction')
        let sx = ''
        switch (s.nodeName) {
            case 'ClickAction':
            case 'EnterTextAction':
            case 'EditAction': {
                sx = s.XPath
            } break
            case 'LoopAction': {
                let value = s.List[0]
                if (value) sx = value.value
            } break
        }
        let f = () => {
            let Paths = path.map(p => p.List[0] ? p.List[0].value : '')
            let XPath = [...Paths.reverse(), sx].join('')
            let code = `window.runApi.XPaths('${encode(JSON.stringify([XPath]))}')`
            ipcRenderer.invoke('viewManage', this.props.tabKey, 'executeJavaScript', code).then(XPaths => XPaths && XPaths.length > 0 ? resolve(Paths.join('')) : path.pop() ? f() : resolve(Paths.join(''))).catch(e => { })
        }
        f()
    })
    render() {
        let SetView = <div></div>
        if (this.state.s) {
            switch (this.state.s.nodeName) {
                case 'NavigateAction': SetView = <NavigateAction s={this.state.s} add={() => {
                    let List = this.state.s.List
                    ipcRenderer.invoke('viewManage', this.props.tabKey, 'getURL').then(url => {
                        List.push({ value: url })
                        this.setState({})
                    }).catch(e => { })
                }} />; break
                case 'CookieAction': SetView = <CookieAction s={this.state.s} cookie={() => {
                    let List = this.state.s.List
                    ipcRenderer.invoke('viewManage', this.props.tabKey, 'viewCookies').then(cookies => {
                        List.push(cookies)
                        this.setState({})
                    }).catch(e => { })
                }} />; break
                case 'ClickAction': SetView = <ClickAction s={this.state.s} />; break
                case 'EnterTextAction': SetView = <EnterTextAction s={this.state.s} />; break
                case 'ExtractDataAction': SetView = <ExtractDataAction s={this.state.s} updata={this.updata} calc={this.calc} header={this.header} tabKey={this.props.tabKey} />; break
                case 'LoopAction': SetView = <LoopAction s={this.state.s} updata={this.updata} split={() => {
                    this.XPath(stepfind(this.step, x => x == this.state.s)).then(XPath => {
                        let ListBase64 = encode(JSON.stringify(this.state.s.List.map(x => [XPath, x.value].join(''))))
                        let code = `window.runApi.XPaths('${ListBase64}')`
                        ipcRenderer.invoke('viewManage', this.props.tabKey, 'executeJavaScript', code).then(XPaths => {
                            if (!XPaths) return
                            this.state.s.List = XPaths
                            this.setState({})
                        }).catch(e => { })
                    })
                }} />; break
                case 'BranchAction': SetView = <BranchAction s={this.state.s} />; break
                case 'WaitAction': SetView = <WaitAction s={this.state.s} />; break
                case 'EditAction': SetView = <EditAction s={this.state.s} />; break
                case 'PageAction': SetView = <PageAction s={this.state.s} />; break
                case 'QuitAction': SetView = <QuitAction s={this.state.s} />; break
            }
        }
        return (
            <div id='browser' style={{ width: '100%', height: '100%', }}>
                <EnterText visible={this.state.textVisible} onOk={text => {
                    this.setState({ textVisible: undefined })
                    ipcRenderer.invoke('viewManage', this.props.tabKey, 'viewShow').catch(e => { })
                    this.opera('text', text)
                }} onCancel={() => {
                    this.setState({ textVisible: undefined })
                    ipcRenderer.invoke('viewManage', this.props.tabKey, 'viewShow').catch(e => { })
                }}></EnterText>
                <SetProxy visible={this.state.showProxy} close={() => {
                    this.setState({ showProxy: false })
                    ipcRenderer.invoke('viewManage', this.props.tabKey, 'viewShow').catch(e => { })
                }} onOk={(proxy, userAgent) => {
                    this.step.proxy = proxy
                    this.step.userAgent = userAgent
                    this.setState({ showProxy: false })
                    this.step.proxy && ipcRenderer.invoke('viewManage', this.props.tabKey, 'setProxy', this.step.proxy).catch(e => { })
                    //ipcRenderer.invoke('viewManage', this.props.tabKey, 'setUserAgent', this.step.userAgent ? this.step.userAgent : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36").catch(e => { })
                    ipcRenderer.invoke('viewManage', this.props.tabKey, 'viewShow').catch(e => { })
                }} step={this.step}></SetProxy>
                <div className='tool' style={{
                    width: '100%',
                    height: '32px'
                }}>
                    <div style={{
                        float: 'left'
                    }}>
                        <Input placeholder={'任务名'} value={this.state.taskName} onChange={e => {
                            this.setState({ taskName: e.target.value })
                        }} onBlur={e => {
                            let taskName = this.state.taskName ? this.state.taskName : '新建任务'
                            this.setState({ taskName: taskName })
                            global.setTitle(this.props.tabKey, taskName)
                        }}></Input>
                    </div>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <SaveOutlined style={{
                        fontSize: '32px'
                    }} onClick={e => {
                        this.task.name = this.state.taskName
                        this.task.step = JSON.stringify(this.step)
                        this.props.saveTask(this.task)
                    }} />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <SettingOutlined style={{
                        fontSize: '32px'
                    }} onClick={() => {
                        ipcRenderer.invoke('viewManage', this.props.tabKey, 'viewHide').catch(e => { })
                        this.setState({ showProxy: true })
                    }} />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <ToolOutlined style={{
                        fontSize: '32px'
                    }} onClick={() => {
                        ipcRenderer.invoke('viewManage', this.props.tabKey, 'devTools').catch(e => { })
                    }} />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <Switch style={{
                        bottom: '8px'
                    }} checkedChildren="编辑" unCheckedChildren="浏览" defaultChecked onChange={checked => {
                        ipcRenderer.invoke('viewManage', this.props.tabKey, 'viewMode', checked).catch(e => { })
                    }} />
                </div>
                <div style={{
                    width: '100%',
                    height: 'calc(100% - 32px)'
                }}>
                    <VSplit right={
                        <HSplit top={<Flow flowData={this.flowData}></Flow>} bottom={<div style={{ width: '100%', height: '100%', overflow: 'scroll' }}>{SetView}</div>} topHeight={this.state.topHeight} move={e => {
                            this.setState({ topHeight: e.clientY - 75 })
                        }}></HSplit>
                    } left={<div style={{ width: '100%', height: '100%' }}>
                        <table width='100%'>
                            <tbody>
                                <tr width='100%'>
                                    <td style={{
                                        textAlign: 'center'
                                    }} width='40'><ArrowLeftOutlined style={{ fontSize: '16px' }} onClick={e => {
                                        ipcRenderer.invoke('viewManage', this.props.tabKey, 'executeJavaScript', 'window.history.back()').catch(e => { })
                                    }}></ArrowLeftOutlined></td>
                                    <td ><Input style={{
                                        zIndex: '5',
                                    }} defaultValue={this.state.url} onPressEnter={e => {
                                        ipcRenderer.invoke('viewManage', this.props.tabKey, 'loadURL', e.target.value).catch(e => { })
                                    }}></Input></td>
                                </tr>
                            </tbody>
                        </table>
                        <div style={{
                            width: '100%',
                            height: 'calc(100% - 38px)',
                            float: 'left'
                        }}>
                            <div id={this.props.tabKey} style={{
                                width: 'calc(100% - 80px)',
                                height: '100%',
                                float: 'left'
                            }} />
                            <div style={{ width: '80px', height: '100%', float: 'left' }}>
                                <div style={{ width: '100%', display: this.state.has ? '' : 'none' }}>
                                    <p></p>
                                    <p align='center'><a onClick={() => {
                                        ipcRenderer.invoke('viewManage', this.props.tabKey, 'viewHide').catch(e => { })
                                        this.setState({ textVisible: true, text: '' })
                                    }} style={{ display: !this.state.useLoop && this.state.only ? '' : 'none' }}>输入文字</a></p>
                                    <p align='center'><a onClick={() => this.opera('click', 'click')} style={{ display: this.state.only ? '' : 'none' }}>点击按钮</a></p>
                                    <p align='center'><a onClick={() => this.opera('click', 'loop')} style={{ display: !this.state.useLoop && this.state.only ? '' : 'none' }}>循环点击</a></p>
                                    <p align='center'><a onClick={() => this.opera('extract', 'extract')}>采集数据</a></p>
                                    <p align='center'><a onClick={() => this.opera('branch', 'branch')} style={{ display: !this.state.useLoop && this.state.only ? '' : 'none' }}>条件分支</a></p>
                                    <p align='center'><a onClick={() => this.opera('clear', 'clear')}>取消选择</a></p>
                                </div>
                            </div>
                        </div>
                    </div>} leftWidth={this.state.leftWidth} move={e => {
                        let width = e.clientX - 200
                        ipcRenderer.invoke('viewManage', this.props.tabKey, 'viewResize', { width: width - 80 }).catch(e => { })
                        this.setState({ leftWidth: width })
                    }}></VSplit>
                </div>
            </div>
        )
    }
}
export default Browser
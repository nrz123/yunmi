import React from 'react'
import './home.css'
import { Layout, Menu, Tabs, message } from 'antd'
import { MenuOutlined, ZoomInOutlined, RetweetOutlined, ApartmentOutlined, ShareAltOutlined, CloudUploadOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import guid from './uuid.js'
import MainPage from './mainPage.js'
import TaskPage from './taskPage.js'
import WebList from './webList.js'
import DataAnalysis from './dataAnalysis.js'
import DataSelect from './dataSelect.js'
import Cloud from './cloud.js'
import Manage from './manage.js'
import { tabs, ref } from './tabRef.js'
import moment from 'moment'
import 'moment/locale/zh-cn'
moment.locale('zh-cn')
const { TabPane } = Tabs
const { Content, Sider } = Layout
const { ipcRenderer, shell } = window.require('electron')
class Home extends React.Component {
    constructor(props) {
        super(props)
        let tabKey = guid()
        this.state = {
            tabKey: tabKey,
            tabPanes: [{ key: tabKey, tab: "首页", closable: false, pane: <MainPage ref={ref} addPane={this.addPane}></MainPage> }]
        }
    }
    componentDidMount() {
        global.serverHost = ipcRenderer.sendSync('protocal') + ipcRenderer.sendSync('serverHost')
        global.set = ipcRenderer.sendSync('set')
        global.upcloudState = () => { }
        global.upmodelState = () => { }
        global.runState = {}
        global.setTitle = (key, title) => {
            let tabPane = this.state.tabPanes.find(tab => tab.key == key)
            if (!tabPane) return
            tabPane.tab = title
            this.setState({})
        }
        let list = global.serverHost.split('://')
        let connect = () => {
            global.ws = new WebSocket((list[0] == 'https' ? 'wss://' : 'ws://') + list[1] + "/users/ws")
            global.ws.onmessage = event => {
                let mess = JSON.parse(event.data)
                console.log(mess)
                switch (mess.type) {
                    case 'taskState': {
                        global.upcloudState(mess)
                    } break
                    case 'modelState': {
                        global.upmodelState(mess)
                    } break
                    case 'mess': {
                        message.info(mess.mess)
                    } break
                }
            }
            global.ws.onclose = connect
        }
        connect()
    }
    addPane = pane => {
        let key = pane.props.tabKey ? pane.props.tabKey : guid()
        let tabPanes = this.state.tabPanes
        if (tabPanes.findIndex(tab => tab.key == key) == -1) {
            tabPanes.push({ key: key, tab: pane.props.tab, closable: pane.props.closable, pane: pane })
        }
        this.keyChange(key)
    }
    removePane = key => {
        let tabPanes = this.state.tabPanes
        let index = tabPanes.findIndex(tab => tab.key == key)
        let node = tabs[key]
        node && node.tabRemove && node.tabRemove()
        delete tabs[key]
        tabPanes.splice(index, 1)
        this.setState({ tabPanes: tabPanes })
        this.keyChange(tabPanes[index - 1].key)
    }
    keyChange = tabKey => {
        let node = tabs[this.state.tabKey]
        node && node.tabLeave && node.tabLeave()
        node = tabs[tabKey]
        node && node.tabSelect && node.tabSelect()
        this.setState({ tabKey: tabKey })
    }
    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <Layout style={{ width: '100%', height: '100%' }}>
                    <Sider style={{ background: '#f0f0f0' }}>
                        <div align="center" style={{ height: '40px', lineHeight: '40px', fontSize: '24px', background: '#d8d8d8', color: 'white' }}>
                            <a style={{ color: 'white' }} onClick={() => { }}>云觅</a>
                        </div>
                        <Menu style={{ background: '#f0f0f0' }} selectedKeys={[this.state.tabKey]} mode="inline">
                            <Menu.Item key="taskPage" style={{
                                height: '100px',
                                margin: '0px',
                                background: '#f0f0f0',
                                fontSize: '18px',
                                fontWeight: '300'
                            }} icon={<MenuOutlined style={{ fontSize: '24px', color: '#08c' }} />} onClick={() => {
                                this.addPane(<TaskPage ref={ref} tabKey={'taskPage'} tab={'数据采集'} addPane={this.addPane}></TaskPage>)
                            }}>
                                数据采集
                            </Menu.Item>
                            <Menu.Item key="cloud" style={{
                                height: '100px',
                                margin: '0px',
                                background: '#f0f0f0',
                                fontSize: '18px',
                                fontWeight: '300'
                            }} icon={<RetweetOutlined style={{ fontSize: '24px', color: '#08c' }} />} onClick={() => {
                                this.addPane(<Cloud ref={ref} tabKey={'cloud'} tab={'集群采集'} addPane={this.addPane}></Cloud>)
                            }}>
                                集群采集
                            </Menu.Item>
                            <Menu.Item key="manage" style={{
                                height: '100px',
                                margin: '0px',
                                background: '#f0f0f0',
                                fontSize: '18px',
                                fontWeight: '300'
                            }} icon={<ApartmentOutlined style={{ fontSize: '24px', color: '#08c' }} />} onClick={() => {
                                this.addPane(<Manage ref={ref} tabKey={'manage'} tab={'集群管理'} addPane={this.addPane}></Manage>)
                            }}>
                                集群管理
                            </Menu.Item>
                            <Menu.Item key="webList" style={{
                                height: '100px',
                                margin: '0px',
                                background: '#f0f0f0',
                                fontSize: '18px',
                                fontWeight: '300'
                            }} icon={<CloudUploadOutlined style={{ fontSize: '24px', color: '#08c' }} />} onClick={() => {
                                this.addPane(<WebList ref={ref} tabKey={'webList'} tab={'数据发布'} addPane={this.addPane}></WebList>)
                            }}>
                                数据发布
                            </Menu.Item>
                            <Menu.Item key="dataAnalysis" style={{
                                height: '100px',
                                margin: '0px',
                                background: '#f0f0f0',
                                fontSize: '18px',
                                fontWeight: '300'
                            }} icon={<ZoomInOutlined style={{ fontSize: '24px', color: '#08c' }} />} onClick={() => {
                                this.addPane(<DataAnalysis ref={ref} tabKey={'dataAnalysis'} tab={'数据分析'} addPane={this.addPane}></DataAnalysis>)
                            }}>
                                数据分析
                            </Menu.Item>
                            <Menu.Item key="dataSelect" style={{
                                height: '100px',
                                margin: '0px',
                                background: '#f0f0f0',
                                fontSize: '18px',
                                fontWeight: '300'
                            }} icon={<ShareAltOutlined style={{ fontSize: '24px', color: '#08c' }} />} onClick={() => {
                                this.addPane(<DataSelect ref={ref} tabKey={'dataSelect'} tab={'智能索引'} addPane={this.addPane}></DataSelect>)
                            }}>
                                智能索引
                            </Menu.Item>
                            <Menu.Item key="course" style={{
                                height: '100px',
                                margin: '0px',
                                background: '#f0f0f0',
                                fontSize: '18px',
                                fontWeight: '300'
                            }} icon={<QuestionCircleOutlined style={{ fontSize: '24px', color: '#08c' }} />} onClick={() => {
                                ipcRenderer.send('external', 'https://github.com/nrz123/spider')
                            }}>
                                使用教程
                            </Menu.Item>
                        </Menu>
                    </Sider>
                    <Content>
                        <Tabs hideAdd onEdit={(key, action) => {
                            if (action == 'remove') {
                                this.removePane(key)
                            }
                        }} activeKey={this.state.tabKey} type="editable-card" tabBarStyle={{ margin: 0, background: 'white' }} style={{ height: '100%' }} onChange={tabKey => this.keyChange(tabKey)}>
                            {this.state.tabPanes.map(tabPane => <TabPane style={{ width: '100%', height: '100%' }} tab={<div style={{
                                fontSize: '16px',
                                fontWeight: '300'
                            }}>{tabPane.tab}</div>} key={tabPane.key} closable={tabPane.closable}>{tabPane.pane}</TabPane>)}
                        </Tabs>
                    </Content>
                </Layout>
            </div>
        )
    }
}
export default Home
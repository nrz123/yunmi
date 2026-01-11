import React from 'react'
import './taskPage.css'
import { Table } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { pageList, pageSum, deletePage, loadPage } from './task.js'
import AddWeb from './addWeb.js'
import Delete from './delete.js'
import { ref } from './tabRef.js'
import moment from 'moment'
import 'moment/locale/zh-cn'
moment.locale('zh-cn')
class WebList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            pages: [],
            pagination: {
                position: ['none', 'bottomLeft'],
                current: 1,
                pageSize: 10,
            },
        }
    }
    tabSelect() {
        this.updata(this.state.pagination)
    }
    componentDidMount() {
        this.updata(this.state.pagination)
    }
    updata = pagination => {
        pageSum().then(sum => {
            this.state.pagination.total = sum
            this.setState({})
        })
        pageList((pagination.current - 1) * pagination.pageSize, pagination.pageSize).then(pages => {
            if (!pages) return []
            pagination.total = this.state.pagination.total
            this.setState({ pages: pages, pagination: pagination })
            return pages
        })
    }
    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <Delete visible={this.state.showDelete} title="确定删除" ok={() => {
                    let deleteId = this.state.deleteId
                    deletePage(deleteId).then(ret => {
                        if (ret != 'success') return
                        this.updata(this.state.pagination)
                    })
                }} close={() => this.setState({ showDelete: false })}></Delete>
                <Table style={{ width: '100%', height: 'calc(100% - 65px)' }} pagination={this.state.pagination} onChange={pagination => {
                    this.updata(pagination)
                }} columns={[{
                    title: <div style={{
                        fontSize: '18px',
                        fontWeight: '300'
                    }}>{'名称'}</div>,
                    dataIndex: 'name',
                    key: 'name',
                }, {
                    title: <div style={{
                        fontSize: '18px',
                        fontWeight: '300'
                    }}>{'最近编辑时间'}</div>,
                    dataIndex: 'time',
                    key: 'time',
                }, {
                    title: <div style={{
                        fontSize: '18px',
                        fontWeight: '300'
                    }}>{'更多操作'}</div>,
                    dataIndex: 'opera',
                    key: 'opera'
                }]} dataSource={this.state.pages.map(page => {
                    return {
                        name: <a style={{
                            fontSize: '18px',
                            fontWeight: '300'
                        }} onClick={() => {
                            loadPage(page.id).then(page => {
                                this.props.addPane(<AddWeb ref={ref} tabKey={page.id + '-addWeb'} tab={page.name + '-添加网页'} page={page} pid={page.id} addPane={this.props.addPane}></AddWeb>)
                            })
                        }}>{page.name}</a>,
                        time: <div style={{
                            fontSize: '18px',
                            fontWeight: '300'
                        }}>{new moment(page.editTime).format()}</div>,
                        opera: <div>
                            <DeleteOutlined onClick={() => this.setState({ showDelete: true, deleteId: page.id })} style={{ fontSize: '26px' }} />
                        </div>
                    }
                })} scroll={{ y: true }} />
            </div>
        )
    }
}
export default WebList
import React from 'react'
import './home.css'
import { Table } from 'antd'
import { PlusOutlined, ZoomInOutlined, VerticalAlignBottomOutlined, DeleteOutlined } from '@ant-design/icons'
import { modelList, modelSum, deleteModel, loadModel } from './model.js'
import guid from './uuid'
import CreateAnalysis from './createAnalysis.js'
import ShowAnalysis from './showAnalysis.js'
import Delete from './delete.js'
import { ref } from './tabRef.js'
import moment from 'moment'
import 'moment/locale/zh-cn'
moment.locale('zh-cn')
class DataAnalysis extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            models: [],
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
        modelSum().then(sum => {
            this.state.pagination.total = sum
            this.setState({})
        })
        modelList((pagination.current - 1) * pagination.pageSize, pagination.pageSize).then(models => {
            pagination.total = this.state.pagination.total
            this.setState({ models: models, pagination: pagination })
        })
    }
    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <Delete visible={this.state.showDelete} title="确定删除" ok={() => deleteModel(this.state.deleteId).then(ret => {
                    if (ret != 'success') return
                    this.updata(this.state.pagination)
                })} close={() => this.setState({ showDelete: false })}></Delete>
                <Table style={{ width: '100%', height: 'calc(100% - 65px)' }} pagination={this.state.pagination} onChange={pagination => {
                    this.updata(pagination)
                }} columns={[{
                    title: <div style={{
                        fontSize: '18px',
                        fontWeight: '300'
                    }}>{'模板名'}</div>,
                    dataIndex: 'name',
                    key: 'name',
                }, {
                    title: <div style={{
                        fontSize: '18px',
                        fontWeight: '300'
                    }}>{'预览'}</div>,
                    dataIndex: 'view',
                    key: 'view',
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
                }]} dataSource={this.state.models.map(model => {
                    return {
                        name: <a style={{
                            fontSize: '18px',
                            fontWeight: '300'
                        }} onClick={() => {
                            loadModel(model.id).then(model => this.props.addPane(<CreateAnalysis ref={ref} tabKey={model.id} tab={model.name} modelName={model.name} model={model}></CreateAnalysis>))
                        }}>{model.name}</a>, view: <ZoomInOutlined style={{ fontSize: '24px', color: '#08c' }} onClick={() => {
                            loadModel(model.id).then(model => this.props.addPane(<ShowAnalysis ref={ref} tabKey={model.id + '-show'} tab={model.name} modelId={model.id} model={model}></ShowAnalysis>))
                        }}></ZoomInOutlined>, time: <div style={{
                            fontSize: '18px',
                            fontWeight: '300'
                        }}>{new moment(model.editTime).format()}</div>, opera: <div>
                            <VerticalAlignBottomOutlined onClick={() => {

                            }} style={{ fontSize: '26px' }} />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <DeleteOutlined onClick={() => this.setState({ showDelete: true, deleteId: model.id })} style={{ fontSize: '26px' }} />
                        </div>
                    }
                })} scroll={{ y: true }} />
                <PlusOutlined style={{
                    position: 'absolute',
                    fontSize: '30px',
                    right: '20px',
                    bottom: '15px'
                }} onClick={() => {
                    this.props.addPane(<CreateAnalysis ref={ref} tabKey={guid()} tab={'新建模板'} modelName={'新建模板'}></CreateAnalysis>)
                }} />
            </div>
        )
    }
}
export default DataAnalysis
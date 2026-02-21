import './createAnalysis.css'
import React from 'react'
import * as go from 'gojs'
import { ReactDiagram } from 'gojs-react'
import { Select, Button, Input, Modal, Popover } from 'antd'
import { EditOutlined, DeleteOutlined, UpOutlined, DownOutlined } from '@ant-design/icons'
import { taskList } from './task'
import { saveModel } from './model'
const { Option } = Select
const { TextArea } = Input
const { ipcRenderer } = window.require('electron')
class CreateAnalysis extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            tasks: [],
            columns: [],
            modelName: this.props.modelName,
        }
    }
    componentWillMount() {
        this.model = this.props.model
        if (this.model) {
            this.nodeDataArray = JSON.parse(this.model.nodeDataArray)
            this.linkDataArray = JSON.parse(this.model.linkDataArray)
        } else {
            this.model = { id: this.props.tabKey }
            this.nodeDataArray = []
            this.linkDataArray = []
        }
        const $ = go.GraphObject.make;
        this.diagram = $(go.Diagram, {
            model: $(go.GraphLinksModel, { linkKeyProperty: 'key' }),
            nodeSelectionAdornmentTemplate: $(go.Adornment, "Auto", $(go.Shape, { fill: null, stroke: null })),
            groupSelectionAdornmentTemplate: $(go.Adornment, "Auto", $(go.Shape, { fill: null, stroke: null })),
            linkSelectionAdornmentTemplate: $(go.Adornment, "Auto", $(go.Shape, { fill: null, stroke: null })),
            ExternalObjectsDropped: e => {  // handle drops from the Palette
                let node = e.diagram.selection.first()
                if (!node) return
                node.data.regs = []
            }
        })
        this.diagram.linkTemplate =
            $(go.Link,
                $(go.Shape, { strokeWidth: 1.5 }),
                $(go.Shape, { toArrow: 'standard', stroke: null }),
                $(go.Panel,
                    'Auto',
                    $(go.Shape, { fill: $(go.Brush, 'Radial', { 0: 'rgb(240, 240, 240)', 0.3: 'rgb(240, 240, 240)', 1: 'rgba(240, 240, 240, 0)' }), stroke: null, }),
                    $(go.TextBlock,
                        'transition',
                        {
                            textAlign: 'center',
                            font: '10pt helvetica, arial, sans-serif',
                            stroke: 'black',
                            margin: 4,
                            editable: true,
                        },
                        new go.Binding('text', 'text').makeTwoWay()
                    )
                )
            );
        let selectNode
        this.diagram.nodeTemplate = $(go.Node, go.Panel.Auto,
            {
                click: (e, thisObj) => {
                    if (selectNode) {
                        selectNode != thisObj && !this.diagram.model.linkDataArray.find(d => d.from == selectNode.key && d.to == thisObj.key) && !this.diagram.model.linkDataArray.find(d => d.from == thisObj.key && d.to == selectNode.key) && this.diagram.model.addLinkData({ from: selectNode.key, to: thisObj.key, text: '关系' })
                        this.diagram.model.setDataProperty(selectNode.data, 'color', 'white')
                        selectNode = undefined
                    } else {
                        selectNode = thisObj
                        this.diagram.model.setDataProperty(selectNode.data, 'color', 'red')
                    }
                },
                doubleClick: (e, thisObj) => {
                    selectNode && this.diagram.model.setDataProperty(selectNode.data, 'color', 'white')
                    selectNode = undefined
                    if (thisObj.containingGroup) {
                        let data = thisObj.containingGroup.data
                        thisObj.containingGroup = null
                        this.diagram.model.nodeDataArray.find(d => d.group == data.key) || this.diagram.model.removeNodeData(data)
                    } else {
                        let data = { isGroup: true, text: '合并', background: '#2b71ed' }
                        this.diagram.model.addNodeData(data)
                        thisObj.containingGroup = this.diagram.findNodeForData(data)
                    }
                },
                mouseDragEnter: (e, thisObj) => this.diagram.model.setDataProperty(thisObj.data, 'color', 'blue'),
                mouseDragLeave: (e, thisObj) => this.diagram.model.setDataProperty(thisObj.data, 'color', thisObj == selectNode ? 'red' : 'white'),
                mouseDrop: (e, thisObj) => {
                    let node = e.diagram.selection.first()
                    if (node.containingGroup) {
                        let data = node.containingGroup.data
                        node.containingGroup = null
                        this.diagram.model.nodeDataArray.find(d => d.group == data.key) || this.diagram.model.removeNodeData(data)
                    }
                    if (!thisObj.containingGroup) {
                        let data = { isGroup: true, text: '合并', background: '#2b71ed' }
                        this.diagram.model.addNodeData(data)
                        thisObj.containingGroup = this.diagram.findNodeForData(data)
                    }
                    node.containingGroup = thisObj.containingGroup
                },
                contextMenu: $("ContextMenu",
                    $("ContextMenuButton",
                        $(go.TextBlock, "删除", {
                            alignment: go.Spot.Center,
                            margin: 5,
                            font: "12px sans-serif",
                            opacity: 0.75,
                            stroke: "#404040"
                        }),
                        {
                            click: (e, obj) => {
                                let node = this.diagram.selection.first()
                                this.diagram.remove(node)
                            }
                        }),
                    $("ContextMenuButton",
                        $(go.TextBlock, "正则", {
                            alignment: go.Spot.Center,
                            margin: 5,
                            font: "12px sans-serif",
                            opacity: 0.75,
                            stroke: "#404040"
                        }),
                        {
                            click: (e, obj) => {
                                let node = this.diagram.selection.first()
                                this.setState({ regvisible: true, nodeData: node.data })
                            }
                        }))
            },
            $(go.Shape,
                { figure: "Circle", fill: "white" },
                new go.Binding("fill", "color")),
            $(go.TextBlock,
                { font: "bold 11pt sans-serif" },
                new go.Binding("text"))
        )
        this.diagram.groupTemplate =
            $(go.Group, "Auto",
                {
                    computesBoundsAfterDrag: true,
                    movable: true,
                    mouseDragEnter: (e, thisObj) => this.diagram.model.setDataProperty(thisObj.data, 'color', 'blue'),
                    mouseDragLeave: (e, thisObj) => this.diagram.model.setDataProperty(thisObj.data, 'color', thisObj == selectNode ? 'red' : 'white'),
                    mouseDrop: (e, thisObj) => {
                        let node = e.diagram.selection.first()
                        if (node.containingGroup) {
                            let data = node.containingGroup.data
                            node.containingGroup = null
                            this.diagram.model.nodeDataArray.find(d => d.group == data.key) || this.diagram.model.removeNodeData(data)
                        }
                        node.containingGroup = thisObj
                    }
                },
                new go.Binding("isSubGraphExpanded", "isSubGraphExpanded"),
                $(go.Shape, "Ellipse", { fill: 'white' },
                    new go.Binding("fill", "color")),
                $(go.Placeholder, { alignment: go.Spot.Center })
            )
    }
    componentDidMount() {
        taskList(0, 10).then(tasks => {
            this.setState({ tasks: tasks })
            let task = tasks[0]
            task && this.selectTask(task.id)
        })
    }
    calc = s => {
        let value = s.SampleText
        s.regs.forEach(reg => {
            let { source, target } = reg
            try {
                reg.result = value = value.replace(new RegExp(source ? source : '', 'img'), target ? target : '')
            } catch {
                reg.result = value
            }
        })
        return value
    }
    selectTask = id => {
        ipcRenderer.invoke('fetch', global.serverHost + "/users/cloudData", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                offset: 0,
                rows: 1
            })
        }).then(data => {
            let d = data[0]
            this.setState({
                taskId: id, columns: d ? Object.keys(d).filter(c => c != 'column6fd9d90906ab18e9513e99dcdd4e3536' && !c.startsWith('hash')).map(key => {
                    return { column: key, text: d[key] }
                }) : []
            })
        })
    }
    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <Modal title="设置" visible={this.state.regvisible} onOk={() => {
                    this.diagram.model.setDataProperty(this.state.nodeData, 'text', this.calc(this.state.nodeData))
                    this.setState({ regvisible: false })
                }} onCancel={() => this.setState({ regvisible: false })}>
                    <div style={{ width: '100%', maxHeight: '600px', overflowY: 'scroll' }} >
                        <TextArea style={{ width: '100%', height: '60px' }} value={this.state.nodeData ? this.state.nodeData.SampleText : undefined}></TextArea>
                        {this.state.nodeData ? this.state.nodeData.regs.map(reg => {
                            let { source, target, result } = reg
                            return <div>
                                <div>
                                    <UpOutlined onClick={() => {
                                        let index = this.state.nodeData.regs.indexOf(reg)
                                        if (index > 0) {
                                            this.state.nodeData.regs.splice(index, 1)
                                            this.state.nodeData.regs.splice(index - 1, 0, reg)
                                            this.calc(this.state.nodeData)
                                            this.setState({})
                                        }
                                    }} style={{ fontSize: '24px' }} />
                                    <DownOutlined onClick={() => {
                                        let index = this.state.nodeData.regs.indexOf(reg)
                                        if (index < this.state.nodeData.regs.length - 1) {
                                            this.state.nodeData.regs.splice(index, 1)
                                            this.state.nodeData.regs.splice(index + 1, 0, reg)
                                            this.calc(this.state.nodeData)
                                            this.setState({})
                                        }
                                    }} style={{ fontSize: '24px' }} />
                                    <Popover content={<div>
                                        <TextArea style={{ width: '600px', height: '150px' }} placeholder="源正则表达式" value={source} onChange={e => {
                                            reg.source = e.target.value
                                            this.setState({})
                                        }} onBlur={e => {
                                            this.calc(this.state.nodeData)
                                            this.setState({})
                                        }}></TextArea>
                                        <br />
                                        <TextArea style={{ width: '600px', height: '150px' }} placeholder="目标字符串" value={target} onChange={e => {
                                            reg.target = e.target.value
                                            this.setState({})
                                        }} onBlur={e => {
                                            this.calc(this.state.nodeData)
                                            this.setState({})
                                        }}></TextArea>
                                    </div>} trigger="click" placement="topLeft">
                                        <EditOutlined style={{ fontSize: '24px' }} />
                                    </Popover>
                                    <DeleteOutlined onClick={() => {
                                        let index = this.state.nodeData.regs.indexOf(reg)
                                        if (index < 0) return
                                        this.state.nodeData.regs.splice(index, 1)
                                        this.calc(this.state.nodeData)
                                        this.setState({})
                                    }} style={{ fontSize: '24px' }} />
                                </div>
                                <TextArea style={{ width: '100%', height: '60px' }} value={result}></TextArea>
                            </div>
                        }) : null}
                    </div>
                    <Button onClick={() => {
                        let value = this.state.nodeData.SampleText
                        let len = this.state.nodeData.regs.length
                        if (len > 0) {
                            let { result } = this.state.nodeData.regs[len - 1]
                            value = result
                        }
                        this.state.nodeData.regs.push({ result: value })
                        this.setState({})
                    }}>添加正则替换</Button>
                </Modal>
                <div style={{ width: '100%', height: '100%', float: 'left' }}>
                    <div style={{
                        width: 'calc(100% - 200px)',
                        height: '100%',
                        float: 'left'
                    }}>
                        <div style={{
                            width: '100%',
                            height: '32px',
                        }}>
                            <Button style={{
                                float: 'left'
                            }} onClick={e => {
                                this.model.name = this.state.modelName
                                this.model.nodeDataArray = JSON.stringify(this.diagram.model.nodeDataArray)
                                this.model.linkDataArray = JSON.stringify(this.diagram.model.linkDataArray)
                                saveModel(this.model)
                            }}>保存模板</Button>
                            <div style={{
                                float: 'left'
                            }}>
                                <Input placeholder={'模板名'} value={this.state.modelName} onChange={e => {
                                    this.setState({ modelName: e.target.value })
                                }} onBlur={e => {
                                    let modelName = this.state.modelName ? this.state.modelName : '新建模板'
                                    this.setState({ modelName: modelName })
                                    global.setTitle(this.props.tabKey, modelName)
                                }}></Input>
                            </div>
                        </div>
                        <ReactDiagram
                            initDiagram={() => this.diagram}
                            divClassName='diagram-analysis'
                            nodeDataArray={this.nodeDataArray}
                            linkDataArray={this.linkDataArray}
                            onModelChange={() => { }}
                        />
                    </div>
                    <div style={{
                        width: '200px',
                        height: '100%',
                        float: 'left'
                    }}>
                        <Select value={this.state.taskId} style={{ width: '100%' }} onChange={this.selectTask}>
                            {this.state.tasks.map(task => <Option value={task.id}>{task.name}</Option>)}
                        </Select>
                        <ReactDiagram
                            initDiagram={() => {
                                const $ = go.GraphObject.make
                                const palette = $(go.Palette, {
                                    layout: $(go.TreeLayout, { angle: 90, layerSpacing: 20 }),
                                    allowVerticalScroll: false,
                                    allowHorizontalScroll: false,
                                    nodeSelectionAdornmentTemplate: $(go.Adornment, "Auto", $(go.Shape, { fill: null, stroke: null }))
                                })
                                palette.nodeTemplate = $(go.Node, "Auto",
                                    $(go.TextBlock,
                                        { font: "20px Sans-Serif" },
                                        new go.Binding("text", "text")))
                                return palette
                            }}
                            divClassName='palette-analysis'
                            nodeDataArray={
                                this.state.columns.map(column => {
                                    return { taskId: this.state.taskId, ...column, SampleText: column.text }
                                })
                            }
                            onModelChange={() => { }}
                        />
                    </div>
                </div>
            </div>
        )
    }
}
export default CreateAnalysis
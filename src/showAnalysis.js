import './showAnalysis.css'
import React from 'react'
import { Pagination } from 'antd'
import * as go from 'gojs'
import { ReactDiagram } from 'gojs-react'
const { ipcRenderer } = window.require('electron')
const md5 = window.require('md5')
class ShowAnalysis extends React.Component {
    constructor(props) {
        super(props)
        this.modelNodes = JSON.parse(this.props.model.nodeDataArray)
        this.modelLinks = JSON.parse(this.props.model.linkDataArray)
        this.taskIds = new Set(this.modelNodes.map(node => node.taskId))
        this.state = {
            nodeDataArray: [],
            linkDataArray: [],
            pageIndex: 1,
            pageSize: 100,
            total: 0
        }
    }
    componentWillMount() {
        const $ = go.GraphObject.make;
        this.diagram = $(go.Diagram, {
            model: $(go.GraphLinksModel, { linkKeyProperty: 'key' }),
            nodeSelectionAdornmentTemplate: $(go.Adornment, "Auto", $(go.Shape, { fill: null, stroke: null })),
            groupSelectionAdornmentTemplate: $(go.Adornment, "Auto", $(go.Shape, { fill: null, stroke: null })),
            linkSelectionAdornmentTemplate: $(go.Adornment, "Auto", $(go.Shape, { fill: null, stroke: null })),
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
            )
        this.diagram.nodeTemplate = $(go.Node, go.Panel.Auto,
            $(go.Shape,
                { figure: "Circle", fill: "white" },
                new go.Binding("fill", "color")),
            $(go.TextBlock,
                { font: "bold 11pt sans-serif" },
                new go.Binding("text"))
        )
        this.diagram.groupTemplate =
            $(go.Group, "Auto", {
                computesBoundsAfterDrag: true,
                movable: true
            },
                new go.Binding("isSubGraphExpanded", "isSubGraphExpanded"),
                $(go.Shape, "Ellipse", { fill: 'white' },
                    new go.Binding("fill", "color")),
                $(go.Placeholder, { alignment: go.Spot.Center })
            )
    }
    updata = (pageIndex, pageSize) => {
        let total = 0
        let nodeDataArray = []
        let linkDataArray = []
        Promise.all(Array.from(this.taskIds).map(taskId => new Promise(resolve => {
            ipcRenderer.invoke('fetch', global.serverHost + "/users/dataSum", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: taskId
                })
            }).then(sum => {
                if (total < sum - 1) total = sum - 1
                ipcRenderer.invoke('fetch', global.serverHost + "/users/cloudData", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: taskId,
                        offset: (pageIndex - 1) * pageSize + 1,
                        rows: pageSize
                    })
                }).then(datas => {
                    let nodes = this.modelNodes.filter(node => node.taskId == taskId)
                    let links = this.modelLinks.filter(link => nodes.find(node => node.key == link.from) && nodes.find(node => node.key == link.to))
                    datas.forEach(data => {
                        let keyMap = {}
                        nodes.forEach(node => {
                            let text = data[node.key]
                            if (!text) return
                            let key = keyMap[node.key] = node.group ? md5(node.group + text) : md5(taskId + node.key + data['column6fd9d90906ab18e9513e99dcdd4e3536'])
                            nodeDataArray.push({
                                key: key,
                                taskId: taskId,
                                columnId: node.key,
                                text: text
                            })
                        })
                        links.forEach(link => {
                            let fromkey = keyMap[link.from]
                            let tokey = keyMap[link.to]
                            if (!fromkey || !tokey || fromkey == tokey) return
                            let key = md5(fromkey + tokey)
                            linkDataArray.push({
                                key: key,
                                from: fromkey,
                                to: tokey,
                                text: link.text
                            })
                        })

                    })
                    resolve()
                })
            })
        }))).then(() => {
            this.setState({ nodeDataArray: nodeDataArray, linkDataArray: linkDataArray, total: total, pageIndex: pageIndex, pageSize: pageSize })
        })
    }
    componentDidMount() {
        this.updata(this.state.pageIndex, this.state.pageSize)
    }
    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <ReactDiagram
                    initDiagram={() => this.diagram}
                    divClassName='diagram-show'
                    nodeDataArray={this.state.nodeDataArray}
                    linkDataArray={this.state.linkDataArray}
                    onModelChange={() => { }}
                />
                <div style={{
                    position: 'absolute',
                    bottom: '15px',
                    right: '20px'
                }}>
                    <Pagination defaultCurrent={1} total={this.state.total} pageSize={this.state.pageSize} current={this.state.pageIndex} onChange={(pageIndex, pageSize) => {
                        this.updata(pageIndex, pageSize)
                    }} />
                </div>
            </div>
        )
    }
}
export default ShowAnalysis
import * as go from 'gojs'
import guid from './uuid.js'
class FlowData {
    constructor(step, select, s) {
        this.step = step
        this.keyMap = {}
        this.key = s.key
        this.dataArray = this.ds(this.step, s)
        this.select = s => {
            this.key && this.diagram.findNodeForKey(this.key).setProperties({ background: '#6383bc' })
            this.key = s.key
            this.key && this.diagram.findNodeForKey(this.key).setProperties({ background: '#2b71ed' })
            select(s)
        }
        const $ = go.GraphObject.make
        this.diagram = $(go.Diagram, {
            contentAlignment: go.Spot.Center,
            layout: $(go.TreeLayout, { angle: 90, arrangement: go.TreeLayout.ArrangementHorizontal, layerSpacing: 25 }),
            model: $(go.GraphLinksModel, { linkKeyProperty: 'key' }),
            nodeSelectionAdornmentTemplate: $(go.Adornment, "Auto", $(go.Shape, { fill: null, stroke: null })),
            groupSelectionAdornmentTemplate: $(go.Adornment, "Auto", $(go.Shape, { fill: null, stroke: null })),
            linkSelectionAdornmentTemplate: $(go.Adornment, "Auto", $(go.Shape, { fill: null, stroke: null })),
            "ExternalObjectsDropped": e => {  // handle drops from the Palette
                var newnode = e.diagram.selection.first()
                if (!newnode) return
                e.diagram.removeParts(e.diagram.selection, false)
            }
        })
        let addshow = this.diagram.mouseDragOver = () => {
            let links = this.diagram.links
            while (links.next()) {
                links.value.elt(1).setProperties({ fill: '#6383bc' })
                links.value.elt(2).setProperties({ fill: 'white' })
                links.value.elt(3).setProperties({ fill: 'white' })
            }
        }
        let endshow = this.diagram.mouseDrop = () => {
            let links = this.diagram.links
            while (links.next()) {
                links.value.elt(1).setProperties({ fill: null })
                links.value.elt(2).setProperties({ fill: null })
                links.value.elt(3).setProperties({ fill: null })
            }
        }
        let menu = $("ContextMenu",
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
                        let step = this.keyMap[node.key]
                        let parent = node.containingGroup ? this.keyMap[node.containingGroup.key] : this.step
                        let index = parent.steps.indexOf(step)
                        parent.steps.splice(index, 1)
                        this.select(parent)
                        let outLinks = node.findLinksOutOf()
                        let inLinks = node.findLinksInto()
                        if (inLinks.next() && outLinks.next()) inLinks.value.toNode = outLinks.value.toNode
                        this.diagram.remove(node)
                    }
                }))
        this.diagram.nodeTemplate =
            $(go.Node, "Auto",
                {
                    mouseEnter: (e, thisObj) => thisObj.setProperties({ background: '#2b71ed' }),
                    mouseLeave: (e, thisObj) => thisObj.setProperties({ background: this.key == thisObj.key ? '#2b71ed' : '#6383bc' }),
                    click: (e, thisObj) => this.select(this.keyMap[thisObj.key]),
                    mouseDragLeave: addshow, mouseDrop: endshow, contextMenu: menu, movable: false
                },
                new go.Binding("background", "background"),
                $(go.Shape, "Rectangle", { stroke: null, fill: null, height: 30, width: 120 }),
                $(go.TextBlock,
                    { margin: 7, stroke: 'white' },
                    new go.Binding("text", "text"))
            )
        this.diagram.nodeTemplateMap.add("spacetemplate", $(go.Node, "Auto"))
        this.diagram.groupTemplate =
            $(go.Group, "Auto",
                {
                    layout: $(go.TreeLayout, { angle: 90, layerSpacing: 25 }),
                    computesBoundsAfterDrag: true,
                    mouseEnter: (e, thisObj) => thisObj.setProperties({ background: '#2b71ed' }),
                    mouseLeave: (e, thisObj) => thisObj.setProperties({ background: this.key == thisObj.key ? '#2b71ed' : '#6383bc' }),
                    click: (e, thisObj) => this.select(this.keyMap[thisObj.key]),
                    mouseDragLeave: addshow, mouseDrop: endshow, contextMenu: menu, movable: false
                },
                new go.Binding("background", "background"),
                new go.Binding("isSubGraphExpanded", "isSubGraphExpanded"),
                $(go.Shape, "Rectangle", { fill: null, stroke: null, strokeWidth: 5 }),
                $(go.Panel, "Vertical",
                    $(go.Panel, "Horizontal",
                        { stretch: go.GraphObject.Horizontal, height: 30, margin: 0 },
                        $("SubGraphExpanderButton", { alignment: go.Spot.Right, margin: 5 }),
                        $(go.TextBlock,
                            { alignment: go.Spot.Center, width: 120, stroke: 'white' },
                            new go.Binding("text", "text"))
                    ),
                    $(go.Panel, "Vertical",
                        { stretch: go.GraphObject.Horizontal, background: 'white' },
                        $(go.Placeholder, { padding: new go.Margin(10, 30, 10, 30), alignment: go.Spot.Center })
                    )
                )
            )
        this.diagram.linkTemplate =
            $(go.Link,
                {
                    mouseDragEnter: (e, thisObj) => thisObj.elt(1).setProperties({ fill: '#2b71ed' }),
                    mouseDragLeave: (e, thisObj) => thisObj.elt(1).setProperties({ fill: '#6383bc' }),
                    mouseDrop: (e, thisObj) => {
                        endshow()
                        let node = this.diagram.selection.first()
                        if (node == thisObj.fromNode) return
                        let outLinks = node.findLinksOutOf()
                        let inLinks = node.findLinksInto()
                        let step
                        if (inLinks.next() && outLinks.next()) {
                            step = this.keyMap[node.key]
                            let parent = node.containingGroup ? this.keyMap[node.containingGroup.key] : this.step
                            let index = parent.steps.indexOf(step)
                            parent.steps.splice(index, 1)
                            node.containingGroup = thisObj.containingGroup
                            inLinks.value.toNode = outLinks.value.toNode
                            outLinks.value.toNode = thisObj.toNode
                        } else {
                            let nodeName = node.data.type
                            step = { nodeName: nodeName, key: guid(), List: [] }
                            if (nodeName == 'LoopAction' || nodeName == 'BranchAction' || nodeName == 'NavigateAction' || nodeName == 'CookieAction' || nodeName == 'EnterTextAction' || nodeName == 'WaitAction') {
                                step.steps = []
                                let startKey = step.startKey = guid()
                                let endKey = step.endKey = guid()
                                this.diagram.model.addNodeData({ key: startKey, group: step.key, category: 'spacetemplate' })
                                this.diagram.model.addLinkData({ from: startKey, to: endKey })
                                this.diagram.model.addNodeData({ key: endKey, group: step.key, category: 'spacetemplate' })
                            }
                            this.diagram.removeParts(e.diagram.selection, false)
                            this.diagram.model.addNodeData(this.nodeData(step, thisObj.containingGroup ? thisObj.containingGroup.key : undefined))
                            this.diagram.model.addLinkData({ from: step.key, to: thisObj.toNode.key })
                            this.keyMap[step.key] = step
                        }
                        thisObj.toNode = this.diagram.findNodeForKey(step.key)
                        let parent = thisObj.fromNode.containingGroup ? this.keyMap[thisObj.fromNode.containingGroup.key] : this.step
                        let fromstep = this.keyMap[thisObj.fromNode.key]
                        let index = fromstep ? parent.steps.indexOf(fromstep) + 1 : 0
                        parent.steps.splice(index, 0, step)
                        this.select(step)
                    }, movable: false
                },
                $(go.Shape, { stroke: '#6383bc', pickable: false }),
                $(go.Shape, "Ellipse", { width: 15, height: 15, stroke: 'transparent', fill: 'transparent' }),
                $(go.Shape, "Rectangle", { width: 10, height: 3, stroke: null, fill: null }),
                $(go.Shape, "Rectangle", { width: 3, height: 10, stroke: null, fill: null }),
                $(go.Shape, { toArrow: "Standard", fill: '#6383bc', stroke: '#6383bc', pickable: false })
            )
    }
    insert = (step, parent, index) => {
        this.diagram.model.addLinkData({ from: step.key ? step.key : step.key = guid(), to: index < parent.steps.length ? parent.steps[index].key : parent.endKey })
        this.diagram.model.addNodeData(this.nodeData(step, parent.key))
        this.keyMap[step.key] = step
        let outLinks = this.diagram.findNodeForKey(index > 0 ? parent.steps[index - 1].key : parent.startKey).findLinksOutOf()
        if (outLinks.next()) outLinks.value.toNode = this.diagram.findNodeForKey(step.key)
        let { nodeDataArray, linkDataArray } = this.ds(step)
        nodeDataArray.forEach(nodeData => this.diagram.model.addNodeData(nodeData))
        linkDataArray.forEach(linkData => this.diagram.model.addLinkData(linkData))
        parent.steps.splice(index, 0, step)
    }
    ds = (step, s) => {
        let nodeDataArray = []
        let linkDataArray = []
        let dsteps = step => {
            if (!step.steps) return
            let preKey
            nodeDataArray.push({ key: preKey = step.startKey ? step.startKey : step.startKey = guid(), group: step.key, category: 'spacetemplate' })
            step.steps.forEach(sp => {
                linkDataArray.push({ from: preKey, to: preKey = sp.key ? sp.key : sp.key = guid() })
                nodeDataArray.push(this.nodeData(sp, step.key, s))
                this.keyMap[preKey] = sp
                dsteps(sp)
            })
            linkDataArray.push({ from: preKey, to: preKey = step.endKey ? step.endKey : step.endKey = guid() })
            nodeDataArray.push({ key: preKey, group: step.key, category: 'spacetemplate' })
        }
        dsteps(step)
        return { nodeDataArray: nodeDataArray, linkDataArray: linkDataArray }
    }
    nodeData = (step, group, s) => {
        return {
            key: step.key,
            text: (() => {
                switch (step.nodeName) {
                    case 'NavigateAction': return '打开网页'
                    case 'CookieAction': return '会话列表'
                    case 'ClickAction': return '点击元素'
                    case 'EnterTextAction': return '输入文本'
                    case 'ExtractDataAction': return '提取数据'
                    case 'LoopAction': return '元素列表'
                    case 'BranchAction': return '条件判断'
                    case 'WaitAction': return '延时等待'
                    case 'EditAction': return '编辑元素'
                    case 'PageAction': return '操作页面'
                    case 'QuitAction': return '结束流程'
                }
            })(),
            background: step == s ? '#2b71ed' : '#6383bc',
            group: group,
            isGroup: !!step.steps,
            isSubGraphExpanded: true,
        }
    }
}
export default FlowData
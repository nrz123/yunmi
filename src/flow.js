import React from 'react'
import * as go from 'gojs'
import { ReactDiagram } from 'gojs-react'
import './flow.css'
class Flow extends React.Component {
    constructor(props) {
        super(props)
    }
    render(){
        const {nodeDataArray,linkDataArray}=this.props.flowData.dataArray
        return(
            <div style={{height:'100%',width:'100%'}}>
                <ReactDiagram
                    initDiagram={()=>{
                        const $ = go.GraphObject.make
                        const palette =$(go.Palette,{allowVerticalScroll:false,allowHorizontalScroll:false,nodeSelectionAdornmentTemplate:$(go.Adornment, "Auto",$(go.Shape, { fill: null, stroke: null }))})
                        palette.nodeTemplate=$(go.Node, "Auto",
                            $(go.TextBlock,
                                { font: "Bold 12px Sans-Serif",stroke:'#2b71ed'},
                                new go.Binding("text", "text")))
                        return palette
                    }}
                    divClassName='palette-component'
                    nodeDataArray={[
                        {key:'NavigateAction',text:'打开网页',isPalatte:true,background:'#6383bc'},
                        {key:'CookieAction',text:'会话列表',isPalatte:true,background:'#6383bc'},
                        {key:'EnterTextAction',text:'输入文本',isPalatte:true,background:'#6383bc'},
                        {key:'ClickAction',text:'点击元素',isPalatte:true,background:'#6383bc'},
                        {key:'ExtractDataAction',text:'提取数据',isPalatte:true,background:'#6383bc'},
                        {key:'LoopAction',text:'元素列表',isPalatte:true,background:'#6383bc'},
                        {key:'BranchAction',text:'条件判断',isPalatte:true,background:'#6383bc'},
                        {key:'WaitAction',text:'延时等待',isPalatte:true,background:'#6383bc'},
                        {key:'EditAction',text:'编辑元素',isPalatte:true,background:'#6383bc'},
                        {key:'PageAction',text:'操作页面',isPalatte:true,background:'#6383bc'},
                        {key:'QuitAction',text:'退出循环',isPalatte:true,background:'#6383bc'},
                    ]}
                    onModelChange={()=>{}}
                />
                <ReactDiagram
                    initDiagram={()=>this.props.flowData.diagram}
                    divClassName='diagram-component'
                    nodeDataArray={nodeDataArray}
                    linkDataArray={linkDataArray}
                    onModelChange={()=>{}}
                />
            </div>
        )
    }
}
export default Flow
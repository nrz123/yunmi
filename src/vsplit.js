import React from 'react'
class VSplit extends React.Component {
    constructor(props) {
        super(props)
        this.state={}
        document.ondragstart = e=>false
    }
    render(){
        return(
            <div style={{
                width:'100%',
                height:"100%",
                float:'left',
                cursor:this.state.move?'e-resize':'default'
            }} onMouseMove={e=>{
                if(this.state.move){
                    this.props.move(e)
                }
            }} onMouseUp={e=>{
                this.setState({move:false})
            }} onMouseLeave={e=>{
                this.setState({move:false})
            }}>
                <div style={{width:this.props.right?this.props.leftWidth+'px':'100%',height:'100%',display:this.props.left?'':'none',float:'left'}}>
                    {this.props.left}
                </div>
                <div style={{
                    width:'5px',
                    height:'100%',
                    background:'grey',
                    cursor:'e-resize',
                    zIndex:'5',
                    float:'left',
                    display:this.props.left&&this.props.right?'':'none',
                    
                }} onMouseDown={()=>{
                    this.setState({move:true})
                }}/>
                <div style={{width:this.props.left?'calc(100% - '+(this.props.leftWidth+5)+'px)':'100%',height:'100%',display:this.props.right?'':'none',float:'left'}}>
                    {this.props.right}
                </div>
            </div>
        )
    }
}
export default VSplit
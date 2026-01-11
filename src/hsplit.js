import React from 'react'
class HSplit extends React.Component {
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
                cursor:this.state.move?'n-resize':'default'
            }} onMouseMove={e=>{
                if(this.state.move){
                    this.props.move(e)
                }
            }} onMouseUp={e=>{
                this.setState({move:false})
            }} onMouseLeave={e=>{
                this.setState({move:false})
            }}>
                <div style={{width:'100%',height:this.props.bottom?this.props.topHeight+'px':'100%',display:this.props.top?'':'none'}}>
                    {this.props.top}
                </div>
                <div style={{
                    width:'100%',
                    height:'5px',
                    background:'grey',
                    cursor:'n-resize',
                    zIndex:'5',
                    display:this.props.top&&this.props.bottom?'':'none'
                }} onMouseDown={()=>{
                    this.setState({move:true})
                }}/>
                <div style={{width:'100%',height:this.props.top?'calc(100% - '+(this.props.topHeight+5)+'px)':'100%',display:this.props.bottom?'':'none'}}>
                    {this.props.bottom}
                </div>
            </div>
        )
    }
}
export default HSplit
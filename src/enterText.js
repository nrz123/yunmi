import React from 'react'
import { Input,Modal} from 'antd'
class EnterText extends React.Component {
    constructor(props) {
        super(props)
        this.state={}
    }
    componentWillReceiveProps (nextProps){
        if(nextProps.visible){
            this.setState({text:undefined})
        }
    }
    render(){
        return(
            <Modal title="输入文字" visible={this.props.visible}onOk={()=>this.props.onOk(this.state.text)} onCancel={this.props.onCancel}>
                <Input value={this.state.text} onChange={e=>this.setState({text:e.target.value})} onPressEnter={()=>this.props.onOk(this.state.text)}></Input>
            </Modal>
        )
    }
}
export default EnterText
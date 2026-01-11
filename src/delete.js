import React from 'react'
import { Modal} from 'antd'
class Delete extends React.Component {
    constructor(props) {
        super(props)
        this.state={}
    }
    render(){
        return(
            <Modal title={this.props.title} visible={this.props.visible} onOk={()=>{
                this.props.ok()
                this.props.close()
            }} onCancel={this.props.close}/>
        )
    }
}
export default Delete
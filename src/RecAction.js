import React from 'react'
import { Collapse,Input,Select,Checkbox, Button,Popover,Radio } from 'antd'
class RecAction extends React.Component {
    constructor(props) {
        super(props)
        this.state={}
    }
    render(){
        return(
            <div style={{margin:'30px'}}>
                <table width='100%'>
                    <tbody>
                        <tr cellSpacing='15' width='100%'>
                            <td width='100'>操作名</td>
                            <td ><Input value='递归节点'></Input></td>
                        </tr>
                        <tr>
                            <td>递归层数</td>
                            <td>
                                <Input value={this.state.level==undefined?this.props.s.level:this.state.level} onChange={e=>{
                                    this.setState({level:e.target.value})
                                }} onBlur={e=>{
                                    let level=parseInt(e.target.value)
                                        if(!isNaN(level)){
                                            this.props.s.level=level
                                        }
                                        this.setState({level:undefined})
                                }}></Input>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <Checkbox checked={this.props.s.duplicate} onChange={e=>{
                                    this.props.s.duplicate=e.target.checked
                                    this.setState({})
                                }}>是否去重</Checkbox>
                            </td>
                            <td>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}
export default RecAction
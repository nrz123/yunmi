export let tabs={}
export let ref=node=>{
    if(!node)return
    tabs[node.props.tabKey]=node
}
export function stepfind(root,f){
    let  path=[]
    let find=step=>{
        path.unshift(step)
        if(f(step))return true
        if(step.steps){
            for(let i=0;i<step.steps.length;i++){
                let result=find(step.steps[i])
                if(result)return result
            }
        }
        path.shift()
    }
    find(root)
    return path
}
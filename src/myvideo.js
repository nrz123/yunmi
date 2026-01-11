exports.htmlmode=(umap)=>{
    let htmlcode=`<video id='myvideo' type='video/mp4' controls='' style='width: 100%; height: 100%;'></video>\n`
    htmlcode+='<script>\n'
    htmlcode+=`  let umap=${JSON.stringify(umap)}\n`
    htmlcode+=`  let video = document.getElementById('myvideo')\n`
    htmlcode+=`  let videoMS = new MediaSource()\n`
    htmlcode+=`  video.src = URL.createObjectURL(videoMS)\n`
    htmlcode+=`  videoMS.addEventListener('sourceopen', () => {\n`
    htmlcode+=`    videoMS.duration=0\n`
    htmlcode+=`    for(let uid in umap){\n`
    htmlcode+=`      let vsb = videoMS.addSourceBuffer(umap[uid])\n`
    htmlcode+=`      let appending = false, values = []\n`
    htmlcode+=`      vsb.addEventListener('updateend', () => {\n`
    htmlcode+=`        if (values.length > 0) return vsb.appendBuffer(values.shift())\n`
    htmlcode+=`        appending = false\n`
    htmlcode+=`      })\n`
    htmlcode+=`      window.fetch(uid+'.mp4').then(res => res.body.getReader()).then(async reader => {\n`
    htmlcode+=`        while (true) {\n`
    htmlcode+=`          const { done, value } = await reader.read()\n`
    htmlcode+=`          if (done) break\n`
    htmlcode+=`          values.push(value)\n`
    htmlcode+=`          if (appending) continue\n`
    htmlcode+=`          appending = true\n`
    htmlcode+=`          vsb.appendBuffer(values.shift())\n`
    htmlcode+=`        }\n`
    htmlcode+=`      })\n`
    htmlcode+=`    }\n`
    htmlcode+=`  })\n`
    htmlcode+=`</script>`
    return htmlcode
}
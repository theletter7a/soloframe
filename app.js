var ws = new WebSocket('wss://soloframe.ozziexyz.repl.co');

ws.onmessage = m=>{
    var res = JSON.parse(m.data);
    document.getElementById('frame').src = res.data;
    var parsed = res.name.split('.')[0].split('_');
    document.getElementById('title').textContent = parsed[0].replaceAll('-',' ');
    document.getElementById('artist').textContent = ' by ' + parsed[1].replaceAll('-',' ');
}
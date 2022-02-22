var date = new Date();
var formatter = new Intl.DateTimeFormat('en-US', { timeZone: "America/New_York" });   
var usDate = formatter.format(date);

if (usDate!=window.localStorage.getItem('lastreq')){
    var ws = new WebSocket('wss://soloframe.ozziexyz.repl.co');
    
    ws.onmessage = m=>{
        var res = JSON.parse(m.data);
        var parsed = res.name.split('.')[0].split('_');

        window.localStorage.setItem('today', res.data);
        window.localStorage.setItem('artist', parsed[1].replaceAll('-',' '));
        window.localStorage.setItem('title', parsed[0].replaceAll('-',' '));
        window.localStorage.setItem('lastreq', usDate);

        document.getElementById('frame').src = res.data;
        document.getElementById('title').textContent = parsed[0].replaceAll('-',' ');
        document.getElementById('artist').textContent = ' by ' + parsed[1].replaceAll('-',' ');
        ws.close();
    }
}
else{
    document.getElementById('frame').src = window.localStorage.getItem('today');
    document.getElementById('title').textContent = window.localStorage.getItem('title');
    document.getElementById('artist').textContent = ' by ' + window.localStorage.getItem('artist');
}

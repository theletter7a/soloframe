const fs = require('fs');
const readline = require('readline');
const {WebSocketServer} = require('ws');
const {google} = require('googleapis');
const fm = require('./lib/filemanager');
const b64 = require('./lib/base64');

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = './token.json';

var site = JSON.parse(fs.readFileSync('site_config.json', {encoding: 'utf-8'}));

var wss = new WebSocketServer({port: 8080});

wss.on('connection', ws=>{
    var date = new Date();
    var formatter = new Intl.DateTimeFormat('en-US', { timeZone: "America/New_York" });   
    var usDate = formatter.format(date);
    var res = {};
    if(usDate.split('/')[1]!=site.lastreq){
        site.lastreq = usDate.split('/')[1];
        fm.config(JSON.stringify(site));
        getGoogle(b=>{
            res.name = site.today, res.data = b;
            ws.send(JSON.stringify(res));
        })
    }
    else{
        res.name = site.today, res.data = b64.getImage(site.today);
        ws.send(JSON.stringify(res));
    }
})

function getGoogle(_callback){
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content), imageLoad);
    });
      
    function authorize(credentials, callback) {
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return getAccessToken(oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(oAuth2Client);
        });
    }
    
    function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) return console.error(err);
            console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
        });
    });
    }
    
    function imageLoad(auth){
        const drive = google.drive({version: 'v3', auth});
        drive.files.list({
            pageSize: 10,
            fields: 'nextPageToken, files(id, name, webContentLink, webViewLink)',
            q: "'"+site.folder+"' in parents and trashed = false"
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
              const files = res.data.files;
              var rand = Math.floor(Math.random() * files.length);
              site.today = files[rand].name;
              fm.download(files[rand], auth, ()=>{
                site.today = files[rand].name;
                _callback(b64.getImage(site.today));
              });
              fm.config(JSON.stringify(site));
        });
    }
}
const fs = require('fs');
const {google} = require('googleapis');

module.exports = {
    download: function(file, auth, _callback){
        const drive = google.drive({version: 'v3', auth});
        var site = JSON.parse(fs.readFileSync('site_config.json', {encoding: 'utf-8'}));
        if(site.today!=''){
            fs.unlinkSync('./image/'+site.today);
        }
        var dest = fs.createWriteStream('./image/'+file.name);
        drive.files.get({
            fileId: file.id,
            alt: 'media'
        },
        {responseType: 'stream'},
        (err, res) => {
            if(err) throw err;
            res.data.pipe(dest).on('finish', ()=>{
                _callback();
            });
        });
    },
    config: function(config){
        fs.writeFileSync('site_config.json', config);
    }
}
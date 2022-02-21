const fs = require('fs');

module.exports = {
    getImage:function(file){
        var bitmap = fs.readFileSync('./image/'+file);
        var ext = file.split('.')[1];
        return 'data:image/'+ext+';base64,'+new Buffer.from(bitmap).toString('base64');
    }
}
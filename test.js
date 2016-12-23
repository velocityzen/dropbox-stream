'use strict';
const fs = require('fs');
const path = require('path');
const api = require('./api');
const db = require('./index');

const TOKEN = '';
const FILETOUPLOAD = '';
const FILETODOWNLOAD = '';
const FILETODOWNLOADTO = '';

api({
  token: TOKEN,
  call: 'upload',
  data: 'LALALA',
  args: {
    path: '/test/lalala.txt',
    autorename: true
  }
}, function(err, res) {
  console.log(err, res);
});

let up = db.createDropboxUploadStream({
  token: TOKEN,
  filepath: '/test/' + path.basename(FILETOUPLOAD),
  chunkSize: 1000 * 1024
})
.on('done', res => console.log('Success', res))
.on('progress', res => console.log(res))
.on('error', err => console.log(err))

fs.createReadStream(FILETOUPLOAD).pipe(up);

db.createDropboxDownloadStream({
  token: TOKEN,
  filepath: FILETODOWNLOAD
})
.on('metadata', metadata => console.log('Metadata', metadata))
.on('error', err => console.log(err))
.pipe(fs.createWriteStream(FILETODOWNLOADTO));

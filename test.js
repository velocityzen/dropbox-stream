'use strict';
const fs = require('fs');
const path = require('path');
const api = require('./api');
const db = require('./index');

const TOKEN = '';
const FILETOUPLOAD = '';
const FILETODOWNLOAD = '';
const FILETODOWNLOADTO = '';

//upload
api({
  token: TOKEN,
  call: 'upload',
  data: 'LALALA',
  args: {
    path: '/test/lalala.txt',
    autorename: true
  }
}, function(err, res) {
  console.log('Simple upload', err, res);
});

let up = db.createDropboxUploadStream({
  token: TOKEN,
  filepath: '/test/' + path.basename(FILETOUPLOAD),
  chunkSize: 1000 * 1024
})
.on('done', res => console.log('Stream upload success', res))
.on('progress', res => console.log('Stream upload progress', res))
.on('error', err => console.log('Stream upload error', err))

fs.createReadStream(FILETOUPLOAD).pipe(up);

//download
db.createDropboxDownloadStream({
  token: TOKEN,
  filepath: FILETODOWNLOAD
})
.on('metadata', metadata => console.log('Stream download metadata', metadata))
.on('error', err => console.log('Stream download error', err))
.pipe(fs.createWriteStream(FILETODOWNLOADTO))
.on('finish', () => console.log('Stream download success'))

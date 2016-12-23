'use strict';
const fs = require('fs');
const path = require('path');
const api = require('./api');
const db = require('./index');

const FILETOUPLOAD = '';
const TOKEN = '';

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
});

up
  .on('done', res => console.log('Success', res))
  .on('progress', res => console.log(res))
  .on('error', err => console.log(err))

fs.createReadStream(FILETOUPLOAD).pipe(up);

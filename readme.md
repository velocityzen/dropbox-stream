# Dropbox Stream

Transfrom stream that uploads files to dropbox using upload session API

## Install

`npm i dropbox-stream`

## Usage

```js
const db = require('dropbox-stream');

const TOKEN = 'put your dropbox token here';
const FILETOUPLOAD = '/some/file.txt';

let up = db.createDropboxUploadStream({
  token: TOKEN,
  filepath: '/test/' + path.basename(FILETOUPLOAD),
  chunkSize: 1000 * 1024,
  autorename: true
});

up
  .on('done', res => {
    console.log('Success', res);
  })
  .on('error', err => {
    console.log(err);
  })

fs.createReadStream(FILETOUPLOAD).pipe(up);

```

License MIT

Copyright (c) 2016 Alexey Novikov

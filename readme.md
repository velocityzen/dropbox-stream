# Dropbox Stream

Upload & Download streams for [Dropbox](https://dropbox.com)

## Install

`npm i dropbox-stream`

## Usage

### Upload

Uploading files to dropbox using upload session API

```js
const db = require('dropbox-stream');

const TOKEN = 'put your dropbox token here';
const FILETOUPLOAD = '/some/file.txt';

let up = db.createDropboxUploadStream({
    token: TOKEN,
    filepath: '/test/' + path.basename(FILETOUPLOAD),
    chunkSize: 1000 * 1024,
    autorename: true
  })
  .on('done', res => console.log('Success', res))
  .on('progress', res => console.log(res))
  .on('error', err => console.log(err))

fs.createReadStream(FILETOUPLOAD).pipe(up);

```

### Download

```js
const db = require('dropbox-stream');

const TOKEN = 'put your dropbox token here';
const FILETODOWNLOAD = '/some/file.txt';
const FILETODOWNLOADTO = './file.txt';

db.createDropboxDownloadStream({
  token: TOKEN,
  filepath: FILETODOWNLOAD
})
.on('metadata', metadata => console.log('Metadata', metadata))
.on('error', err => console.log(err))
.pipe(fs.createWriteStream(FILETODOWNLOADTO));

```

License MIT

Copyright (c) 2016 Alexey Novikov

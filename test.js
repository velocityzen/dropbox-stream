'use strict';
const fs = require('fs');
const test = require('ava');
const got = require('got');
const api = require('./api');
const db = require('./index');

const TOKEN = '';

test.before(() => {
  if (!TOKEN) {
    throw new Error('No dropbox API access token found');
  }
});

test.after.always(() => got('https://api.dropboxapi.com/2/files/delete_v2', {
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  },
  method: 'POST',
  body: '{"path":"/test"}'
}));

test.serial.cb('uploads a file to dropbox with simple upload api', t => {
  api({
    token: TOKEN,
    call: 'upload',
    data: 'TEST',
    args: {
      path: '/test/test.txt',
      autorename: true
    }
  }, function(err, res) {
    if (err) {
      return t.fail(err);
    }

    t.truthy(res.id);
    t.is(res.path_lower, '/test/test.txt');
    t.is(res.name, 'test.txt');
    t.end();
  });
});

test.serial.cb('downloads the file', t => {
  t.plan(4);
  db.createDropboxDownloadStream({
    token: TOKEN,
    filepath: '/test/test.txt'
  })
    .on('metadata', metadata => {
      t.truthy(metadata.id);
      t.is(metadata.path_lower, '/test/test.txt');
      t.is(metadata.name, 'test.txt');
    })
    .on('error', err => t.fail(err))
    .pipe(fs.createWriteStream('./test.txt'))
    .on('finish', () => {
      t.pass();
      t.end();
    })
});

test.serial.cb('uploads a file with none ASCII name', t => {
  api({
    token: TOKEN,
    call: 'upload',
    data: 'TEST',
    args: {
      path: '/test/测试.txt',
      autorename: true
    }
  }, function(err, res) {
    if (err) {
      return t.fail(err);
    }
    t.truthy(res.id);
    t.is(res.path_lower, '/test/测试.txt');
    t.is(res.name, '测试.txt');
    t.end();
  });
});

test.serial.cb('uploads a big file with session api', t => {
  t.plan(5);

  const up = db.createDropboxUploadStream({
    token: TOKEN,
    filepath: '/test/big.txt',
    chunkSize: 100 * 1024
  })
    .on('error', err => t.fail(err))
    .on('progress', res => {
      t.truthy(res);
    })
    .on('done', res => {
      t.truthy(res.id);
      t.is(res.path_lower, '/test/big.txt');
      t.is(res.name, 'big.txt');
      t.end();
    })

  fs.createReadStream('./package-lock.json').pipe(up);
});


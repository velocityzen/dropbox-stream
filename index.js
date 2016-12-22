'use strict';
const inherits = require('util').inherits;
const Transform = require('stream').Transform;
const api = require('./api');

let DropboxUploadStream = function(opts = {}) {
  Transform.call(this, opts);
  this.chunkSize = opts.chunkSize || 1000 * 1024;
  this.filepath = opts.filepath;
  this.token = opts.token;
  this.autorename = opts.autorename || true;
  this.session = undefined;
  this.offset = 0;
}
inherits(DropboxUploadStream, Transform);

DropboxUploadStream.prototype.checkBuffer = function(chunk) {
  if (!this.buffer) {
    this.buffer = Buffer.from(chunk);
  } else {
    this.buffer = Buffer.concat([ this.buffer, chunk ]);
  }

  return this.buffer.length >= this.chunkSize;
};

DropboxUploadStream.prototype._transform = function(chunk, encoding, cb) {
  if (!this.checkBuffer(chunk)) {
    return cb();
  }

  if (!this.session) {
    api({
      call: 'uploadStart',
      token: this.token,
      data: this.buffer
    }, (err, res) => {
      if (err) {
        this.buffer = undefined;
        return cb(err);
      }

      this.session = res.session_id;
      this.offset += this.buffer.length;
      this.buffer = undefined;
      cb();
    });

    return;
  }

  api({
    call: 'uploadAppend',
    token: this.token,
    data: this.buffer,
    args: {
      cursor: {
        session_id: this.session,
        offset: this.offset
      }
    }
  }, (err) => {
    if (err) {
      this.buffer = undefined;
      return cb(err);
    }

    this.offset += this.buffer.length;
    this.buffer = undefined;
    cb();
  });
};

DropboxUploadStream.prototype._flush = function(cb) {
  api({
    call: 'uploadFinish',
    token: this.token,
    data: this.buffer,
    args: {
      cursor: {
        session_id: this.session,
        offset: this.offset
      },
      commit: {
        path: this.filepath,
        autorename: this.autorename
      }
    }
  }, (err, res) => {
    this.buffer = undefined;

    if (err) {
      return cb(err);
    }

    this.emit('done', res);
    cb();
  })
};

module.exports = {
  DropboxUploadStream,
  createDropboxUploadStream: opts => {
    return new DropboxUploadStream(opts);
  }
};

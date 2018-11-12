'use strict';
const inherits = require('util').inherits;
const Transform = require('stream').Transform;
const api = require('./api');

const DropboxDownloadStream = function(opts) {
  Transform.call(this, opts);
  this.getStream(opts);
  this.offset = 0;
}
inherits(DropboxDownloadStream, Transform);

DropboxDownloadStream.prototype.getStream = function({ token, url, path }) {
  const call = { token };

  if (url) {
    call.call = 'downloadSharedLink';
    call.args = { url };
    if (path) {
      call.args.path = path;
    }
  } else {
    call.call = 'download';
    call.args = { path };
  }

  const req = api(call, (err, res) => {
    if (err) {
      process.nextTick(() => this.emit('error', err));
      return;
    }

    this.emit('metadata', res);
  });

  req.pipe(this);
};

DropboxDownloadStream.prototype._transform = function(chunk, encoding, cb) {
  this.offset += chunk.length;
  this.emit('progress', this.offset);
  cb(null, chunk);
}

module.exports = {
  DropboxDownloadStream,
  createDropboxDownloadStream: opts => new DropboxDownloadStream(opts)
}

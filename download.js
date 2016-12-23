'use strict';
const inherits = require('util').inherits;
const Transform = require('stream').Transform;
const api = require('./api');

let DropboxDownloadStream = function(opts = {}) {
  Transform.call(this, opts);
  this.getStream(opts.token, opts.filepath);
}
inherits(DropboxDownloadStream, Transform);

DropboxDownloadStream.prototype.getStream = function(token, filepath) {
  let req = api({
    call: 'download',
    token: token,
    args: {
      path: filepath
    }
  }, (err, res) => {
    if (err) {
      process.nextTick(() => this.emit('error', err));
      return;
    }

    this.emit('metadata', res);
  });

  req.pipe(this);
};

DropboxDownloadStream.prototype._transform = (chunk, encoding, cb) => cb(null, chunk);

module.exports = {
  DropboxDownloadStream,
  createDropboxDownloadStream: opts => {
    return new DropboxDownloadStream(opts);
  }
}

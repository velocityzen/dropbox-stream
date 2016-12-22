'use strict';
const hyperquest = require('hyperquest');

const apiBase = 'https://content.dropboxapi.com/2/';
const api = {
  base: apiBase,
  upload: apiBase + 'files/upload',
  uploadStart: apiBase + 'files/upload_session/start',
  uploadAppend: apiBase + 'files/upload_session/append_v2',
  uploadFinish: apiBase + 'files/upload_session/finish'
}

let parseResponse = function(cb) {
  return res => {
    const statusCode = res.statusCode;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
      error = new Error(`Request Failed.\nStatus Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error(`Invalid content-type.\nExpected application/json but received ${contentType}`);
    }

    if (error) {
      // consume response data to free up memory
      res.resume();
      cb(error)
      return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => {
      rawData += chunk
    });
    res.on('end', () => {
      if (rawData) {
        try {
          let parsedData = JSON.parse(rawData);
          cb(null, parsedData);
        } catch (e) {
          cb(new Error(`Response parsing failed: ${e.message}`));
        }
      } else {
        cb();
      }
    });
  }
}

module.exports = function(opts, cb) {
  let headers = {
    'Authorization': 'Bearer ' + opts.token,
    'Content-Type': 'application/octet-stream'
  };

  if (opts.args) {
    headers['Dropbox-API-Arg'] = JSON.stringify(opts.args);
  }

  let req = hyperquest(api[ opts.call ], {
    method: 'POST',
    headers: headers
  });

  req
    .on('response', parseResponse(cb))
    .on('error', cb);

  req.end(opts.data);
};

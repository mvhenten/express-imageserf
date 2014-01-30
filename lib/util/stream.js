'use strict';

var Stream = require('stream'),
    fs = require('fs'),
    request = require('request');

module.exports = {
    createReadStream: function(source, done) {
        if (source instanceof Stream.Readable) return source;

        fs.stat(source, function(err) {
            if (!err) return done(null, fs.createReadStream(source));

            request(source, done);
        });
    }
};

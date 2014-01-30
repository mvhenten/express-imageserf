'use strict';

var Wolperting = require('class-wolperting'),
    fs = require('fs'),
    gm = require('gm'),
    stream = require('stream');

module.exports = Wolperting.create({
    source: {
        $isa: function ValidSource(source) {
            if (source instanceof stream.Readable) return true;
            return fs.existsSync(source);
        }
    },

    identify: function(done) {
        gm(this.source)
            .identify(done);
    },

    resize: function(width, height, target, done) {
        gm(this.source)
            .resize(width, height)
            .write(target, function(err) {
                done(err, target);
            });
    }
});

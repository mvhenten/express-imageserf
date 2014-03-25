'use strict';

var fs = require('fs'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    Wolperting = require('class-wolperting');

module.exports = Wolperting.create({

    path: String,

    store: function(source, done) {
        var dir = this.path,
            target = dir + '/' + path.basename(source);

        mkdirp(dir, function(err) {
            if (err) throw new Error('Failed creating storage dir: ' + err);

            fs.rename(source, target, function(err) {
                if (err) throw new Error('Failed storing image: ' + err);
                done(null, target);
            });
        })
    },

    remove: function(source, done) {
        fs.unlink(source, done);
    }

});

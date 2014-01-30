'use strict';

var fs = require('fs'),
    path = require('path'),
    Wolperting = require('class-wolperting');

module.exports = Wolperting.create({

    path: String,

    store: function(source, done) {
        var target = this.path + '/' + path.basename(source);

        fs.rename(source, target, function(err) {
            if (err) throw new Error('Failed storing image: ' + err);
            done(null, target);
        });

    },

    remove: function(source, done) {
        fs.unlink(source, done);
    }

});

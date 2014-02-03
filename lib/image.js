'use strict';

var fs = require('fs'),
    gm = require('gm'),
    fs = require('fs'),
    Stream = require('./util/stream');

var Validate = {
    image: function ValidImage(target) {
        return /[.][jpe?g|png]/.test(target);
    },

    operations: function ValidOperations(ops) {
        if (!ops instanceof Array) return false;

        var im = gm();

        return ops.every(function(op) {
            return (typeof im[op.name] === 'function' && op.value instanceof Array);
        });
    }
};

function _process(source, target, operations, done) {
    var im = gm(source);

    operations.forEach(function(op) {
        im = im[op.name].apply(im, op.value);
    });

    im.write(target, function(err) {
        if (err) return done(err);

        gm(target).identify(function(err, info) {
            if (err) return done(err);

            done(err, target, info);
        });
    });
}

module.exports = {
    process: function(source, target, operations, done) {
        if (!Validate.image(source)) throw new TypeError('Not a valid image source: ' + source);
        if (!Validate.image(target)) throw new TypeError('Not a valid image source: ' + source);
        if (!Validate.operations(operations)) throw new TypeError('Not a valid image source: ' + source);

        Stream.createReadStream( source, function( err, sourde ){
            _process(source, target, operations, done);
        });
    }
};

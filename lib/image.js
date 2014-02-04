'use strict';

var gm = require('gm'),
    Wolperting = require('class-wolperting'),
    stream = require('stream'),
    Stream = require('./util/stream');

var Image = Wolperting.create({

    source: stream.Readable,

    target: function ValidImage(target) {
        return /[.][jpe?g|png]/.test(target);
    },

    operations: function ValidOperations(ops) {
        var im = gm();

        if (!ops instanceof Array) return false;

        return ops.every(function(op) {
            return (typeof im[op.name] === 'function' && op.value instanceof Array);
        });
    },

    process: function(done) {
        var im = gm(this.source),
            target = this.target;

        this.operations.forEach(function(op) {
            im = im[op.name].apply(im, op.value);
        });

        im.write(this.target, function(err) {
            if (err) return done(err);

            gm(target).identify(function(err, info) {
                if (err) return done(err);

                done(err, target, info);
            });
        });
    }
});

module.exports = {
    process: function(source, target, operations, done) {
        Stream.createReadStream(source, function(err, source) {
            var im = new Image({
                source: source,
                target: target,
                operations: operations
            });

            im.process(done);
        });
    }
};

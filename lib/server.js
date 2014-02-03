'use strict';

var _ = require('lodash'),
    util = require('util'),
    async = require('async'),
    Image = require('./image');

var Validate = {
    hooks: function ValidHooks(hooks) {
        var methods = ['create', 'store', 'load', 'remove'];

        return _.all(methods, function(method) {
            return _.isFunction(hooks[method]);
        });
    },

    images: function(name, images, done) {
        var image = null,
            original = null;

        image = _.find(images, {
            name: name
        });

        if (image) return done(null, image);

        original = _.find(images, {
            name: 'original'
        });

        if (!original) return done('IMAGE_ORIGINAL_NOT_FOUND');

        done(null, null, original);
    }
};

function _process(source, target, operations, storage, done) {
    Image.process(source, target, operations, function(err, out, info) {
        storage.store(out, function(err, location) {
            done(err, location, info);
        });
    });
}

function _image(name, location, info) {
    return _.extend({
        name: name,
        location: location,
        extension: 'jpg'
    }, info.size);
}

var Server = function(args) {
    if (!Validate.hooks(args.hooks)) throw new TypeError('Invalid hooks given: ' + args.hooks);
    if (!args.operations) throw new TypeError('Operations must be an Object');

    _.extend(this, _.pick(args, ['hooks', 'operations', 'storage']));
};

Server.prototype = {
    create: function(source, type, done) {
        var hooks = this.hooks,
            storage = this.storage,
            ops = this.operations.original;

        hooks.create(type, function(err, id) {
            if (err) return done(err);

            var target = util.format('/tmp/%s.jpg', id);

            _process(source, target, ops, storage, function(err, location, info) {
                var image = _image('original', location, info);
                hooks.store(id, image, done);
            });
        });
    },

    get: function(id, name, done) {
        var hooks = this.hooks,
            ops = this.operations[name],
            storage = this.storage;

        if (!ops) return done('SIZE_NOT_FOUND');

        hooks.load(id, function(err, images) {
            if (err || !images || !images.length) return done('IMAGE_NOT_FOUND');

            Validate.images(name, images, function(err, image, original) {
                var target = null;

                if (err) return done(err);
                if (image) return done(null, image);

                target = util.format('/tmp/%s-%s.jpg', id, name);

                _process(original.location, target, ops, storage, function(err, location, info) {
                    var image = _image(name, location, info);

                    hooks.store(id, image, function(err) {
                        done(err, image);
                    });
                });
            });
        });
    },

    remove: function(id, done) {
        this.hooks.remove(id, function(err, images) {
            var storage = this.storage;

            async.each(images, function(image, next) {
                storage.remove(image.location, next);
            }, done);
        });
    }
};

module.exports = Server;

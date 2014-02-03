'use strict';

var _ = require('lodash'),
    util = require('util'),
    async = require('async'),
    Stream = require('./util/stream'),
    Image = require('./util/image'),
    Wolperting = require('class-wolperting');

function _resize(source, target, size, storage, done) {
    Stream.createReadStream(source, function(err, stream) {
        var im = new Image({
            source: stream
        });

        im.resize(size.width, size.height, target, function(err, out) {
            var im = new Image({
                source: out
            });

            im.identify(function(err, info) {
                storage.store(out, function(err, location) {
                    done(err, location, info);
                });
            });
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

module.exports = Wolperting.create({

    config: Object,

    storage: {
        $isa: Object,
        $lazy: function() {
            return this.config.storage;
        }
    },

    hooks: {
        $isa: function Hooks(hooks) {
            var methods = ['create', 'store', 'load', 'remove'];

            return _.all(methods, function(method) {
                return _.isFunction(hooks[method]);
            });
        }
    },

    getSize: function(name) {
        return this.config.sizes[name];
    },

    create: function(source, type, done) {
        var hooks = this.hooks,
            storage = this.storage,
            size = this.getSize('original');

        hooks.create(type, function(err, id) {
            if (err) return done(err);

            var target = util.format('/tmp/%s.jpg', id);

            _resize(source, target, size, storage, function(err, location, info) {
                var image = _image('original', location, info);
                hooks.store(id, image, done);
            });
        });
    },

    get: function(id, name, done) {
        var hooks = this.hooks,
            size = this.getSize(name),
            storage = this.storage;

        if (!size) return done('SIZE_NOT_FOUND');

        hooks.load(id, function(err, images) {
            var image = null,
                original = null,
                target = null;

            if (err || !images || !images.length) return done('IMAGE_NOT_FOUND');

            image = _.find(images, {
                name: name
            });

            if (image) return done(null, image);

            original = _.find(images, {
                name: 'original'
            });

            if (!original) return done('IMAGE_ORIGINAL_NOT_FOUND');

            target = util.format('/tmp/%s-%s.jpg', id, name);

            _resize(original.location, target, size, storage, function(err, location, info) {
                var image = _image(name, location, info);

                hooks.store(id, image, function(err) {
                    done(err, image);
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
});

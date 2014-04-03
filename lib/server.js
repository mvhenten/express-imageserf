'use strict';

var _ = require('lodash'),
    util = require('util'),
    async = require('async'),
    Wolperting = require('class-wolperting'),
    Image = require('./image');

module.exports = Wolperting.create({
    hooks: function ValidHooks(hooks) {
        return _.all(['create', 'store', 'load', 'remove'], function(method) {
            return _.isFunction(hooks[method]);
        });
    },

    storage: Wolperting.Types.DuckType('Storage', {
        store: Function,
        remove: Function,
    }),

    operations: Wolperting.Types.PlainObject,

    create: function(source, type, done) {
        this.hooks.create(type, function(err, id) {
            if (err) return done(err);
            this._run(id, 'original', source, done);
        }.bind(this));
    },

    get: function(id, name, done) {
        this.hooks.load(id, function(err, images) {
            var image = this._find(images || [], name);

            if (err || !image) return done('IMAGE_NOT_FOUND');
            if (image.name === name) return done(null, image);

            this._run(id, name, image.location, done);
        }.bind(this));
    },

    remove: function(id, done) {
        var storage = this.storage;

        this.hooks.remove(id, function(err, images) {
            if (!images) {
                console.trace('remove: no images for %s', id);
                return done(0);
            }

            if (!(images instanceof Array)) images = [].concat(images);

            async.each(images, function(image, next) {
                storage.remove(image.location, next);
            }, done);
        });
    },

    _run: function(id, name, source, done) {
        if (!this.operations[name]) return done('SIZE_NOT_FOUND');

        Image.process(source, util.format('/tmp/%s-%s.jpg', id, name), this.operations[name], function(err, out, info) {
            var hooks = this.hooks;

            this.storage.store(out, function(err, location) {
                var image = _.extend({
                    id: id,
                    name: name,
                    location: location,
                    extension: 'jpg'
                }, info.size);

                hooks.store(id, image, function(err) {
                    done(err, image, id);
                });
            });
        }.bind(this));
    },

    _find: function(images, name) {
        var image = _.find(images, {
            name: name
        });

        if (image) return image;

        return _.find(images, {
            name: 'original'
        });
    },
});

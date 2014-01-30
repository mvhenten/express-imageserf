var _ = require('lodash'),
    util = require('util'),
    Stream = require('./lib/util/stream'),
    Server = require('./lib/server.js'),
    Image = require('./util/image'),
    middleware = require('./middleware'),
    Wolperting = require('class-wolperting');

module.exports = {
    Server: function(config) {
        var hooks = _.omit(config, 'config'),
            server = new Server({
                hooks: hooks
            });


        return Object.freeze({
            create: function(source, type, done) {
                server.create(source, type, done);
            },

            remove: function(id, done) {
                server.remove(id, done);
            },

            get middleware() {
                return middleware(serf, config.config);
            },

            get Storage() {
                return {
                    S3: require('./storage/s3'),
                    fs: require('./storage/fs')
                };
            }
        });
    }
};

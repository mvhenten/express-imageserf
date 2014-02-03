'use strict';

var Server = require('./lib/server');

module.exports = {
    get Sizes() {
        return require('./lib/size.js');
    },

    get Storage() {
        return {
            //            S3: require('./lib/storage/s3'),
            Fs: require('./lib/storage/fs')
        };
    },

    Server: function(args) {
        var server = new Server({
            hooks: args.hooks,
            config: args.config
        });


        return Object.freeze({
            create: function(source, type, done) {
                server.create(source, type, done);
            },

            remove: function(id, done) {
                server.remove(id, done);
            },

            get middleware() {
                return require('./lib/middleware')(server, args.config);
            }
        });
    }
};

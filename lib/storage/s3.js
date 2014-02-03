'use strict';

var Wolperting = require('class-wolperting'),
    path = require('path'),
    Url = require('url'),
    util = require('util'),
    knox = require('knox'),
    path = require('path');


module.exports = Wolperting.create({
    key: String,

    secret: String,

    bucket: String,

    path: String,

    endpoint: String,

    client: {
        $isa: Object,
        $lazy: function() {
            return knox.createClient({
                key: this.key,
                secret: this.secret,
                bucket: this.bucket
            });
        }
    },

    store: function(source, done) {
        var target = path.basename(source),
            headers = {
                'x-amz-acl': 'public-read',
                'Content-Type': 'image/jpeg'
            };

        target = path.join(this.path, target);

        this.client.putFile(source, target, headers, function(err) {
            var url = util.format('%s/%s%s', this.endpoint, this.bucket, target);
            done(err, url);
        }.bind(this));
    },

    remove: function(target, done) {
        var url = Url.parse(target);

        this.client.deleteFile(url.pathname, function(err, res) {
            if (err || res.statusCode !== 204) console.error(util.format('failed to delete %s from amazon s3: %s', target, err));
            done();
        });
    }
});

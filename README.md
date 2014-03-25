# WARNING BETA SOFTWARE

express-imageserf
=================

Images are a pain. Often you want to request different versions of the same image,
such as thumbnails and low-res previews, or cropped versions.

Most approaches resize image up-front on the local file system before uploading
them to a CDN or storage like S3 or Manta. This is propably the most efficient way
of handling image resizing.

This module trades efficiency over flexibility: rather than resizing images up-front,
it resizes them on request. This gives you great flexibility, as adding a new image
size does not require you to rescale all images at once.

While the intent is to support multiple storage backends, serving images trough
node can be an advantage as you can control the exact url of the images. Splitting
the module in a middleware component and a storage backend allows you to separate
the image server from your main server when needed.

It is propably recommended to put a caching proxy or at least nginx in front of
this, however, as serving images trough node is not as efficient.

status
======

Currently beta. My todo:

* implement the manta storage backend
* improve and test the S3 backend
* implement a local filesystem cache strategy, keep originals around to avoid retrieving the image from s3
* add tests

howto
=====

Have a look at the [example app](./sample-app) to see how this module integrates
in express. For real live purposes you'll propably want to store image-serf in a
singleton and use the same object everywhere.

```javascript
    var express = require('express');
    var app = express();

    app.use(express.bodyParser());

    var Serf = require('../index');

    require('./db').init(function(err, db) {
        'use strict';

        var im = Serf.Server({
            operations: Serf.Sizes,

            storage: new Serf.Storage.Fs({
                path: __dirname + '/images'
            }),

            path: '/:id/:size.jpg',

            hooks: {
                create: function(type, done) {
                    db.create(function(err, id) {
                        done(null, id);
                    });
                },

                store: function(id, data, done) {
                    db.set(id, data, done);
                },

                load: function(id, done) {
                    db.get(id, done);
                },

                remove: function(id, done) {
                    db.remove(id, done);
                },
            }
        });

        app.get('/', function(req, res) {
            var html = '<form enctype="multipart/form-data" method="post">' + '<input type="file" name="image" />' + '<input type="submit" value="upload" />' + '</form>';

            res.send(html);
        });

        app.get('/show/:id', function(req, res) {
            var html = '';

            for (var key in Serf.Sizes) {
                if (key !== 'original') {
                    html += '<img src="/img/' + req.params.id + '/' + key + '.jpg" /><br/>';
                }
            }

            res.send(html);
        });

        app.post('/', function(req, res) {
            im.create(req.files.image.path, 'original', function(err, data, id) {
                res.redirect('/show/' + id);
            });
        });

        app.use('/img', im.middleware);

        app.listen(3000);

        console.log('Listening on port 3000');
    });
```
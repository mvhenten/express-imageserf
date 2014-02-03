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
            console.log(data);
            res.redirect('/show/' + id);
        });
    });

    app.use('/img', im.middleware);

    app.listen(3000);

    console.log('Listening on port 3000');
});

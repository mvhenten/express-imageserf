'use strict';

var express = require('express'),
    Stream = require('./util/stream');

module.exports = function(serf, config) {
    var router = new express.Router();

    router.get(config.path, function(req, res) {
        if (req.get('If-None-Match')) return res.send(304);

        serf.get(req.params.id, req.params.size, function(err, img) {
            if (err) return res.send(404);

            res.set('Content-Type', 'image/jpeg');
            res.set('Expires', new Date((new Date()).setDate(9999)));
            res.set('ETag', req.params.id + req.params.size);

            Stream.createReadStream(img.location, function(err, stream) {
                stream.pipe(res);
            });
        });
    });

    return router;
};

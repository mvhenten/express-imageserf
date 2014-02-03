var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db.db');

var storage = {
    init: function(done) {
        db.run("CREATE TABLE img ( images TEXT )", function() {
            done(null, db);
        });
    },

    create: function(done) {
        db.run('insert into img values (?)', null, function() {
            done(null, this.lastID);
        });
    },

    get: function(id, done) {
        db.get('SELECT * FROM img WHERE rowid = ?', id, function(err, row) {
            var images = JSON.parse(row.images || '[]');
            done(err, images);
        });
    },

    set: function(id, data, done) {
        storage.get(id, function(err, images) {
            images.push(data);
            db.run('UPDATE img SET images = ?', JSON.stringify(images), done);
        });
    },

    remove: function(id, done) {
        storage.get(id, function(err, images) {
            db.run('DELETE FROM img WHERE id = ?', id, function() {
                done(null, images);
            });
        });
    }
}

storage.init(function(err, db) {
    storage.create(function(err, id) {

        storage.get(id, function(err, data) {
            console.log(id);
            storage.set(id, {
                one: 1
            }, function() {
                storage.get(id, function(err, data) {
                    console.log(data);
                });


            });

        });


    });


});



//db.close();

/**
 * super simple storage for demo only
 *
 */

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(__dirname + '/db.sqlite');

var Storage = {
    init: function(done) {
        db.run("CREATE TABLE img ( images TEXT )", function() {
            done(null, Storage);
        });
    },

    create: function(done) {
        db.run('INSERT INTO img values (?)', null, function() {
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
        Storage.get(id, function(err, images) {
            images.push(data);
            db.run('UPDATE img SET images = ?', JSON.stringify(images), function() {
                Storage.get(id, function(err, images) {
                    done(err, images, id);
                });
            });
        });
    },

    remove: function(id, done) {
        Storage.get(id, function(err, images) {
            db.run('DELETE FROM img WHERE id = ?', id, function() {
                done(null, images);
            });
        });
    }
}

module.exports = Storage;

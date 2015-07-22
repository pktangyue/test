var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/test';

var findTimeTest = function(db, callback) {
    var cursor =db.collection('system.profile').find( );
    var sum = 0;
    var count = 0;
    cursor.each(function(err, doc) {
        assert.equal(err, null);
        if (doc != null) {
            //console.dir(doc);
            sum += isNaN(doc.millis) ? 0 : doc.millis;
            console.log(sum);
            count ++;
            console.log(count);
        } else {
            console.log("avg : " + sum/count);
            callback();
        }
    });
};

var getAvgTime = function(db, callback){
    var limit = 0;
    db.collection('system.profile').aggregate(
        [
            { $match : {} },
            { $group : {"_id" : { $dayOfYear : "$ts"} , "date" : {$min : "$ts"}, "avgtime" : { $avg : "$millis"} } },
            { $sort: {_id: -1}},
            { $limit: 1 } 
        ]
    ).toArray( function ( err, result ) {
        assert.equal( null, err);
        console.log(result);
        callback();
    });
}

MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    getAvgTime(db, function() {
        db.close();
    });
});

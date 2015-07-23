var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/test';
var express = require('express');
var app = express();
var router = express.Router();

var getPerDayAvgTime = function(date, recent, db, callback){
    db.collection('system.profile').aggregate(
        (function(){
            var ret = [];
            if ( date ) {
                var today = new Date(date);
                var utc_today = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
                var utc_tomorrow = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 1));
                console.log('today ' + utc_today.toString());
                console.log('tomorrow' + utc_tomorrow.toString());
                ret.push({ $match : {
                    ts : {
                        $gte : utc_today ,
                        $lt : utc_tomorrow
                    }} 
                });
            }
            ret.push({ $group : {
                '_id' : { $dayOfYear : '$ts'} ,
                'date' : {$min : '$ts'},
                'avgtime' : { $avg : '$millis'} 
            } });
            ret.push( { $sort: {_id: -1}} );
            if ( recent && recent > 0 ) {
                console.log('recent : ' + recent);
                ret.push( { $limit: recent } );
            }
            return ret;
        })()
    ).toArray( function ( err, result ) {
        assert.equal( null, err);
        console.log(result);
        callback(result);
    });
}

router.get('/perday', function ( req, res) {
    console.log('------------');
    
    console.log(req.query.date);
    if ( req.query.date && isNaN(Date.parse(req.query.date))){
        res.send('date must be a valid date');
        return;
    }
    var date = req.query.date;

    console.log(req.query.recent);
    if ( req.query.recent && isNaN(req.query.recent) ) {
        res.send('recent must be a positive integer');
        return;
    }
    var recent = parseInt(req.query.recent);

    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        getPerDayAvgTime(date, recent, db, function(result) {
            db.close();
            res.send(result);
        });
    });
});

app.use('/api/avgtime/', router);

app.listen(3000, function () {
    console.log('app is listening at port 3000');
});

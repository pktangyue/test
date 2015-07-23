var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/test';
var express = require('express');
var app = express();
var router = express.Router();
var moment = require('moment');
var DATE_VALID_FORMAT = 'YYYYMMDD';

var getPerDayAvgTime = function(date, recent, db, callback){
    db.collection('system.profile').aggregate(
        (function(){
            var ret = [];

            if ( date ) {
                var start_date = moment.utc(date, DATE_VALID_FORMAT).startOf('day');
                var end_date = start_date.clone().endOf('day');
                console.log('start_date ' + start_date.toISOString());
                console.log('end_date ' + end_date.toISOString());

                ret.push({ $match : {
                    ts : {
                        $gte : start_date.toDate(),
                        $lte : end_date.toDate()
                    }

                } 
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
            ret.push( { 
                $project : { 
                    '_id' : 0,
                    'date' : { $dateToString : { format : '%Y-%m-%d', date : '$date' } },
                    'avgtime' : '$avgtime'
                }
            });
            return ret;
        })()
    ).toArray( function ( err, result ) {
        assert.equal( null, err);
        console.log(result);
        callback(result);
    });
}

var getPerWeekAvgTime = function(date, week, recent, db, callback){
    db.collection('system.profile').aggregate(
        (function(){
            var ret = [];
            if ( date || week) {
                var start_date;
                if ( date )
                {
                    start_date = moment.utc(date, DATE_VALID_FORMAT).startOf('week');
                } else if ( week ) {
                    start_date = moment.utc().week(week).startOf('week');
                }
                var end_date = start_date.clone().endOf('week');
                console.log('start_date ' + start_date.toISOString());
                console.log('end_date ' + end_date.toISOString());

                ret.push({ $match : {
                    ts : {
                        $gte : start_date.toDate() ,
                        $lte : end_date.toDate()
                    }} 
                });
            }
            ret.push({ $group : {
                '_id' : { $week : '$ts'} ,
                'avgtime' : { $avg : '$millis'} 
            } });
            ret.push( { $sort: {_id: -1}} );
            if ( recent && recent > 0 ) {
                console.log('recent : ' + recent);
                ret.push( { $limit: recent } );
            }
            ret.push( { 
                $project : { 
                    '_id' : 0,
                    'week' : { $add : [ '$_id', 1 ] }, // mongodb 返回的week会小1，不知道为什么
                    'avgtime' : '$avgtime'
                }
            });
            return ret;
        })()
    ).toArray( function ( err, result ) {
        assert.equal( null, err);
        console.log(result);
        callback(result);
    });
}

var getPerMonthAvgTime = function(month, recent, db, callback){
    db.collection('system.profile').aggregate(
        (function(){
            var ret = [];
            if ( month ) {
                var start_date = moment.utc().month(month - 1).startOf('month');
                var end_date = start_date.clone().endOf('month');
                console.log('start_date ' + start_date.toISOString());
                console.log('end_date ' + end_date.toISOString());

                ret.push({ $match : {
                    ts : {
                        $gte : start_date.toDate() ,
                        $lte : end_date.toDate()
                    }} 
                });
            }
            ret.push({ $group : {
                '_id' : { $month : '$ts'} ,
                'avgtime' : { $avg : '$millis'} 
            } });
            ret.push( { $sort: {_id: -1}} );
            if ( recent && recent > 0 ) {
                console.log('recent : ' + recent);
                ret.push( { $limit: recent } );
            }
            ret.push( { 
                $project : { 
                    '_id' : 0,
                    'month' : '$_id',
                    'avgtime' : '$avgtime'
                }
            });
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
    if ( req.query.date && ! moment(req.query.date, DATE_VALID_FORMAT, true).isValid()){
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

router.get('/perweek', function ( req, res) {
    console.log('------------');

    console.log(req.query.week);
    if ( req.query.week && isNaN(req.query.week)){
        res.send('week must be a positive integer');
        return;
    }
    var week = req.query.week;

    console.log(req.query.date);
    if ( req.query.date && ! moment(req.query.date, DATE_VALID_FORMAT, true).isValid()){
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
        getPerWeekAvgTime(date, week, recent, db, function(result) {
            db.close();
            res.send(result);
        });
    });
});

router.get('/permonth', function ( req, res) {
    console.log('------------');

    console.log(req.query.month);
    if ( req.query.month && isNaN(req.query.month)){
        res.send('month must be a valid month');
        return;
    }
    var month = parseInt(req.query.month);

    console.log(req.query.recent);
    if ( req.query.recent && isNaN(req.query.recent) ) {
        res.send('recent must be a positive integer');
        return;
    }
    var recent = parseInt(req.query.recent);

    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        getPerMonthAvgTime(month, recent, db, function(result) {
            db.close();
            res.send(result);
        });
    });
});

app.use('/api/avgtime/', router);

app.listen(3000, function () {
    console.log('app is listening at port 3000');
});

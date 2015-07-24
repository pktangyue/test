var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/test';
var moment = require('moment');

var getPerDayAvgTime = function(year, date, recent, callback){
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection('system.profile').aggregate(
            (function(){
                var ret = [];
                
                var start_date;
                var end_date;
                if ( date.isValid() ) {
                    start_date = date.startOf('day');
                    end_date = start_date.clone().endOf('day');
                }
                else {
                    start_date = moment.utc().year(parseInt(year)).startOf('year');
                    end_date = start_date.clone().endOf('year');
                }
                console.log('start_date ' + start_date.toISOString());
                console.log('end_date ' + end_date.toISOString());
                ret.push({ $match : {
                    ts : {
                        $gte : start_date.toDate(),
                        $lte : end_date.toDate()
                    }

                } 
                });
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
            db.close();
            callback(result);
        });
    });
};

var getPerWeekAvgTime = function(year, date, week, recent, callback){
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection('system.profile').aggregate(
            (function(){
                var ret = [];
                var start_date;
                var end_date;
                if ( date.isValid() )
                {
                    start_date = date.startOf('week');
                    end_date = start_date.clone().endOf('week');
                } else if ( week ) {
                    start_date = moment.utc().week(week).startOf('week');
                    end_date = start_date.clone().endOf('week');
                }
                else {
                    start_date = moment.utc().year(parseInt(year)).startOf('year');
                    end_date = start_date.clone().endOf('year');
                }
                console.log('start_date ' + start_date.toISOString());
                console.log('end_date ' + end_date.toISOString());

                ret.push({ $match : {
                    ts : {
                        $gte : start_date.toDate() ,
                        $lte : end_date.toDate()
                    }} 
                });
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
            db.close();
            callback(result);
        });
    });
};

var getPerMonthAvgTime = function(year, month, recent, callback){
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection('system.profile').aggregate(
            (function(){
                var ret = [];
                var start_date;
                var end_date;
                if ( month ) {
                    start_date = moment.utc().month(month - 1).startOf('month');
                    end_date = start_date.clone().endOf('month');
                }
                else {
                    start_date = moment.utc().year(parseInt(year)).startOf('year');
                    end_date = start_date.clone().endOf('year');
                }
                console.log('start_date ' + start_date.toISOString());
                console.log('end_date ' + end_date.toISOString());

                ret.push({ $match : {
                    ts : {
                        $gte : start_date.toDate() ,
                        $lte : end_date.toDate()
                    }} 
                });
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
            db.close();
            callback(result);
        });
    });
};

exports.getPerDayAvgTime = getPerDayAvgTime;
exports.getPerWeekAvgTime = getPerWeekAvgTime;
exports.getPerMonthAvgTime = getPerMonthAvgTime;

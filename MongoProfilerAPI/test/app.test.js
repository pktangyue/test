var app = require('../app.js');
var supertest = require('supertest');
var request = supertest(app);
var should = require('should');
var async = require('async');

describe('test/app.test.js', function () {
    it('should return a 404 status', function(done) {
        request.get('/api/avgtime/2015/per')
        .expect(404)
        .end(function (err, res){
            done();
        });
    });

    it('should return a Array like [ { "title" : "aa", "href" : "bb" } ]', function (done) {
        request.get('/api/')
        .expect(200)
        .end(function (err, res) {
            should.not.exist(err);

            JSON.parse(res.text).should.not.throw();
            var result = JSON.parse(res.text);
            result.should.matchEach(function (value) {
                value.should.have.keys('title', 'href');
            });
            done();
        });
    });

    it('should return a Array like [ { "avgtime" : 1, "date" : "2015-07-26" } ]', function(done) {
        var urls = [
            '/api/avgtime/2015/perday',
            '/api/avgtime/2015/perday?date=0723',
            '/api/avgtime/2015/perday?limit=2'
        ];
        var test = function (value, callback) {
            request.get(value)
            .expect(200)
            .end(function ( err, res ) {

                should.not.exist(err);

                JSON.parse(res.text).should.not.throw();
                var result = JSON.parse(res.text);

                result.should.be.an.Array();
                if ( result.length > 0 ) {
                    result.should.matchEach(function(value) {
                        value.should.match( { 
                            'date' : /^\d{4}-\d{2}-\d{2}$/,
                            'avgtime' : function (it) {
                                it.should.be.an.Number();
                            }
                        });
                    });
                }
                callback();
            });
        };

        async.each(urls, test, function(err) {
            should.not.exist(err);
            done();
        });
    });

    it('should return a Array like [ { "avgtime" : 1, "week" : 30 } ]', function(done) {
        var urls = [
            '/api/avgtime/2015/perweek',
            '/api/avgtime/2015/perweek?week=30',
            '/api/avgtime/2015/perweek?date=0723',
            '/api/avgtime/2015/perweek?limit=1'
        ];
        var test = function (value, callback) {
            request.get(value)
            .expect(200)
            .end(function ( err, res ) {

                should.not.exist(err);

                JSON.parse(res.text).should.not.throw();
                var result = JSON.parse(res.text);

                result.should.be.an.Array();
                if ( result.length > 0 ) {
                    result.should.matchEach(function(value) {
                        value.should.match( { 
                            'week' : function (it) {
                                it.should.be.within(0, 53);
                            },
                            'avgtime' : function (it) {
                                it.should.be.an.Number();
                            }
                        });
                    });
                }
                callback();
            });
        };

        async.each(urls, test, function(err) {
            should.not.exist(err);
            done();
        });
    });

    it('should return a Array like [ { "avgtime" : 1, "month" : 7 } ]', function(done) {
        var urls = [
            '/api/avgtime/2015/permonth',
            '/api/avgtime/2015/permonth?month=7',
            '/api/avgtime/2015/permonth?limit=1'
        ];
        var test = function (value, callback) {
            request.get(value)
            .expect(200)
            .end(function ( err, res ) {

                should.not.exist(err);

                JSON.parse(res.text).should.not.throw();
                var result = JSON.parse(res.text);

                result.should.be.an.Array();
                if ( result.length > 0 ) {
                    result.should.matchEach(function(value) {
                        value.should.match( { 
                            'month' : function (it) {
                                it.should.be.within(1, 12);
                            },
                            'avgtime' : function (it) {
                                it.should.be.an.Number();
                            }
                        });
                    });
                }
                callback();
            });
        };

        async.each(urls, test, function(err) {
            should.not.exist(err);
            done();
        });
    });

    var test_500 = function (message, urls) {
        it('should return a 500 status with a message "' + message + '"', function (done) {
            var test = function (value, callback) {
                request.get(value)
                .expect(500)
                .end(function (err, res) {
                    res.text.should.equal(message);
                    callback();
                });
            };
            async.each(urls, test, function(err) {
                should.not.exist(err);
                done();
            });
        })
    };

    test_500('you should enter a valid year', 
        [
            '/api/avgtime/aa/perday',
            '/api/avgtime/-2/perweek',
            '/api/avgtime/22a/permonth'
        ]
    );

    test_500('date must be a valid date', 
        [
            '/api/avgtime/2015/perday?date=3910',
            '/api/avgtime/2015/perday?date=abc',
            '/api/avgtime/2015/perday?date=09-01'
        ]
    );

    test_500('limit must be a positive integer',
        [
            '/api/avgtime/2015/perday?limit=0',
            '/api/avgtime/2015/perweek?limit=a',
            '/api/avgtime/2015/permonth?limit=0a'
        ]
    );

    test_500('week must be a valid week',
        [
            '/api/avgtime/2015/perweek?week=60',
            '/api/avgtime/2015/perweek?week=-1',
            '/api/avgtime/2015/perweek?week=a',
            '/api/avgtime/2015/perweek?week=1a',
        ]
    );

    test_500('date must be a valid date', 
        [
            '/api/avgtime/2015/perweek?date=3910',
            '/api/avgtime/2015/perweek?date=abc',
            '/api/avgtime/2015/perweek?date=09-01'
        ]
    );

    test_500('month must be a valid month',
        [
            '/api/avgtime/2015/permonth?month=60',
            '/api/avgtime/2015/permonth?month=-1',
            '/api/avgtime/2015/permonth?month=a',
            '/api/avgtime/2015/permonth?month=1a',
        ]
    );
});

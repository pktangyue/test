var express = require('express');
var router = express.Router();
var DATE_VALID_FORMAT = 'YYYYMMDD';
var moment = require('moment');
var model = require('./model.js');

var isPositiveNumber = function( val ) {
    return /^[1-9]\d*$/.test(val);
};

router.param('year', function ( req, res, next, year){
    // console.log('------------');
    if ( year && isPositiveNumber ( year )) {
        req.year = year;
        // console.log('year : ' + req.year);
        next();
    }
    else {
        res.status(500).send('you should enter a valid year');
        return;
    }
});

router.get('/:year/perday', function ( req, res) {
    var date = moment.utc(req.year + req.query.date, DATE_VALID_FORMAT, true)
    // console.log('date : ' + req.query.date);
    if ( req.query.date && ! date.isValid()){
        res.status(500).send('date must be a valid date');
        return;
    }

    var recent = req.query.recent;
    // console.log('recent : ' + recent);
    if ( recent && ! isPositiveNumber(recent) ) {
        res.status(500).send('recent must be a positive integer');
        return;
    }

    model.getPerDayAvgTime(req.year, date, parseInt(recent), function(result) {
        res.send(result);
    });
});

router.get('/:year/perweek', function ( req, res) {
    var week = req.query.week;
    // console.log('week : ' +  week );
    if ( week && ( ! isPositiveNumber( week ) || parseInt( week ) > 53) ) {
        res.status(500).send('week must be a valid week');
        return;
    }

    var date = moment.utc(req.year + req.query.date, DATE_VALID_FORMAT, true)
    // console.log('date : ' + req.query.date);
    if ( req.query.date && ! date.isValid()){
        res.status(500).send('date must be a valid date');
        return;
    }

    var recent = req.query.recent;
    // console.log('recent : ' + recent);
    if ( recent && ! isPositiveNumber(recent) ) {
        res.status(500).send('recent must be a positive integer');
        return;
    }

    model.getPerWeekAvgTime(req.year, date, week, parseInt(recent), function(result) {
        res.send(result);
    });
});

router.get('/:year/permonth', function ( req, res) {
    var month = req.query.month
    // console.log('month : ' + month );
    if ( month && ( ! isPositiveNumber( month ) || parseInt( month ) > 12) ) {
        res.status(500).send('month must be a valid month');
        return;
    }

    var recent = req.query.recent;
    // console.log('recent : ' + recent);
    if ( recent && ! isPositiveNumber(recent) ) {
        res.status(500).send('recent must be a positive integer');
        return;
    }

    model.getPerMonthAvgTime(req.year, month, parseInt(recent), function(result) {
        res.send(result);
    });
});

module.exports = router;

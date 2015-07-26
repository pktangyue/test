var express = require('express');
var app = express();
var router = require('./router.js');

app.get('/api/', function (req, res) {
    var result = [];
    result.push({
        'title' : 'get avgtime by perday',
        'href' : '/api/avgtime/:year/perday{?date,limit}'
    });
    result.push({
        'title' : 'get avgtime by perweek',
        'href' : '/api/avgtime/:year/perweek{?date,week,limit}'
    });
    result.push({
        'title' : 'get avgtime by permonth',
        'href' : '/api/avgtime/:year/permonth{?month,limit}'
    });
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result, null, 4));
});

app.use('/api/avgtime/', router);

module.exports = app;

app.listen(3000, function () {
    console.log('app is listening at port 3000');
});

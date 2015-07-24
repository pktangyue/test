var express = require('express');
var app = express();
var router = require('./router.js');

app.use('/api/avgtime/', router.router);

app.listen(3000, function () {
    console.log('app is listening at port 3000');
});

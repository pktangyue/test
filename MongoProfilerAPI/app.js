var express = require('express');
var app = express();
var router = require('./router.js').router;

app.use('/api/avgtime/', router);

app.listen(3000, function () {
    console.log('app is listening at port 3000');
});

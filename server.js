require('babel-register');

var PORT = process.env.PORT || 8080;
var app = require('./src/app').app;


app.listen(PORT, function() {
    console.log('Listening on port ' + PORT);
});
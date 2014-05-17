var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = module.exports = express();

var os = require('os');
var spawn = require('child_process').spawn;
var i18n = require('i18n');

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.static(__dirname + '/static'))
app.use(bodyParser.urlencoded());
app.use(cookieParser());

app.locals.pretty = true; // set jade to pretty-print globally

i18n.configure({
	locales: ['en', 'de' ],
	directory: __dirname + '/i18n',
	defaultLocale: 'en',
	cookie: 'cinequeue-locale'
});

app.use(i18n.init);

var server = app.listen(9000, function() {
	console.log('Listening on port %d', server.address().port);
});

// routes (etc): TODO: load this dynamically
var index = require('./routes/index');
var files = require('./routes/files');
var players = require('./routes/player');
var languages = require('./routes/langselect');
var errors = require('./routes/errors');



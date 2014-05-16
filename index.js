var express = require('express');
var bodyParser = require('body-parser');
var spawn = require('child_process').spawn;
var app = express();

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.static(__dirname + '/static'))
app.use(bodyParser.urlencoded());

var queue = [];

var mplog = "";

var currentplayer = false;

function spawnplayer(uri) {
	if(currentplayer) {
		console.warn('Warning: mplayer still running?');
	}
	queue.splice(0, 1);
	currentplayer = spawn('mplayer', [uri]);

	currentplayer.on('close', function(code) {
		console.log('mplayer exited');
		currentplayer = false;
		if(queue.length) {
			spawnplayer(queue[0].uri);
		}
	});
	currentplayer.stderr.on('data', function(d) {
		console.error('' + d);
	});
	currentplayer.stdout.on('data', function(d) {
		console.log('' + d);
	});
}

function queueItem(uri) {
	queue.push({
		'uri': uri
	});
	console.log('queued %s', uri);
	spawnplayer(queue[0].uri);
}

app.get('/', function(req, res) {
	res.render('index',
		{
			'queue': queue,
			'pretty': true
		});
});

app.post('/queue', function(req, res) {
	var uri = req.body.uri;
	queueItem(uri);
	res.redirect('/');
});

app.use(function(err, req, res, next){
	console.error(err.stack);
	res.send(500, 'Something broke!');
});

var server = app.listen(9000, function() {
	console.log('Listening on port %d', server.address().port);
});

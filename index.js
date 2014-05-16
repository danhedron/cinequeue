var express = require('express');
var bodyParser = require('body-parser');
var spawn = require('child_process').spawn;
var os = require('os');
var app = express();

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.static(__dirname + '/static'))
app.use(bodyParser.urlencoded());

var queue = [];
var mplog = "";
var currentplayer = false;
var currentCommand = "";
var playing = false;

function spawnplayer(uri) {
	if(currentplayer) {
		console.warn('Warning: mplayer still running?');
	}
	queue.splice(0, 1);
	currentplayer = spawn('mplayer', [uri, '-quiet']);
	currentCommand = "mplayer " + uri;

	currentplayer.on('close', function(code) {
		console.log('mplayer exited');
		currentplayer = false;
		currentCommand = '';
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

function playtop() {
	if(! currentplayer && playing && queue.length > 0) {
		spawnplayer(queue[0].uri);
	}
}

function queueItem(uri, requester) {
	queue.push({
		'uri': uri,
		'requester': requester
	});
	console.log('queued %s from %s', uri, requester);
	playtop();
}

app.get('/', function(req, res) {
	res.render('index',
		{
			'queue': queue,
			'currentCommand': currentCommand,
			'playing': playing,
			'host': os.hostname(),
			'pretty': true
		});
});

app.post('/queue', function(req, res) {
	var uri = req.body.uri;
	if(uri.length) {
		queueItem(uri, req.ip);
	}
	res.redirect('/');
});

app.post('/command', function(req, res) {
	var cmd = req.body.command;
	if( cmd == 'pause' ) {
		playing = false;
	}
	else if( cmd == 'play' ) {
		playing = true;
		playtop();
	}
	res.redirect('/');
});

app.use(function(err, req, res, next){
	console.error(err.stack);
	res.send(500, 'Something broke!');
});

var server = app.listen(9000, function() {
	console.log('Listening on port %d', server.address().port);
});

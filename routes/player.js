var app = require('../server.js');

var os = require('os');
var spawn = require('child_process').spawn;

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
	currentCommand = uri;

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
			'currentCommand': decodeURI(currentCommand),
			'playing': playing,
			'host': os.hostname(),
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
	else if( cmd == 'skip' ) {
		if( currentplayer ) {
			currentplayer.kill();
		}
	}
	else if( cmd == 'die' ) {
		res.redirect('/');
		process.exit(0);
	}
	res.redirect('/');
});

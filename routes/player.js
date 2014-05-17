var app = require('../server.js');

var os = require('os');
var spawn = require('child_process').spawn;

var queue = [];
var mplog = "";
var currentplayer = false;
var currentCommand = {url:'',output:{err:[],out:[]}}
var playing = false;

if(!process.env['DISPLAY']) {
	console.error('No display set!');
	process.exit(0);
}

function spawnplayer(uri) {
	if(currentplayer) {
		console.warn('Warning: mplayer still running?');
	}
	queue.splice(0, 1);
	currentplayer = spawn('mplayer', [uri, '-nomsgcolor', '-really-quiet', '-identify']);
	currentCommand.url = uri;

	currentplayer.on('close', function(code) {
		console.log('mplayer exited');
		currentplayer = false;
		currentCommand.url = '';
		currentCommand.output = { err: [], out: [] };
		if(queue.length) {
			spawnplayer(queue[0].uri);
		}
	});
	currentplayer.stderr.on('data', function(d) {
		d = '' + d;
		d = d.split('\n');
		currentCommand.output.err = currentCommand.output.err.concat(d);
		console.error('' + d);
	});
	currentplayer.stdout.on('data', function(d) {
		d = '' + d;
		d = d.split('\n');
		currentCommand.output.out= currentCommand.output.out.concat(d);
		console.log('' + d);
		for (out in currentCommand.output.out) {
			out = currentCommand.output.out[out];
			if (out) {
				var curr = out.split('=');
				if (!currentCommand.props) {
					currentCommand.props = {};
				}
				currentCommand.props[curr[0]] = curr[1];
			}
		}
		console.log(currentCommand.props);
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

app.get('/queue', function(req, res) {
	res.render('queue',
		{
			'queue': queue,
			'currentCommand': currentCommand,
			'playing': playing,
			'host': os.hostname(),
		});
});

app.post('/queue', function(req, res) {
	var uri = req.body.uri;
	if(uri.length) {
		queueItem(uri, req.ip);
	}
	res.redirect('/queue');
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

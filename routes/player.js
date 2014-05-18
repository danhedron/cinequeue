var app = require('../server.js');

var os = require('os');
var spawn = require('child_process').spawn;
var dgram = require('dgram');

var queue = [];
var previous = [];
var previousCount = 2;
var mplog = "";
var currentplayer = false;
var currentCommand = {url:'',output:{err:[],out:[]}, host:''}
var playing = false;
var playRemote = false;
var remoteHost = 'localhost' // e.g. media@viewbox

if(!process.env['DISPLAY']) {
	console.error('No display set!');
	process.exit(0);
}

function spawnplayer(data) {
	if(currentplayer) {
		console.warn('Warning: mplayer still running?');
	}
	if(playRemote) {
		var cmd = ['DISPLAY='+process.env['DISPLAY'], 'mplayer', data.uri, '-nomsgcolor', '-really-quiet', '-identify'].join(' ');
		currentplayer = spawn('ssh', [remoteHost, cmd]);
		currentCommand.host = remoteHost;
		console.log("Spawning %s on %s", cmd, currentCommand.host);
	}
	else {
		currentplayer = spawn('mplayer', [data.uri, '-nomsgcolor', '-really-quiet', '-identify']);
		currentCommand.host = os.hostname();
	}
	currentCommand.url = data.uri;
	currentCommand.requester = data.requester;
	sendUdp( 'NP: ' + currentCommand.url + ' on ' + currentCommand.host );

	currentplayer.on('close', function(code) {
		console.log('mplayer exited');
		currentplayer = false;
		recordHistory({
			'uri': currentCommand.url,
			'requester': currentCommand.requester
		});
		currentCommand.url = '';
		currentCommand.requester = '';
		currentCommand.output = { err: [], out: [] };

		if(queue.length) {
			playtop();
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

function recordHistory(entry) {
	if(previous.length == previousCount) {
		previous.splice(0, 1);
	}
	previous.push(entry);
}

function playtop() {
	if(! currentplayer && playing && queue.length > 0) {
		var nextUp = queue[0];
		queue.splice(0, 1);
		spawnplayer(nextUp);
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
			'history': previous,
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
			currentplayer.stdin.write('q');
			//currentplayer.kill();
		}
	}
	else if( cmd == 'die' ) {
		res.redirect('/');
		process.exit(0);
	}
	res.redirect('/');
});

function sendUdp( msg ) {
	var message = new Buffer( msg );
	var client = dgram.createSocket( 'udp4' );
	client.send( message, 0, message.length, 41337, 'saraneth.chippy.ch' );
}

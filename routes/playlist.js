var app = require( '..' );
var config = require( '../config' );
var i18n = require( 'i18n' );
var log = require( 'colog' );
var os = require( 'os' );
var spawn = require( 'child_process').spawn;

var currentPlayer = false;
var queue = [];
var playing = false;
var currentCommand = {
	url: '',
	host: ''
};
var previous = [];

app.get( '/playlist/', function ( req, res ) {
	if ( !config.get( 'allowplaylist' ) ) {
		res.render( 'forbidden', {
			msg: res.__( 'Playlist interaction has been disabled.' )
		} );
		return;
	}
	res.render( 'playlist', {
		queue: queue,
		history: previous,
		currentCommand: currentCommand,
		host: os.hostname()
	} );
} );


function spawnPlayer( data ) {
	if ( currentPlayer ) {
		log.warning( 'mplayer still running?' );
	}
	if ( config.get( 'playremote' ) ) {
		var cmd = [
			'DISPLAY=' + config.get( 'display' ),
	   		'mplayer',
	   		data.uri,
	   		'-nomsgcolor',
			'-quiet'
	   ].join( ' ' );

		currentCommand.host = config.get( 'remotehost' );

		currentPlayer = spawn( 'ssh', [
			currentCommand.host,
			cmd
		] );

		log.success( i18n.__( 'Spawning %s on %s', cmd, currentCommand.host ) );
	} else {
		currentPlayer = spawn( 'mplayer', [
			data.uri,
			'-nomsgcolor',
			'-quiet'
		] );

		currentCommand.host = os.hostname();

	}

	currentCommand.url = data.uri;
	currentCommand.requester = data.requester;

	currentPlayer.on( 'close', function ( code ) {
		log.info( 'mplayer exited' );
		currentPlayer = false;
		recordHistory( {
			'uri': currentCommand.url,
			'requester': currentCommand.requester
		} );

		currentCommand.url = '';
		currentCommand.requester = '';
		currentCommand.output = {
			err: [],
			out: []
		};

		if ( queue.length ) {
			playTop();
		}
	} );

	currentPlayer.stderr.on( 'data', function ( d ) {
		d = '' + d;
		log.warning( d );
	} );

	currentPlayer.stdout.on( 'data', function ( d ) {
		d = '' + d;
		log.info( d );
	} );

}

function recordHistory ( entry ) {
	if ( previous.length == previousCount ) {
		previous.splice( 0, 1 );
	}
	previous.push( entry );
}

function playTop() {
	if ( !currentPlayer && playing && queue.length  > 0 ) {
		var nextUp = queue[0];
		queue.splice( 0, 1 );
		spawnPlayer( nextUp );
	}
}

function queueItem( uri, requester ) {
	queue.push( {
		'uri': uri,
		'requester': requester
	} );
	log.success( i18n.__( 'Queued %s from %s', uri, requester ) );
	playTop();
}

app.post( '/playlist/add/', function ( req, res ) {
	var uri = req.body.uri;
	if ( uri.length ) {
		queueItem( uri, req.ip );
		req.flash( 'success', res.__( 'Successfully queued %s', uri ) );
	} else {
		req.flash( 'err', res.__( 'Unable to queue that!' ) );
	}
	res.redirect( '/playlist/' );
} );
app.get( '/playlist/add/', function ( req, res ) {
	req.flash( 'warn', res.__( 'That command must be sent as a POST request.' ) );
	res.redirect( '/playlist/' );
} );

app.get( '/playlist/cmd/:command', function ( req, res ) {
	var cmd = req.params.command;
	switch ( cmd ) {
		case 'pause':
			playing = false;
			req.flash( 'success', res.__( 'Player paused.' ) );
			break;
		case 'play':
			playing = true;
			req.flash( 'success', res.__( 'Player started.' ) );
			playTop();
			break;
		case 'skip':
			if ( currentPlayer ) {
				// move forward in playlist
				currentPlayer.stdin.write( '>' );
				// currentPlayer.kill();
				req.flash( 'success', res.__( 'Skipped to next file.' ) );
			}  else {
				req.flash( 'warn', res.__( 'Unable to skip.' ) );
			}
			break;
		case 'die':
			if ( config.get( 'allowkill') ) {
				req.flash( 'info', res.__( 'Killing process.' ) );
				req.redirect( '/' );
				process.exit( 0 );
			} else {
				req.flash( 'err', res.__( 'Killing the process has been disallowed.' ) )
			}
	}
	res.redirect( '/playlist' );
} );


var app = require( '..' );
var config = require( '../config' );
var i18n = require( 'i18n' );
var log = require( 'colog' );
var os = require( 'os' );

var Playlist = require( '../components/playlist' ),
	Player = require( '../components/player' );

var playlist = new Playlist();
var player = new Player( playlist );

app.locals.player = player;

app.get( '/playlist/queue/', function ( req, res ) {
	res.render( 'queue', {
		queue: playlist._queue,
		history: playlist._history,
		identify: player._stdout.IDENTIFY,
		nowplaying: player.nowPlaying(),
		hostname: os.hostname(),
		host: 'http://' + req.headers.host + '/raw/' // TODO: detect if https
	} );
} );

app.get( '/playlist/playing/', function ( req, res ) {
	if ( player.nowPlaying() ) {
		var md = player.metadata();
		if ( md && md.clip && md.clip.info ) {
			md.clip.data = md.clip.info;
			md.clip.info = {};
			for ( var key in md.clip.data ) {
				if ( key.substr( 0, 4 ) === 'name' ) {
					var id = key.substr( 4 );
					if ( md.clip.data['value'+id] ) {
						md.clip.info[md.clip.data[key]] = md.clip.data['value' + id];
					}
				}
			}
		}
		res.json( {
			uri: player.nowPlaying().uri,
			status: player.status(),
		//	max: player.metadata().length,
			md: md
		} );
	} else {
		res.json( {
			error: res.__( 'Nothing playing' )
		} );
	}
} );

app.get( '/playlist/', function ( req, res ) {
	if ( !config.get( 'playlist.allow' ) ) {
		res.render( 'forbidden', {
			msg: res.__( 'Playlist interaction has been disabled.' )
		} );
		return;
	}
	res.render( 'playlist', {
		queue: playlist._queue,
		history: playlist._history,
		identify: player._stdout.IDENTIFY,
		nowplaying: player.nowPlaying(),
		host: os.hostname()
	} );
} );

app.post( '/playlist/add/', function ( req, res ) {
	var uri = req.body.uri;
	var count = 0;
	if ( uri && uri.length ) {
		playlist.queue( {
			'uri': uri,
			'requester': req.ip
		} );
		count++;
		req.flash( 'success', res.__( 'Successfully queued %s', decodeURI( uri ) ) );
		log.success( i18n.__( 'Queued %s from %s', uri, req.ip ) );
	} else {
		Object.keys( req.body ).forEach( function ( k ) {
			if( k.substring( 0, 4 ) === 'uri_' ) {
				playlist.queue( {
					'uri': req.body[k],
					'requester': req.ip
				} );
				count++;
			}
		} );
		if ( count ) {
			req.flash( 'success', res.__( 'Successfully queued %s files', count ) );
		} else {
			req.flash( 'error', res.__( 'Unable to find any files to queue' ) );
		}
	}
	res.redirect( '/playlist/#' + res.__( 'queue' ) + '-' + ( playlist._queue.length - count + 1) );
} );
app.get( '/playlist/add/', function ( req, res ) {
	req.flash( 'warn', res.__( 'That command must be sent as a POST request.' ) );
	res.redirect( '/playlist/' );
} );

app.get( '/playlist/cmd/:command', function ( req, res ) {
	var cmd = req.params.command;
	switch ( cmd ) {
		case 'pause':
			player.setAutoPlaying( false );
			req.flash( 'success', res.__( 'Player paused.' ) );
			break;
		case 'play':
			player.setAutoPlaying( true );
			req.flash( 'success', res.__( 'Player started.' ) );
			break;
		case 'skip':
			player.stop();
			req.flash( 'success', res.__( 'Skipped to next file.' ) );
			break;
		case 'die':
			if ( config.get( 'player.kill') ) {
				req.flash( 'info', res.__( 'Killing process.' ) );
				res.redirect( '/' );
				process.exit( 0 );
			} else {
				req.flash( 'err', res.__( 'Killing the process has been disallowed.' ) );
			}
	}
	res.redirect( '/playlist' );
} );

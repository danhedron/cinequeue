var spawn = require( 'child_process').spawn;
var config = require('../config');
var i18n = require( 'i18n' );
var log = require( 'colog' );

var Player = function(playlist, remoteHost) {
	var _autoplaying = false;
	var _nowplaying = null;
	var _onPlay = null;
	var _onStop = null;
	var _process = null;
	var _currentPID = 0;

	var _stderr = [];
	var _stdout = [];

	playlist.onQueue(function(item) {
		if( this.autoPlaying() &&
			this.nowPlaying() == null ) {
			this.playNext();
		}
	}.bind( this ));

	this.playNext = function() {
		if( _process != null ) {
			this.stop();
		}

		var n = playlist.next();
		if( n !== null ) {
			playlist.popNext();
			this.play(n);
		}
	}

	this.play = function(item) {
		_nowplaying = item;

		this._stderr = [];
		this._stdout = [];

		if ( config.get( 'playremote' ) ) {
			var cmd = [
				'DISPLAY=' + config.get( 'display' ),
				'mplayer',
				_nowplaying.uri,
				'-nomsgcolor',
				'-quiet'
			].join( ' ' );

			_nowplaying.host = config.get( 'remotehost' );

			_process = spawn( 'ssh', [
				_nowplaying.host,
				cmd
			] );

			log.success( i18n.__( 'Spawning %s on %s', cmd, _nowplaying.host ) );
		} else {
			_process = spawn( 'mplayer', [
				_nowplaying.uri,
				'-nomsgcolor',
				'-really-quiet'
			] );
		}

		if( _onPlay ) _onPlay.call(this, _nowplaying);

		_currentPID = _process.pid;

		_process.on( 'close', function( code ) {
			_process = null;
			this._notifyStop();
		}.bind(this));

		_process.stderr.on( 'data', function( d ) {
			//this._stderr.push( d.toString() );
			log.error( d.toString() );
		} );
		_process.stdout.on( 'data', function( d ) {
			//this._stdout.push( d.toString() );
			log.info( d.toString() );
		} );
	}

	this.stop = function() {
		if( _process ) {
			_process.removeAllListeners('close');
			_process.kill();
			_process = null;
		}
		this._notifyStop();
	}

	this._notifyStop = function() {
		if( _nowplaying != null ) {
			playlist.addHistory(_nowplaying);
		}

		if( _onStop ) _onStop.call(this, _nowplaying);
		_nowplaying = null;

		if( this.autoPlaying() ) {
			this.playNext();
		}
	}

	this.nowPlaying = function() {
		return _nowplaying;
	}
	
	this.setAutoPlaying = function(playing) {
		_autoplaying = playing;
		if( this.autoPlaying() &&
			this.nowPlaying() === null ) {
			this.playNext();
		}
	}

	this.autoPlaying = function() { return _autoplaying; }
	
	this.onPlay = function(cb) {
		_onPlay = cb;
	}
	
	this.onStop = function(cb) {
		_onStop = cb;
	}
}

module.exports = Player;

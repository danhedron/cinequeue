var assert = require( 'assert' );
var Playlist = require( '../components/playlist.js' );
var Player = require( '../components/player.js' );
var i18n = require( 'i18n' );

before( function () {
	console.log('before');
	i18n.configure( {
		locales: [ 'en' ],
		directory: __dirname + '/messages',
		defaultLocale: 'en',
		cookie: 'test',
		updateFiles: false
	} );
} );

/*
 * It doesn't matter that the file 'test' doesn't exist;
 * mplayer is a strong program.
 */
describe( 'Player', function () {
	describe( 'playNext()', function () {
		it( 'should affect nowPlaying()', function () {
			var p = new Playlist();
			var player = new Player( p );
			p.queue( {'uri': 'test'} );
			player.playNext();
			assert.equal( 0, p._queue.length );
			assert.equal( 'test', player.nowPlaying().uri );
		} );
		it( 'should remove items from queue', function () {
			var p = new Playlist();
			var player = new Player( p );
			p.queue( {'uri': 'test'} );
			player.playNext();
			assert.equal( 0, p._queue.length );
			assert.equal( 'test', player.nowPlaying().uri );
		} );
		it( 'should stop the current item', function () {
			var p = new Playlist();
			var player = new Player(p);
			p.queue( {'uri': 'test'} );
			player.playNext();
			assert.equal( 'test', player.nowPlaying().uri );
			player.playNext();
			assert.equal( null, player.nowPlaying() );
		} );
		it( 'should add to playlist history', function () {
			var p = new Playlist();
			var player = new Player( p );
			p.queue( {'uri': 'test'} );
			player.playNext();
			player.playNext();
			assert.equal( 'test', p._history[0].uri );
		} );
	} );
	describe( 'setAutoPlaying()', function () {
		it( 'should affect autoPlaying()', function () {
			var p = new Playlist();
			var player = new Player( p );
			assert.equal( false, player.autoPlaying() );
			player.setAutoPlaying( true );
			assert.equal( true, player.autoPlaying() );
		} );
		it( 'should start playing when true', function () {
			var p = new Playlist();
			var player = new Player( p );
			p.queue( {'uri': 'test'} );
			player.setAutoPlaying( true );
			assert.equal( 'test', player.nowPlaying().uri );
		} );
		it( 'should auto play on queue()', function () {
			var p = new Playlist();
			var player = new Player( p );
			player.setAutoPlaying( true );
			p.queue( {'uri': 'test'} );
			assert.equal( 'test', player.nowPlaying().uri );
		} );
	} );
	describe( 'onPlay()', function () {
		it( 'should set the play callback', function ( done ) {
			var p = new Playlist();
			p.queue( {'uri': 'test'} );
			var player = new Player( p );
			player.onPlay( function( i ) {
				assert.equal( 'test', i.uri );
				done();
			} );
			player.playNext();
		} );
	} );
	describe( 'onStop()', function () {
		it( 'should set the stop callback', function ( done ) {
			var p = new Playlist();
			p.queue( {'uri': 'test'} );
			var player = new Player( p );
			player.onStop( function ( i ) {
				assert.equal( 'test', i.uri );
				done();
			} );
			player.playNext();
		} );
	} );
	describe( 'metadata()', function() {
		// TODO write this test, and functionality
		it.skip( 'should return correct data', function( done ) {
			var p = new Playlist();
			var player = new Player( p );
			player.play( {
				'uri': 'test'
			} );
			setTimeout( function () {
				done();
			}, 500 );
		} );
	} );
	describe( 'status()', function() {
		it( 'should return progress', function( done ) {
			var p = new Playlist();
			var player = new Player( p );
			player.play( {
				'uri': 'note.ogg'
			} );

			assert.equal( 0, player.status().position );

			setTimeout( function () {
				assert.ok( player.status().position >= 1.0 );
				done();
			}, 1100 );
		} );
	} );
} );

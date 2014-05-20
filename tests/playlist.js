var assert = require( 'assert' );

var Playlist = require( '../components/playlist.js' );

describe( 'Playlist', function () {
	describe( 'Playlist()', function () {
		it( 'should initalize values', function () {
			var p = new Playlist();
			assert.equal( 0, p._queue.length );
			assert.equal( 0, p._history.length );
			assert.equal( null, p.next() );
		} );
	} );
	describe( 'queue()', function () {
		it( 'should enqueue an item', function () {
			var p = new Playlist();
			var testItem = {'uri':'test'};
			p.queue( testItem );
			assert.equal( 1, p._queue.length );
			assert.equal( testItem, p._queue[p._queue.length-1] );
		} );
	} );
	describe( 'popNext()', function () {
		it( 'should remove from the queue', function () {
			var p = new Playlist();
			p.queue( {'uri': 'test'} );
			p.queue( {'uri': 'test'} );
			assert.equal( 2, p._queue.length );
			p.popNext();
			assert.equal( 1, p._queue.length );
		} );
		it( 'should return the next item', function () {
			var p = new Playlist();
			p.queue( {'uri': 'test0'} );
			p.queue( {'uri': 'test1'} );
			assert.equal( 'test0', p.popNext().uri );
		} );
	} );
	describe( 'addHistory()', function () {
		it( 'should place an item into history', function () {
			var p = new Playlist();
			p.addHistory( {'uri':'test'} );
			assert.equal( 'test', p._history[0].uri );
		} );
		it( 'should remove history past the limit', function () {
			var p = new Playlist();
			p.addHistory( {'uri':'test0'} );
			p.addHistory( {'uri':'test1'} );
			p.addHistory( {'uri':'test2'} );
			p.addHistory( {'uri':'test3'} );
			p.addHistory( {'uri':'test4'} );
			p.addHistory( {'uri':'test5'} );
			assert.equal( 'test1', p._history[0].uri );
		} );
	} );
	describe( 'onQueue()', function () {
		it( 'should on queue callback', function () {
			var p = new Playlist();
			p.onQueue( function( i ) {
				assert.equal( 'test', i.uri );
			} );
			p.queue( {'uri': 'test'} );
		} );
	} );
} );

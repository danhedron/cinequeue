
var Playlist = function() {
	this._queue = [];
	this._history = [];

	this.historySize = 2;

	var _onQueue = null;

	this.next = function() {
		if( this._queue.length ) {
			return this._queue[0];
		}
		return null;
	}

	this.popNext = function() {
		if( this._queue.length ) {
			return this._queue.splice(0,1)[0];
		}
		return null;
	}

	this.queue = function(item) {
		this._queue.push(item);
		if( _onQueue !== null ) {
			_onQueue( item );
		}
	}

	this.addHistory = function(item) {
		this._history.push(item);
		if( this._history.length > this.historySize ) {
			this._history.splice( 0, 1 );
		}
	}

	this.onQueue = function(cb) {
		_onQueue = cb;
	}
}

module.exports = Playlist;

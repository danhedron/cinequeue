var playlist = {
	highlight: {
		last: null,
		now: false,
		highlight: function () {
			var id = location.hash.substr( 1 );
			if ( !id ) {
				return;
			}
			if ( playlist.highlight.last !== id ) {
				playlist.highlight.last = id;
				playlist.highlight.now = true;
			} else if ( !playlist.highlight.now ) {
				return;
			}
			try {
				console.log('d');
				var element = document.getElementById( id );
				element.className += ' highlighted';
				playlist.scrollToId( id );
				playlist.highlight.now = false;

			} catch ( e ) {
				if ( e.name !== 'TypeError' ) {
					console.error(e);
				}
			}
		}
	},
	updateQueue: function () {
		var req = new XMLHttpRequest();
		req.onload = function () {
			document.getElementById( 'queue' ).innerHTML = this.response;
			playlist.highlight.highlight();
		};
		req.open( 'GET', 'queue' );
		req.send();
		setTimeout( playlist.updateQueue, 1000 );
	},
	toggleFlash: function () { // might be worth doing this on every page?
		document.getElementById( 'messages' ).classList.toggle( 'closed' );
		playlist.timeout = true;
	},
	start: function () {
		playlist.updateQueue();
		setTimeout( playlist.toggleFlash, 2000 );
		if ( !location.hash ) {
			playlist.scrollToId();
		}
	},
	scrollToId: function ( id ) {
		if ( !id ) {
			id = 'nowplaying';
		}
		var el = document.getElementById( 'nowplaying' );
		if ( el ) {
			document.documentElement.scrollTop = el.offsetTop - window.innerHeight / 2;
			document.body.scrollTop = document.documentElement.scrollTop;
		}
	}

};
addOnloadHook( playlist.start );


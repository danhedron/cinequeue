var progressBar = {
	info: {},
	interval: {
		'get': 1000, /* time between syncs */
		'set': 10, /* time between updates */
	},
	getProgress: function () {
		var req = new XMLHttpRequest();
		req.onload = function () {
			progressBar.info = JSON.parse( this.response );
			progressBar.info.timestamp = Date.now();
			window.setTimeout( progressBar.getProgress, progressBar.interval.get );
		};
		req.open( 'GET', '/playlist/playing' );
		req.send();
	},
	updateBar: function () {
		var np = document.getElementById( 'playing' );
		if ( np ) {
			// wipe contents; TODO: reuse instead of replace
			np.innerHTML = '';

			if ( typeof progressBar.info.uri !== 'undefined'  ) {
				var title = document.createElement( 'a' );
				title.setAttribute( 'href', progressBar.info.uri );
				title.innerHTML = decodeURI( progressBar.info.uri ).split( '/' ).pop();
				if ( progressBar.info.md.vid ) {
					if ( progressBar.info.md.vid[0].name ) {
						title.innerHTML =  progressBar.info.md.vid[0].name;
					}
				}

				var bar = document.createElement( 'div' );
				bar.className = 'bar';

				var prog = document.createElement( 'div' );
				prog.className = 'progress';
				var then = new Date( progressBar.info.timestamp );
				var secondsElapsed = ( Date.now() - then.getTime() );

				secondsElapsed += progressBar.info.pos * 1000;
				var perc = ( ( secondsElapsed / ( progressBar.info.md.length * 1000 ) ) * 100 );
				if ( perc > 100 ) {
					perc = 100;
				}
				prog.style.width = perc + '%';
				prog.style.opacity = 0.75+(perc/400);

				bar.appendChild( prog );
				np.appendChild( bar );

				var time = {
					'elapsed': progressBar.toHms( secondsElapsed / 1000 ),
					'remaining': progressBar.toHms( progressBar.info.md.length - ( secondsElapsed/1000 ) ),
					'percentage': perc ? perc.toFixed( 1 ) + '%' : ''
				};


				for ( var t in time ) {
					var element = document.createElement( 'span' );
					element.innerHTML = time[t];
					element.className = t;
					np.appendChild( element );
				}


				np.appendChild( title );
			}
		}
		window.setTimeout( progressBar.updateBar, progressBar.interval.set );
	},
	fire: function () {
		progressBar.getProgress();
		window.setTimeout( progressBar.getProgress, progressBar.interval.get);
		window.setTimeout( progressBar.updateBar, progressBar.interval.set);
	},
	toHms: function ( ts ) {
		if ( ts < 0 || !ts ) {
			return '';
		}
		var h = parseInt( ts / 3600 ) % 24;
		h = h ? h : '';
		var m = parseInt( ts / 60 ) % 60;
		m = m < 10 ? '0' + m : m;
		var s = ts % 60;
		s = s.toFixed( 1 );
		s = parseInt( s ) < 10 ? ':0' + s : ':' + s;
		return h + m + s;
	}
};
addOnloadHook( progressBar.fire );

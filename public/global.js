var progressBar = {
	info: {},
	interval: {
		'get': -1,
		'set': 1,
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
				title.innerHTML =  progressBar.info.uri;
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
				prog.style.width = perc + '%';
				prog.style.opacity = perc;

				bar.appendChild( prog );
				np.appendChild( bar );

				var time = {
					'elapsed': progressBar.toHms( secondsElapsed / 1000 ),
					'remaining': progressBar.toHms( progressBar.info.md.length - ( secondsElapsed/1000 ) ),
					'percentage': parseFloat( prog.style.width ).toFixed( 1 ) + '%'
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
progressBar.fire();

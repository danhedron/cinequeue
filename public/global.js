var progressBar = {
	info: {},
	interval: {
		'get': -1,
		'set': 1,
	},
	getProgress: function () {
		var req = new XMLHttpRequest();
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

			if ( typeof progressBar.info.uri != 'undefined'  ) {
				var title = document.createElement( 'a' );
				title.setAttribute( 'href', progressBar.info.uri );
				if ( progressBar.info.md['ID_VID_0_NAME'] ) {
					title.innerHTML = progressBar.info.md['ID_VID_0_NAME'];
				} else {
					title.innerHTML =  progressBar.info.uri;
				}

				var bar = document.createElement( 'div' );
				bar.className = 'bar';

				var prog = document.createElement( 'div' );
				prog.className = 'progress';
				var then = new Date( progressBar.info.timestamp );
				var secondsElapsed = ( Date.now() - then.getTime() )

				secondsElapsed += progressBar.info.pos * 1000;
				prog.style.width = ( ( secondsElapsed / ( progressBar.info.max * 1000 ) ) * 100 ) + '%';

				bar.appendChild( prog );
				np.appendChild( bar );

				var time = {
					'elapsed': (secondsElapsed/1000).toFixed(1),
					'remaining': (progressBar.info.max - (secondsElapsed/1000)).toFixed( 1 ),
					'percentage': parseFloat( prog.style.width ).toFixed(1) + '%'
				}


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
	}
}
progressBar.fire();

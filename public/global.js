var progressBar = {
	info: {},
	interval: {
		'get': 1000, /* time between syncs */
		'set': 1, /* time between updates */
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
				var info = progressBar.info;
				var bar = document.createElement( 'div' );
				bar.className = 'bar';

				var prog = document.createElement( 'div' );
				prog.className = 'progress';
				var then = new Date( info.timestamp );
				var secondsElapsed = ( Date.now() - then.getTime() );

				secondsElapsed += Math.max( info.status.position.audio, info.status.position.video ) * 1000;
				if ( info.status.position.audio && info.status.position.video ) {
					if ( info.status.position.audio !== info.status.position.video ) {
						var slow = document.createElement( 'div' );
						var offset = Math.abs( info.status.position.audio - info.status.position.video );
						slow.className = 'slow';
						offset = Math.round( offset ) ? Math.round( offset ) + ' seconds' : '';
						slow.innerHTML = 'Warning: Audio is ' + offset + ' out of sync with video'; // TODO i18n
						np.appendChild( slow );
					}
				}
				var perc = ( ( secondsElapsed / ( info.md.length * 1000 ) ) * 100 );
				if ( perc > 100 ) {
					perc = 100;
				}
				prog.style.width = perc + '%';
				prog.style.opacity = 0.75+(perc/400);

				bar.appendChild( prog );
				np.appendChild( bar );

				var time = {
					'elapsed': progressBar.toHms( secondsElapsed / 1000 ),
					'remaining': progressBar.toHms( info.md.length - ( secondsElapsed/1000 ) ),
					'percentage': perc ? perc.toFixed( 1 ) + '%' : '',
					'title': progressBar.parseTitle()
				};
				if ( info.status.position.video + info.status.position.audio ) {
					window.document.title = time.title ? '▶ ' + time.title : '▷ Cinequeue'; // TODO: i18n
				} else {
					// something is playing but no position, so probably loading
					window.document.title = '○ Cinequeue'; // TODO: i18n
				}
				if ( !time.title ) {
					time.title = '&nbsp;';
				}

				for ( var t in time ) {
					var element = document.createElement( 'span' );
					element.innerHTML = time[t];
					element.className = t;
					np.appendChild( element );
				}

				np.appendChild( progressBar.parseMetadata() );
			}
		} else {
			window.document.title = '■ Cinequeue'; // TODO: i18n
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
		s = Math.floor( s );
		s = parseInt( s ) < 10 ? ':0' + s : ':' + s;
		return h + m + s;
	},
	parseMetadata: function ( data ) {
		if ( !data && progressBar.info.md.clip ) {
			data = progressBar.info.md.clip.info;
		}
		var tbl = document.createElement( 'table' );
		tbl.id = 'metadata';
		for ( var key in data ) {
			var row = document.createElement( 'tr' );

			var cell = document.createElement( 'td' );
			cell.innerHTML = key;
			row.appendChild( cell );

			cell = document.createElement( 'td' );
			cell.innerHTML = data[key];
			row.appendChild( cell );

			tbl.appendChild( row );
		}
		return tbl;
	},
	parseTitle: function () {
		var md = progressBar.info.md;
		if ( md.clip && md.clip.info ) {
			if ( md.clip.info.Title ) {
				if ( md.clip.info.Title.length > 20 ) {
					return md.clip.info.Title;
				} else if ( md.clip.info.Artist ) {
					return md.clip.info.Title + ' · ' + md.clip.info.Artist;
				}
			}
		} else if ( md.vid && md.vid[0] && md.vid[0].name ) {
			return md.vid[0].name;
		} else if ( md.filename ) {
			var fn = decodeURI( md.filename );
			return fn.split('/').pop().replace(/\.[^/.]+$/, '').replace(/\d+ */g,'');
		}
		return null;
	}
};
addOnloadHook( progressBar.fire );

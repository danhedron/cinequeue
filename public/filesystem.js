var fs = {
	selectAll: function () {
		var cb = document.getElementsByTagName( 'input' );
		for ( var i = 0; i < cb.length; i++ ) {
			if ( cb[i].type === 'checkbox' ) {
				cb[i].checked = cb[i].checked ? false : true;
			}
		}
		fs.countBoxes();
	},
	countBoxes: function () {
		var cb = document.getElementsByTagName( 'input' );
		var count = 0;
		for ( var i = 0; i < cb.length; i++ ) {
			if ( cb[i].type === 'checkbox' ) {
				if ( cb[i].checked ) {
					count++;
				}
			}
		}
		var btn = document.getElementById( 'queuebtn' );
		btn.innerHTML = 'Queue ' + count + ' files'; // TODO: i18n
		if ( !count ) {
			btn.className += ' muted';
		} else {
			btn.className = btn.className.replace( /\bmuted\b/g, '' );
		}
	},
	init: function () {
		// load in js because there's no noscript fallback
		var form = document.getElementById( 'directory' );
		if ( !form ) {
			return;
		}
		var cb = document.getElementsByTagName( 'input' );
		var cont = false;
		for ( var i = 0; i < cb.length; i++ ) {
			if ( cb[i].type === 'checkbox' ) {
				cont = true;
				console.log( cont );
				cb[i].addEventListener('change', fs.countBoxes );
				cb[i].addEventListener('onfocus', fs.countBoxes );
			}
		}
		var btns = document.getElementById( 'queuebuttons' );
		if ( cont ) {
			var a = document.createElement( 'button' );
			a.href = '#queuebtn';
			a.innerHTML = 'Invert selection'; // TODO i18n
			a.className = 'button';
			a.addEventListener( 'click', fs.selectAll );
			btns.appendChild( a );
			fs.countBoxes();
		} else {
			btns.className += ' hidden';
		}
	}
};

addOnloadHook( fs.init );

var fs = {
	selectAll: function () {
		var cb = document.getElementsByTagName( 'input' );
		for ( var i = 0; i < cb.length; i++ ) {
			if ( cb[i].type === 'checkbox' ) {
				cb[i].checked = cb[i].checked ? false : true;
			}
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
				break;
			}
		}
		if ( cont ) {
			var a = document.createElement( 'a' );
			a.href = '#';
			a.innerHTML = 'Invert selection'; // TODO i18n
			a.addEventListener( 'click', fs.selectAll );
			form.appendChild( a );
		}
	}
};

addOnloadHook( fs.init );

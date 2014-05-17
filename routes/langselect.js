var app = require('../server.js');


app.get('/lang', function ( req, res ) {
	res.render( 'langselect', {
		currLang: res.getLocale()
	});
})
app.get('/lang/:lang', function (req, res ) {
	if ( req.params.lang ) {
		res.cookie('cinequeue-locale', req.params.lang, {
			maxAge: 90000,
			httpOnly: true
		})
		res.redirect('/');
	} else {
		res.redirect('/lang');
	}
})

var app = require( '..' );
var config = require( '../config' );
var languages = require( 'languages' );
var i18n = require( 'i18n' );

app.get( '/babel/', function ( req, res ) {
	var catalog = i18n.getCatalog();
	var langs = [];
	for ( var lang in catalog ) {
		var curr = languages.getLanguageInfo( lang );
		curr.code = lang;
		langs.push( curr );
	}
	res.render( 'langselect', {
		currentLang: res.getLocale(),
		langs: langs
	} );
} );

app.get( '/babel/:code', function ( req, res ) {
	var code = req.params.code;
	if ( !languages.isValid( code ) ) {
		req.flash( 'err', res.__( 'The language you selected was not a valid ISO code.' ) );
		res.redirect( '/babel/' );
	} else {
		var lang = languages.getLanguageInfo( code );
		if ( i18n.getCatalog( code ) ) {
			req.flash( 'success', res.__( 'Successfully set language to %s (%s).', lang.nativeName, lang.name ) );
		} else {
			req.flash( 'warn', res.__( '%s (%s) is currently unsupported.', lang.nativeName, lang.name ) );
		}
		res.cookie( config.get( 'i18n-cookie' ), code, {
			maxAge: 90000,
			httpOnly: true
		} );
		res.redirect( '/' );
	}
} );

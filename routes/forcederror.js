var app = require( '..' );
var i18n = require( 'i18n' );

app.get( '/error' , function ( req, res ) {
	throw i18n.__( 'Manually thrown error for testing purposes' );
} )

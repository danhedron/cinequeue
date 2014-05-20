var app = require( '..' );

app.get( '/', function ( req, res ) {
	res.redirect( '/playlist' );
} );

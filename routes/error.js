var log = require( 'colog' );
var app = require( '..' );
var i18n = require( 'i18n' ); // needed for console messages
app.use( function ( req, res ) {
	res.status( 404 );
	res.render( 'notfound' );
} );

app.use( function ( err, req, res, next ) {
	log.headerError( i18n.__( 'Error encountered when rendering %s' , req.url ) );
	log.error( err.stack );

	res.status( 500 );
	res.render( 'servererror', {
		err: err
	} );
	next;
} );

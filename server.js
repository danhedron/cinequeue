var config = require( './config' );
var colog = require( 'colog' );
var i18n = require( 'i18n' );

var flash = require( 'express-flash' );
var cookieParser = require( 'cookie-parser' );
var session = require( 'express-session' );
var bodyParser = require( 'body-parser' );

var express = require( 'express' );
var app = module.exports = express();

app.use( express.static( __dirname + '/public' ) );
app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'jade' );

i18n.configure( {
	locales: [ 'en' ],
	directory: __dirname + '/messages',
	defaultLocale:'en',
	cookie: config.get( 'i18n-cookie' )
} );

app.use( i18n.init );

app.use( cookieParser( config.get( 'secret' ) ) );
app.use( bodyParser.urlencoded() );
app.use( session( {
	cookie: {
		maxAge: 60000
	}
} ) );

app.use( flash() );

app.set( 'strict routing', true );

// http://stackoverflow.com/a/13443359
app.use( function ( req, res, next ) {
	if( req.url.substr(-1) !== '/' ) {
	   res.redirect(301, req.url + '/' );
	} else {
		next();
	}
});

app.locals.pretty = true;

var routes = require( './routes' );

app.listen( config.get( 'port' ) );
colog.success( i18n.__( 'Listening on port %d', config.get( 'port' ) ) );


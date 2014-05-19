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

app.use( flash() );

app.use( cookieParser( config.get( 'secret' ) ) );
app.use( bodyParser.urlencoded() );

app.use( session( {
	cookie: {
		maxAge: 90000
	}
} ) );

app.set( 'strict routing', true );

// add trailing slashes
// http://stackoverflow.com/a/13443359
app.use( function ( req, res, next ) {
	if( req.url.substr(-1) !== '/' ) {
	   res.redirect(301, req.url + '/' );
	} else {
		next();
	}
});

// pretty print jade
app.locals.pretty = true;

var messages = require( './messages' ); // load i18n
var routes = require( './routes' );

app.listen( config.get( 'port' ) );
colog.success( i18n.__( 'Listening on port %d', config.get( 'port' ) ) );

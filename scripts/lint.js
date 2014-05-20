/*
 * runs jshint on staged files
 */
var exec = require( 'execSync' ).exec;
var log = require( 'colog' );
var buffer = [];
var interactive = false;

var git = 'git diff-index --name-only --staged HEAD --';
git = exec( git );

if ( !git.code ) {
	var files = git.stdout.split( '\n' );
	for ( var i = 0; i < files.length; i++ ) {
		if ( ( files[i].indexOf( '.js', files[i].length - 3 ) ) !== -1 ) {
			buffer = buffer.concat( exec( 'jshint ' + files[i] ).stdout.split( '\n' )  );
		}
	}
	if ( buffer.length > 1 ) {
		buffer = buffer.join( '\n' );
		log.headerWarning( 'Lint failed.' );
		log.warning( buffer );

		if ( interactive ) {
			// this was intended for the pre-commit hook, but it abstracts the
			// output away unless there's an error, so the prompt will just hang
			var rl = readline.createInterface( {
				input: process.stdin,
				output: process.stdout
			} );
			rl.question( log.cyan( 'Continue? [y/N]' )  , function ( answer ) {
				if ( answer.toUpperCase().substr(0) === 'Y' ) {
					log.answer( 'Continuing.' );
					process.exit( 0 );
				} else {
					log.answer( 'Cancelling.' );
					process.exit( 1 );
				}
			} );
		}
		process.exit( 1 );
	} else {
		log.success( 'Lint successful!' );
		process.exit( 0 );
	}
}

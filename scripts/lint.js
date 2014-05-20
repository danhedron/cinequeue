/*
 * runs jshint on staged files
 */
var exec = require( 'execSync' ).exec;
var log = require( 'colog' );
var buffer = [];

var git = 'git diff-index --name-only --cached HEAD --';
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

		/*
		var rl = readline.createInterface( {
			input: process.stdin,
			output: process.stdout
		} );
		rl.question( log.cyan( 'Continue? [y/N]' )  , function ( answer ) {
			if ( answer.toUpperCase().substr(0) == 'Y' ) {
				log.answer( 'Continuing.' );
				process.exit( 0 );
			} else {
				log.answer( 'Cancelling.' );
				process.exit( 1 );
			}
		} );
		*/
		process.exit( 1 );
	} else {
		log.success( 'Lint successful!' );
		process.exit( 0 );
	}
}

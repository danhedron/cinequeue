/*
 * runs jshint on staged files
 */
var log = require( 'colog' );
var buffer = [];
var interactive = false;
var git = require( './git');

try {
	var exec = require( 'execSync' ).exec; // TODO use fs.exec instea
} catch ( e ) {
	// execSync is not a dependency in package.json
	// so most contributors won't have it
	log.info( 'Unable to lint.' );
	process.exit( 0 ); // although an error, we want to continue
}

git.getStaged( function ( error, files ) {
	if ( !files ) {
		log.error( 'Unable to load staged files. ' );
		process.exit( 1 );
	}
	for ( var i = 0; i < files.length; i++ ) {
		if ( ( files[i].indexOf( '.js', files[i].length - 3 ) ) !== -1 ) {
			buffer = buffer.concat( exec( 'jshint ' + files[i] ).stdout.split( '\n' )  );
		}
	}
	// filter out empty values
	buffer = buffer.filter( function ( e ) {
		return ( e );
	} );

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
				if ( answer.toUpperCase().substr( 0 ) === 'Y' ) {
					log.answer( 'Continuing.' );
					process.exit( 0 );
				} else {
					log.answer( 'Cancelling.' );
					process.exit( 1 );
				}
			} );
		}
		log.info( 'Use git commit -n to bypass this check.' );
		process.exit( 1 );
	} else {
		log.success( 'Lint successful!' );
		process.exit( 0 );
	}
} );

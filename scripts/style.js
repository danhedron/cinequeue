var fs = require( 'fs' );
var log = require( 'colog' );
var git = require( './git' );
var pass = true;
var regex = /\([^ ]+\)/;

git.getStaged( function ( error, files ) {
	for ( var i = 0; i < files.length; i++ ) {
		console.log( files[i] );
		if ( ( files[i].indexOf( '.js', files[i].length - 3 ) ) !== -1 ) {
			var contents = fs.readFileSync( files[i] ).toString();
			if ( contents.match( regex ) ) {
				log.warning( 'Possibly badly formed code. Verifying.' );
				contents = contents.split( '\n' );
				for ( var j = 0; j < contents.length; j++ ) {
					if ( contents[j].match( regex ) ) {
						pass = false;
						log.error( 'Badly formed parentheses in ' +  files[i] + ' on line ' + ( j + 1 ) );
						log.warning( '\t' + contents[j] );
					}
				}
			}
		}
	}
	if ( pass ) {
		log.success( 'No bad parentheses found.' );
		process.exit( 0 );
	} else {
		log.warning( 'Bad parentheses.' );
		process.exit( 1 );
	}
} );

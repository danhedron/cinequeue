var fs = require( 'fs' );
var log = require( 'colog' );
var git = require( './git' );
var pass = true;
var regex = /\(([^ ].*|[& ])\)/;

git.getStaged( function ( error, files ) {
	for ( var i = 0; i < files.length; i++ ) {
		console.log( files[i] );
		if ( ( files[i].indexOf( '.js', files[i].length - 3 ) ) !== -1 ) {
			var contents = fs.readFileSync( files[i] ).toString();
			if ( contents.match( regex ) ) {
				pass = false;
				contents = contents.split( '\n' );
				for ( var j = 0; j < contents.length; j++ ) {
					if ( contents[j].match( regex ) ) {
						console.log('X' + contents[j].match( regex ) );
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
		process.exit( 1 );
	}
} );

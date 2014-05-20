var exec = require( 'child_process' ).exec;

module.exports = {
	getStaged: function ( cb ) {
		var git = 'git diff-index --name-only --cached HEAD --';
		exec( git,
				function ( error, stdout ) {
					cb( error, stdout.split( '\n' ) );
				} );
	}
};

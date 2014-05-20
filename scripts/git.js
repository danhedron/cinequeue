var exec = require( 'execSync' ).exec;

module.exports = {
	getStaged: function () {
		var git = 'git diff-index --name-only --cached HEAD --';
		git = exec( git );
		if ( !git.code ) {
			return git.stdout.split( '\n' );
		} else {
			return null;
		}
	}
};

var convict = require( 'convict' );
var colog = require( 'colog' );

var conf = convict( {
	port: {
		doc: 'The port to bind.',
		format: 'port',
		default: 3000,
		env: 'PORT'
	},
	secret: {
		doc: 'A secret string used to generate cookies.',
		format: String,
		default: 'They dined on mince, and slices of quince, which they ate with a runcible spoon',
	    env: 'SECRET'
	},
	'i18n-cookie': {
		doc: 'The name of the cookie storing the current language.',
		format: String,
		default: 'cinequeue-locale',
		env: 'I18NCOOKIE'
	},
	allowfs: {
		doc: 'Whether access to the file system by the end user is allowed.',
		format: Boolean,
		default: false,
		env: 'ALLOWFS'
	},
	fspath: {
		doc: 'The file path to the files to be accessible to the end user.',
		format: String,
		default: '~',
		env: 'FSPATH'
	},
	allowplaylist: {
		doc: 'Whether to allow users to view the playlist.',
		format: Boolean,
		default: true,
		env: 'ALLOWPL'
	},
	allowkill: {
		doc: 'Whether to allow users to kill the program via the interface.',
		format: Boolean,
		default: false,
		env: 'ALLOWKILL'
	},
	playremote: {
		doc: 'Whether to play files remotely via SSH.',
		format: Boolean,
		default: false,
		env: 'REMOTEPLAY'
	},
	language: {
		doc: 'The default language. Should be an ISO 639 code.',
		format: String, // regex should be here
		default: 'en',
		env: 'LANG'
	},
	fsurl: {
		doc: 'The base URL for the file system.',
		format: 'url',
		default: 'http://127.0.0.1',
		env: 'URL'
	},
	display: {
		doc: 'The display to spawn the player on.',
		format: String,
		default: ':0',
		env: 'DISPLAY'
	},
	remotehost: {
		doc: 'If remote playing is on, the user/host string of the remote host.',
		format: String,
		default: 'media@localhost',
		env: 'REMOTEHOST'
	},
	allowfsdl: {
		doc: 'Whether to allow serving of files directly through the node.js app.',
		format: Boolean,
		default: true,
		env: 'ALLOWSERV'
	}
} );

try {
	conf.loadFile( 'config.json' );
	colog.success( 'Loaded configuration from config.json' );
} catch ( e ) {
	colog.warning( 'Unable to load configuration file.' );
	colog.info( 'Using default configuration settings.' );
	colog.info( 'Create config.json to change from the defaults.' );
}

try {
	conf.validate();
	colog.success( 'Configuration validated.' );
} catch ( e ) {
	colog.headerError( 'Bad configuration loaded' )
	colog.error( e );
	process.exit( 1 );
}

if ( conf.get( 'secret' ) == conf.default( 'secret' ) ) {
	colog.warning( 'Using default secret!' );
}

module.exports = conf;

var convict = require( 'convict' );
var colog = require( 'colog' );

var conf = convict( {
	web: {
		port: {
			doc: 'The port to bind.',
			format: 'port',
			default: 3000,
			env: 'PORT'
		},
		secret: {
			doc: 'A secret string used to generate cookies.',
			format: String,
			default: Math.random().toString(36),
			env: 'SECRET'
		},
		'i18n-cookie': {
			doc: 'The name of the cookie storing the current language.',
			format: String,
			default: 'cinequeue-locale',
			env: 'I18NCOOKIE'
		},
		language: {
			doc: 'The default language. Should be an ISO 639 code.',
			format: String, // regex should be here
			default: 'en',
			env: 'LANG'
		}
	},
	fs: {
		allow: {
			doc: 'Whether access to the file system by the end user is allowed.',
			format: Boolean,
			default: false,
			env: 'ALLOWFS'
		},
		path: {
			doc: 'The file path to the files to be accessible to the end user.',
			format: String,
			default: '~',
			env: 'FSPATH'
		},
		url: {
			doc: 'The base URL for the file system.',
			format: 'url',
			default: 'http://127.0.0.1',
			env: 'URL'
		},
		serve: {
			doc: 'Whether to allow serving of files directly through the node.js app.',
			format: Boolean,
			default: true,
			env: 'ALLOWSERV'
		},
	},
	playlist: {
		allow: {
			doc: 'Whether to allow users to view the playlist.',
			format: Boolean,
			default: true,
			env: 'ALLOWPL'
		},
		histsize: {
			doc: 'The number of past files to display in the playlist.',
			format: Number,
			default: 5,
			env: 'PLAYLISTSIZE'
		}
	},
	player: {
		kill: {
			doc: 'Whether to allow users to kill the program via the interface.',
			format: Boolean,
			default: false,
			env: 'ALLOWKILL'
		},
		remote: {
			doc: 'Whether to play files remotely via SSH.',
			format: Boolean,
			default: false,
			env: 'REMOTEPLAY'
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
		quiet: {
			doc: 'If enabled, output from mplayer stdout and stderr is not printed.',
			format: Boolean,
			default: false,
			env: 'QUIETMPLAYER'
		}
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
	colog.headerError( 'Bad configuration loaded' );
	colog.error( e );
	process.exit( 1 );
}

if ( conf.get( 'web.secret' ) === conf.default( 'web.secret' ) ) {
	colog.warning( 'Using default secret!' );
}

module.exports = conf;

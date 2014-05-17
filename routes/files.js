var app = require( '../server.js' );
var child_process = require('child_process');
var fs = require( 'fs' );
app.get( '/fs/*', function ( req, res ) {
	var path = '/home/share/media/' + req.params[0];
	fs.stat( path, function ( err, stats ) {
		if ( err ) {
			res.render( 'error', {
				msg: res.__( 'fs-nostats-' + err.code.toLowerCase() ),
				err: err
			} );
		} else {
			if ( stats.isDirectory() ) {
                if ( path.substr( path.length - 1 ) !== '/' ) {
                    res.redirect('/fs/' + req.params[0] + '/');
                    return;
                }
				fs.readdir( path, function ( err, files ) {
					if ( err ) {
						res.render('error',{err:err});
					}
					res.render( 'fs', {
						path: req.params[0],
						files: files,
						output: stats
					} );
				} )
			} else if ( !stats.isFile() ) {
				res.send( 404 );
				res.render( 'error', {
					msg: res.__( 'fs-badfile' )
				} );
			} else {
				var fhan = child_process.spawn( 'file', [ path ] );
				var data = '';
				fhan.stdout.on( 'data', function ( d ) {
					data += d;
				} );
				fhan.on( 'close', function ( code ) {
					var mplayer = child_process.spawn( 'mplayer', [ path ,
						'-nosound', // disable playing
						'-novideo', // of anything at all
						'-really-quiet', // suppress normal console output
						'-identify', // output metadata
						'-nomsgcolor' // no colors
					] );
					var metadata = '';
					mplayer.stdout.on( 'data', function ( d ) {
						metadata += d;
					} );
					mplayer.on( 'close', function ( code ) {
						metadata = metadata.split( '\n' );
						var info = {};
						for ( entry in metadata ) {
							if ( entry ) { // suppress empties
								var tmp = metadata[entry].split( '=' );
								info[tmp[0]] = tmp[1];
								tmp = null;
							}
						}
						res.render( 'fs', {
							path: req.params[0],
							output: stats,
							filetype: data,
							mplayer: info
						} );
					} );
				} );
			}
		}
	})
});

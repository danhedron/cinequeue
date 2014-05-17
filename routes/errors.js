var app = require('../server.js');
app.get('/error', function(req, res) {
	throw new Error('forced error');
})
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('error', {
		err: err,
		msg: 'Something broke!'
	});
})

/* this should always be called last */
app.use(function(req, res, next) {
	res.status(404);
	res.render('error', {
		msg: 'Not found!'
	});
});

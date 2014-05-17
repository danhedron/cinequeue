var app = require('../server.js');
app.get('/', function(req, res) {
	res.redirect('/queue');
});

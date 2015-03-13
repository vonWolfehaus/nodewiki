var connect = require('connect'),
	serveStatic = require('serve-static'),
	argv = require('minimist')(process.argv.slice(2)),
	port = argv.p || 8080;

var app = connect();
console.log(__dirname);
app.use(serveStatic(__dirname + '/../', {index: 'login.html'}));

app.listen(port, '0.0.0.0');

console.log('Started server at http://localhost:' + port);

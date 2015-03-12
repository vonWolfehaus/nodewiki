#!/usr/bin/env node

var fs = require('fs');
var http = require('http');
var path = require('path');
var connect = require('connect');
var socketio = require('socket.io');
// var mod_getopt = require('posix-getopt');
var compression = require('compression');
var serveStatic = require('serve-static');

var mdserver = require('./mdserver');
var getDir = require('./getDir');

// Defaults
var portNumber = process.env.PORT || 8888;
var app = connect();

/*
	Middleware
 */

app.use(compression()); // gzip/deflate outgoing responses
app.use(serveStatic('../client'));

/*
	Create server
 */

var server = http.createServer(app);
var io = socketio(server);

var allFiles = null;

io.sockets.on('connection', function (socket) {
	var currentPath = process.cwd() + '/';
	var dir = getDir.getDir(currentPath);
	var links = getDir.parseLinks(dir);
	var directoryDepth = 0;
	var dirFolders = []; // array to hold the names of all folders in current directory
	
	/*dir.forEach(function(i) {
		if (i.folder == true) {
			dirFolders.push(i.name);
		}
	});
	socket.emit('navLinks', {links: links});
	
	allFiles = getDir.getAllFiles(currentPath);
	console.log(allFiles);*/
	
	socket.on('readFile', function (file) {
		console.log('readFile received - ' + file.name);
		if (dirFolders.indexOf (file.name) > -1) { // checks if request is in the dirFolders array (meaning that the request is for a folder)
			currentPath += file.name;
			refreshDir();
			directoryDepth += 1;
			links = getDir.parseLinks(dir, directoryDepth);
			mdserver.readFolder(links, socket);
		} else {
			mdserver.sendFile(file, currentPath, socket);
		}
	});

	socket.on('disconnect', function() {
		// if a user disconnects, reset variables
		currentPath = process.cwd() + '/';
		refreshDir();
		links = getDir.parseLinks(dir);
		directoryDepth = 0;
	});

	socket.on('saveFile', function (file) {
		console.log('saveFile received, file: ' + file.name);
		mdserver.saveFile(file, currentPath, socket);
	});

	socket.on('goBackFolder', function() {
		if (directoryDepth > 0) {
			currentPath = currentPath.substr(0, currentPath.substr(0, currentPath.length - 1).lastIndexOf ('/')) + '/'; // removes current directory form the currentPath variable
			refreshDir();
			directoryDepth -= 1;
			links = getDir.parseLinks(dir, directoryDepth);
			mdserver.readFolder(links, socket);
		}
	})

	socket.on('refreshNav', function() {
		refreshNavLinks();
	});

	socket.on('newFolder', function(folderName) {
		fs.mkdir(currentPath + folderName, 0777, function(err) {
			if (err) {
				socket.emit('newFolderReply', err);
			} else {
				refreshNavLinks();
			}
		});
	});
	
	// for each file within root directory, if it doesn't exist then throw it back at the socket to deal with
	socket.on('validateLinks', function(internalLinks) {
		var i, j, found, linkPath, fileName;
		var missingLinks = [];
		
		for (i = 0; i < internalLinks.length; i++) {
			linkPath = path.resolve(internalLinks[i]);
			// console.log('[server on validateLinks] Checking '+linkPath);
			if (!fs.existsSync(linkPath)) {
				missingLinks.push(internalLinks[i]);
				// console.log('[server on validateLinks] Did not exist');
			} //else console.log('[server on validateLinks] Found);
		}
		socket.emit('validateLinksReply', {links: missingLinks});
	});

	function refreshNavLinks() {
		refreshDir();
		links = getDir.parseLinks(dir, directoryDepth);
		socket.emit('navLinks', {links: links});
	}

	function refreshDir() {
		dir = getDir.getDir(currentPath);
		if (typeof dir != 'undefined') {
			dir.forEach(function(i) {
				if (i.folder == true) {
					dirFolders.push(i.name);
				}
			});
		}
	}

});

/*
	Start server
 */

server.listen(portNumber, function() {
	console.log('Server started, listening on ' + portNumber);
});

module.exports = app;

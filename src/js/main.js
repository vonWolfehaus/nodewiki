var riot = require('riot');
var utils = require('utils');

var NavDir = require('nav-dir.tag');

// todo: listen for the global even of that button press (when the user submits a repo to get)
utils.ajax('GET', 'https://dl.dropboxusercontent.com/u/36067312/von-component.json').then(ajaxSuccess, ajaxFail);

function ajaxSuccess(res) {
	var repo = JSON.parse(res);
	if (repo.truncated) {
		// humane.log('The repository is too big, so only part of it is displayed.');
	}
	
	var repoParts = repo.url.split('/');
	var repoName = repoParts[repoParts.length-4];
	
	riot.mount('nav-dir', {name: repoName, repo: repo});
}

function ajaxFail(err) {
	console.log(err);
}

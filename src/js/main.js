var riot = require('riot');
var utils = require('utils');
var riotcontrol = require('riotcontrol');
var humane = require('humane-js');

var LocalStore = require('LocalStore');
var StoreRouter = require('StoreRouter');
var RemoteStore = require('RemoteStore');

var NavDir = require('nav-dir.tag');
var FileView = require('file-view.tag');
var ContentHeader = require('content-header.tag');

riotcontrol.addStore(new StoreRouter());
riotcontrol.addStore(new LocalStore());
riotcontrol.addStore(new RemoteStore());

riot.mount('file-view');
riot.mount('content-header');

// todo: listen for the global even of that button press (when the user submits a repo to get)
utils.ajax('GET', 'https://dl.dropboxusercontent.com/u/36067312/von-component.json').then(ajaxSuccess, ajaxFail);

function ajaxSuccess(res) {
	var repo = JSON.parse(res);
	if (repo.truncated) {
		console.warn('The repository is too big, so only part of it is displayed.');
	}
	
	var repoParts = repo.url.split('/');
	var repoName = repoParts[repoParts.length-4];
	
	riot.mount('nav-dir', {name: repoName, repo: repo});
	// riotcontrol.trigger('', repo);	
}

function ajaxFail(err) {
	console.log(err);
}

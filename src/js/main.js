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
// riotcontrol.addStore(new LocalStore());
riotcontrol.addStore(new RemoteStore());

riot.mount('*');

function ajaxSuccess(res) {
	var repo = JSON.parse(res);
	if (repo.truncated) {
		console.warn('The repository is too big, so only part of it is displayed.');
	}
	
	riotcontrol.trigger('render-repo', repo);	
}

function ajaxFail(err) {
	console.log(err);
}

riotcontrol.on('ui-submit', function(url) {
	url = url || 'https://dl.dropboxusercontent.com/u/36067312/von-component.json';
	utils.ajax('GET', url).then(ajaxSuccess, ajaxFail);
});

var riot = require('riot');
var humane = require('humane-js');

var utils = require('utils');
var riotcontrol = require('riotcontrol');

// Manages our item data locally, for now.
function RemoteStore() {  
	riot.observable(this);
	
	this.on('remote-load', function(item) {
		console.info('Loading '+item.name);
		
		utils.ajax('GET', item.url).then(function (res) {
			var json = JSON.parse(res);
			var content = window.atob(json.content);
			console.info('Loaded '+item.name);
			riotcontrol.trigger('render-md', content);
		},
		function (err) {
			console.warn(err);
		});
	}.bind(this));

	// Search our item collection.
	/*this.on('item_list_search', function(txt) {
		var list = this.items;
		if (txt.length > 0) {
			list = this.items.filter(function(el) {
				if (el.title.toLowerCase().search(new RegExp(txt.toLowerCase())) == -1) {
					return false;
				}
				else {
					return true;
				}
			});
		}
		// this.trigger('item_list_changed', list);
	}.bind(this));*/
}

module.exports = RemoteStore;

var riot = require('riot');
var riotcontrol = require('riotcontrol');

function LocalStore() {  
	riot.observable(this);
	
	this.repo = null;
	this.data = null;
	
	this.on('local-load', function(data) {
		this.data = data;
		console.log('[LocalStore] put-local');
		console.log(data);
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

module.exports = LocalStore;

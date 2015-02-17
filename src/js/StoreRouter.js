var riot = require('riot');
var riotcontrol = require('riotcontrol');

// Manages our item data locally, for now.
function StoreRouter() {
	riot.observable(this);

	this.on('load-item', function(item) {
		console.log('StoreRouter got load request for '+item.url);
		
		if (item.url.substring(0, 4).toLowerCase() === 'http') {
			riotcontrol.trigger('remote-load', item);
		}
		else {
			riotcontrol.trigger('local-load', item);
		}
	}.bind(this));

}

module.exports = StoreRouter;

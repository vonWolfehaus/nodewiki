var utils = require('./utils');

<nav-item>

	<li class={ selected:opened } onclick={ open }>{ opts.name }</li>
	
	this.opened = false;
	this.data = opts;
	this.content = null;
	// console.log(this);
	
	open (e) {
		var self = this;
		/*utils.ajax('GET', this.data.url).then(function (res) {
			self.opened = true;
			var json = JSON.parse(res);
			this.content = window.atob(json.content);
			// todo: trigger global event to display content
		},
		function (err) {
			console.warn(err);
		});*/
	}

</nav-item>
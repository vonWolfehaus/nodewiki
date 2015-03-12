var riotcontrol = require('riotcontrol');

var utils = require('utils');

<nav-item>

	<li class={ selected:opened } onclick={ open }>{ opts.name }</li>
	
	this.opened = false;
	this.data = opts;
	this.content = null;
	// console.log(this);
	
	open() {
		riotcontrol.trigger('load-item', this.data);
		this.opened = true;
		riot.update('nav-dir');
	}
	
	riotcontrol.on('load-item', function() {
		// turn off any open item
		this.opened = false;
	}.bind(this));

</nav-item>
var NavItem = require('./nav-item.tag');

<nav-list>
	
	<span onclick={ toggle }>{ opts.name }</span>
	<ul hide={ !open } id={ handle }>
		
	</ul>
	
	this.data = opts;
	this.open = false;
	this.items = [];
	this.listEl = null;
	this.handle = Math.random().toString(36).slice(2);
	
	this.on('mount', function() {
		// the surest way to get a handle on that list is an id
		this.listEl = document.getElementById(this.handle);
	}.bind(this));
	
	this.on('update', function() {
		var i, item;
		
		if (!this.listEl) {
			return false;
		}
		
		// manually mount items so that we can pass in the full opts object; riot cannot pass
		// objects through attributes
		for (i = 0; i < this.items.length; i++) {
			item = this.items[i];
			// only mount items; folders were already mounted properly in nav-dir.tag
			if (!item.data) {
				this.items[i] = riot.mountTo(this.listEl, 'nav-item', item);
			}
		}
		
	});
	
	add (e) {
		this.items.push(e);
		return true;
	}
	
	toggle (e) {
		this.open = !this.open;
		// todo: animate children
		this.listEl.style.height = this.open ? 'auto' : '0';
	}
	
</nav-list>
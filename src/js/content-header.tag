var riotcontrol = require('riotcontrol');

<content-header>
	
	<h2 id="markdown-title">wiki</h2>
	<!-- <input if={ open } name='input' onkeyup={ search } /> -->
	
	// this.open = false;
	
	this.on('mount', function() {
		this.titleEl = document.getElementById('markdown-title');
	}.bind(this));
	
	search(e) {
		// this.txt = e.target.value;
		// riotcontrol.trigger('item_list_search', e.target.value);
		console.log(e.target.value);
	}
	
	riotcontrol.on('load-item', function(item) {
		if (this.titleEl) {
			this.titleEl.textContent = item.name;
		}
		
		// this.open = true;
	}.bind(this));
	
</content-header>
var marked = require('marked'); //https://github.com/chjj/marked
var humane = require('humane-js');

var riotcontrol = require('riotcontrol');

var DropZone = require('drop-zone.tag');

<file-view>
	
	<div if={!open}>
		<drop-zone></drop-zone>
	</div>
	<div id="markdown"></div>
	
	this.open = false;
	this.markdown = null;
	this.element = null;
	
	/*marked.setOptions({
		gfm: true,
		tables: true,
		breaks: true,
		pedantic: false,
		sanitize: true,
		smartLists: true,
		smartypants: false
	});*/
	
	this.on('mount', function() {
		this.element = document.getElementById('markdown');
	}.bind(this));
	
	riotcontrol.on('render-md', function(data) {
		if (!this.element) {
			humane.warn('File view did not mount yet');
			return;
		}
		// humane.log('Rendering markdown...');
		
		this.markdown = data;
		this.open = true;
		this.element.innerHTML = marked(data);
		this.update();
		
	}.bind(this));
	
</file-view>
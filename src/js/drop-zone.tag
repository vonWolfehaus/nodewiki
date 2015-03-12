var humane = require('humane-js');

var riotcontrol = require('riotcontrol');

<drop-zone>

	<div id="drop-zone" ondrop={drop} ondragover={allowDrop} ondragenter={dragEnter} ondragleave={dragLeave}>
		<span>Drag and drop a folder into this area.</span>
	</div>
	
	this.dropData = null;
	this.element = null;
	
	this.on('mount', function() {
		this.element = document.getElementById('markdown');
		this.dropElement = document.getElementById('drop-zone');
	}.bind(this));
	
	drop(evt) {
		evt.preventDefault();
		evt.stopPropagation();
		// evt.target.classList.remove('dropping');
		// console.log(evt.dataTransfer);
		
		var items = evt.dataTransfer.items;
		var i, item, entry;
		
		item = items[0];
		// for (i = 0; item = items[i]; i++) {
			// item = items[i];
			if (item.kind !== 'file') {
				console.warn('Only folders are accepted');
			}
			
			entry = item.webkitGetAsEntry();
			console.log(entry);
			
			if (entry.isDirectory) {
				this.dropData = {
					tree: [],
					truncated: false
				};
				this.readFileTree(entry);
			}
			else {
				console.warn('Only folders are accepted');
			}
		// }
		// console.log(this.dropData);
	}
	
	dragEnter(evt) {
		// evt.target.classList.add('dropping');
	}
	
	dragLeave(evt) {
		// evt.target.classList.remove('dropping');
	}
	
	allowDrop(evt) {
		evt.preventDefault();
		
		evt.dataTransfer.dropEffect = 'move';
	}
	
	onError(evt) {
		console.log(evt);
		/*switch (evt.code) {
			
		}*/
	}
	
	/*readDirectory(dirEntry, callback) {
		var dirReader = dirEntry.createReader();
		var entries = [];
		var self = this;

		// Call the reader.readEntries() until no more results are returned.
		var readEntries = function() {
			 dirReader.readEntries (function(results) {
				if (!results.length) {
					callback(entries);
				} else {
					entries = entries.concat(toArray(results));
					readEntries();
				}
			}, self.onError.bind(self));
		};

		readEntries();
	}*/
	
	readFile(fileEntry) {
		/*fileEntry.file(function() {
			console.log(arguments);
		}.bind(this));*/
		// console.log(fileEntry);
		var a = fileEntry.fullPath.split('/');
		var folder = a[a.length-2];
		a.splice(0, 2); // get rid of root folder
		var i = a.indexOf(folder) + 1; // insert after where the folder appears
		this.dropData.tree.splice(i, 0, {
			path: a.join('/'),
			type: 'blob',
			// url: we need the absolute path here
		});
		/*this.dropData.tree.push({
			path: a.join('/'),
			type: 'blob'
		});*/
	}
	
	readFileTree(itemEntry) {
		var self = this;
		
		if (itemEntry.isFile) {
			this.readFile(itemEntry);
		}
		else if (itemEntry.isDirectory) {
			var dirReader = itemEntry.createReader();
			var a = itemEntry.fullPath.split('/');
			a.splice(0, 2); // get rid of empty string and root folder
			
			var p = null;
			if (a.length === 0) {} // this is the root folder item itself, ignore it
			else if (a.length === 1) p = itemEntry.name;
			else p = a.join('/');
			
			if (p) {
				this.dropData.tree.push({
					path: p,
					type: 'tree'
				});
			}
			
			console.log(this.dropData.tree);
			
			dirReader.readEntries(function(entries) {
				var idx = entries.length;
				while (idx--) {
					self.readFileTree(entries[idx]);
				}	
			}, this.onError.bind(self));
		}			
	}
	/*readEntry(dirEntry) {
		this.readDirectory(dirEntry, function(entries) {
			// Handle no files case.
			if (!entries.length) {
				console.log('Add some files chief!');
				// footer.classList.add('nofiles');
				return;
			}

			// footer.classList.remove('nofiles');
			
			console.log(entries);
			// entries.forEach(function(entry, i) {
				
			// });
		}.bind(this));
	}*/
	

</drop-zone>
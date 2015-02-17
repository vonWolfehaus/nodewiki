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
		// var items = evt.dataTransfer.files;
		// console.log(items);
		
		var i, item, entry;
		for (i = 0; i < items.length; i++) {
			item = items[i];
			if (item.kind !== 'file') {
				continue;
			}
			
			entry = item.webkitGetAsEntry();
			// console.log(entry);
			
			if (entry.isDirectory) {
				this.readFileTree(entry);
			}
			else {
				console.warn('Only folders are accepted');
			}
		}
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
		return false;
	}
	
	onError(evt) {
		console.log(evt);
		switch (evt.code) {
			
		}
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
		console.log(file);
		// this.dropData[file.fullPath] = file;
	}
	
	readFileTree(itemEntry) {
		var self = this;
		
		if (itemEntry.isFile) {
			this.readFile(itemEntry);
		}
		else if (itemEntry.isDirectory) {
			var dirReader = itemEntry.createReader();
			
			dirReader.readEntries(function(entries) {
				var idx = entries.length;
				while (idx--) {
					self.readFileTree(entries[idx]);
				}	
			});
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
var riot = require('riot');
var riotcontrol = require('riotcontrol');
var humane = require('humane-js');

var NavList = require('./nav-list.tag');

<nav-dir>
	
	<h1>{ name }</h1>
	<div id="js-top">
		
	</div>
	
	this.name = '';
	this.folders = {};
	this.element = null;
	
	this.on('mount', function() {
		this.element = document.getElementById('js-top');
	}.bind(this));

	traverse(level) {
		var i, item, pathParts, pathPartsClone, folder, parent, parentFolder;
		var tree = this.data.repo.tree;
		i = 0;
		for (folder in this.folders) {
			item = tree[this.folders[folder]];
			pathParts = folder.split('/');
			if (pathParts.length === level) {
				// get the full path of the parent folder
				pathPartsClone = pathParts.slice(0);
				pathPartsClone.pop();
				parentFolder = pathPartsClone.join('/');
				// get it's tag instance
				parent = this.folders[parentFolder];
				// mount this item to the parent
				this.folders[folder] = riot.mountTo(parent.listEl, 'nav-list', item);
				parent.add(this.folders[folder]);
				// track how many folders are in this level
				i++;
			}
		}
		// if there were any folders in this level, see if there's more in the next
		if (i > 0) {
			// we have to wait until this level has been mounted, so that the next level will have an element to attach to
			setTimeout(function() {
				this.traverse(level+1);
			}.bind(this), 20);
		}
		else {
			// no more levels, so finally attach files to all folders (after this level mounts)
			setTimeout(function() {
				this.addFiles();
			}.bind(this), 20);
		}
	}
	
	addFiles() {
		var i, pathParts, itemName, folder, fileParts;
		var tree = this.data.repo.tree;
		var fileType = 'md';
		var loadedDefault = false;
		
		// we have to loop through it again to add all items after this.folders have been attached to the DOM.
		// this way this.folders always appear above files as expected
		for (i = 0; i < tree.length; i++) {
			item = tree[i];
			if (item.type === 'tree') {
				continue;
			}
			
			pathParts = item.path.split('/');
			itemName = pathParts.pop();
			folder = pathParts.join('/');
			fileParts = itemName.split('.');
			item.name = itemName;
			
			/*if (fileParts[fileParts.length-1] !== fileType) {
				// filter out files we don't want
				continue;
			}*/
			
			if (pathParts.length > 0) {
				this.folders[folder].add(item);
			}
			else {
				riot.mountTo(this.element, 'nav-item', item);
				
				var ln = fileParts[0].toLowerCase();
				if (!loadedDefault && (ln === 'readme' || ln === 'index')) {
					// load a file immediately if a main doc is there
					loadedDefault = true;
					riotcontrol.trigger('load-item', item);
					// console.log(item);
				}
			}
		}
		
		// force an update since nothing above triggered it for us
		riot.update();
	}
	
	riotcontrol.on('render-repo', function(repo) {
		var i, pathParts, itemName, folder;
		console.log('nav-dir got repo:');
		console.log(repo);
		return;
		var tree = this.data.repo.tree;
		
		/*var repoParts = repo.url.split('/');
		var repoName = repoParts[repoParts.length-4];
		
		this.name = repoName;*/
		
		for (i = 0; i < tree.length; i++) {
			item = tree[i];
			if (item.type !== 'tree') {
				continue;
			}
			
			pathParts = item.path.split('/');
			itemName = pathParts.pop();
			folder = pathParts.join('/');
			item.name = itemName;
			
			if (pathParts.length > 0) {
				/*
					because riot batches DOM manipulations, we have to set which index this folder's data belongs to, so that we can later attach folders only when they've been added to the dom.
				*/
				this.folders[folder+'/'+itemName] = i;
			}
			else {
				// root folder so attach directly to the top div; no parent to add to
				this.folders[itemName] = riot.mountTo(this.element, 'nav-list', item);
			}
		}
		
		// recursively traverse through all subfolders, starting with the second
		this.traverse(2);
	}.bind(this));

</nav-dir>
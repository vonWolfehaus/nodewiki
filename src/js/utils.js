module.exports = {
	ajax: function(type, url) {
		return new Promise(function(resolve, reject) {
			var req = new XMLHttpRequest();
			req.open(type, url);

			req.onload = function() {
				if (req.status >= 200 && req.status < 400) {
					resolve(req.response);
				}
				else {
					reject(req.statusText);
				}
			};

			req.onerror = function() {
				reject(req.statusText);
			};

			req.send();
		});
	},
	
	empty: function(node) {
		while (node.lastChild) {
			node.removeChild(node.lastChild);
		}
	},
};
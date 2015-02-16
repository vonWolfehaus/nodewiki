(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"../src/js/main.js":[function(require,module,exports){
var riot = require('riot');
var utils = require('utils');

var NavDir = require('nav-dir.tag');

// todo: listen for the global even of that button press (when the user submits a repo to get)
utils.ajax('GET', 'https://dl.dropboxusercontent.com/u/36067312/von-component.json').then(ajaxSuccess, ajaxFail);

function ajaxSuccess(res) {
	var repo = JSON.parse(res);
	if (repo.truncated) {
		// humane.log('The repository is too big, so only part of it is displayed.');
	}
	
	var repoParts = repo.url.split('/');
	var repoName = repoParts[repoParts.length-4];
	
	riot.mount('nav-dir', {name: repoName, repo: repo});
}

function ajaxFail(err) {
	console.log(err);
}

},{"nav-dir.tag":"D:\\git\\von-wiki\\src\\js\\nav-dir.tag","riot":"D:\\git\\von-wiki\\node_modules\\riot\\riot.js","utils":"D:\\git\\von-wiki\\src\\js\\utils.js"}],"D:\\git\\von-wiki\\node_modules\\riot\\riot.js":[function(require,module,exports){
/* Riot 2.0.7, @license MIT, (c) 2015 Muut Inc. + contributors */

;(function() {

var riot = { version: 'v2.0.7' }

'use strict'

riot.observable = function(el) {

  el = el || {}

  var callbacks = {}

  el.on = function(events, fn) {
    if (typeof fn == 'function') {
      events.replace(/\S+/g, function(name, pos) {
        (callbacks[name] = callbacks[name] || []).push(fn)
        fn.typed = pos > 0
      })
    }
    return el
  }

  el.off = function(events, fn) {
    if (events == '*') callbacks = {}
    else if (fn) {
      var arr = callbacks[events]
      for (var i = 0, cb; (cb = arr && arr[i]); ++i) {
        if (cb == fn) { arr.splice(i, 1); i-- }
      }
    } else {
      events.replace(/\S+/g, function(name) {
        callbacks[name] = []
      })
    }
    return el
  }

  // only single event supported
  el.one = function(name, fn) {
    if (fn) fn.one = 1
    return el.on(name, fn)
  }

  el.trigger = function(name) {
    var args = [].slice.call(arguments, 1),
        fns = callbacks[name] || []

    for (var i = 0, fn; (fn = fns[i]); ++i) {
      if (!fn.busy) {
        fn.busy = 1
        fn.apply(el, fn.typed ? [name].concat(args) : args)
        if (fn.one) { fns.splice(i, 1); i-- }
         else if (fns[i] !== fn) { i-- } // Makes self-removal possible during iteration
        fn.busy = 0
      }
    }

    return el
  }

  return el

}
;(function(riot, evt) {

  // browsers only
  if (!this.top) return

  var loc = location,
      fns = riot.observable(),
      current = hash(),
      win = window

  function hash() {
    return loc.hash.slice(1)
  }

  function parser(path) {
    return path.split('/')
  }

  function emit(path) {
    if (path.type) path = hash()

    if (path != current) {
      fns.trigger.apply(null, ['H'].concat(parser(path)))
      current = path
    }
  }

  var r = riot.route = function(arg) {
    // string
    if (arg[0]) {
      loc.hash = arg
      emit(arg)

    // function
    } else {
      fns.on('H', arg)
    }
  }

  r.exec = function(fn) {
    fn.apply(null, parser(hash()))
  }

  r.parser = function(fn) {
    parser = fn
  }

  win.addEventListener ? win.addEventListener(evt, emit, false) : win.attachEvent('on' + evt, emit)

})(riot, 'hashchange')
/*

//// How it works?


Three ways:

1. Expressions: tmpl('{ value }', data).
   Returns the result of evaluated expression as a raw object.

2. Templates: tmpl('Hi { name } { surname }', data).
   Returns a string with evaluated expressions.

3. Filters: tmpl('{ show: !done, highlight: active }', data).
   Returns a space separated list of trueish keys (mainly
   used for setting html classes), e.g. "show highlight".


// Template examples

tmpl('{ title || "Untitled" }', data)
tmpl('Results are { results ? "ready" : "loading" }', data)
tmpl('Today is { new Date() }', data)
tmpl('{ message.length > 140 && "Message is too long" }', data)
tmpl('This item got { Math.round(rating) } stars', data)
tmpl('<h1>{ title }</h1>{ body }', data)


// Falsy expressions in templates

In templates (as opposed to single expressions) all falsy values
except zero (undefined/null/false) will default to empty string:

tmpl('{ undefined } - { false } - { null } - { 0 }', {})
// will return: " - - - 0"

*/

riot._tmpl = (function() {

  var cache = {},

      // find variable names
      re_vars = /("|').+?[^\\]\1|\.\w*|\w*:|\b(?:this|true|false|null|undefined|new|typeof|Number|String|Object|Array|Math|Date|JSON)\b|([a-z_]\w*)/gi
              // [ 1            ][ 2  ][ 3 ][ 4                                                                                        ][ 5       ]
              // 1. skip quoted strings: "a b", 'a b', 'a \'b\''
              // 2. skip object properties: .name
              // 3. skip object literals: name:
              // 4. skip reserved words
              // 5. match var name

  // build a template (or get it from cache), render with data

  return function(str, data) {
    return str && (cache[str] = cache[str] || tmpl(str))(data)
  }


  // create a template instance

  function tmpl(s, p) {
    p = (s || '{}')

      // temporarily convert \{ and \} to a non-character
      .replace(/\\{/g, '\uFFF0')
      .replace(/\\}/g, '\uFFF1')

      // split string to expression and non-expresion parts
      .split(/({[\s\S]*?})/)

    return new Function('d', 'return ' + (

      // is it a single expression or a template? i.e. {x} or <b>{x}</b>
      !p[0] && !p[2]

        // if expression, evaluate it
        ? expr(p[1])

        // if template, evaluate all expressions in it
        : '[' + p.map(function(s, i) {

            // is it an expression or a string (every second part is an expression)
            return i % 2

              // evaluate the expressions
              ? expr(s, 1)

              // process string parts of the template:
              : '"' + s

                  // preserve new lines
                  .replace(/\n/g, '\\n')

                  // escape quotes
                  .replace(/"/g, '\\"')

                + '"'

          }).join(',') + '].join("")'
      )

      // bring escaped { and } back
      .replace(/\uFFF0/g, '{')
      .replace(/\uFFF1/g, '}')

    )

  }


  // parse { ... } expression

  function expr(s, n) {
    s = s

      // convert new lines to spaces
      .replace(/\n/g, ' ')

      // trim whitespace, curly brackets, strip comments
      .replace(/^[{ ]+|[ }]+$|\/\*.+?\*\//g, '')

    // is it an object literal? i.e. { key : value }
    return /^\s*[\w-"']+ *:/.test(s)

      // if object literal, return trueish keys
      // e.g.: { show: isOpen(), done: item.done } -> "show done"
      ? '[' + s.replace(/\W*([\w-]+)\W*:([^,]+)/g, function(_, k, v) {

          // safely execute vars to prevent undefined value errors
          return v.replace(/\w[^,|& ]*/g, function(v) { return wrap(v, n) }) + '?"' + k + '":"",'

        }) + '].join(" ")'

      // if js expression, evaluate as javascript
      : wrap(s, n)

  }


  // execute js w/o breaking on errors or undefined vars

  function wrap(s, nonull) {
    return '(function(v){try{v='

        // prefix vars (name => data.name)
        + (s.replace(re_vars, function(s, _, v) { return v ? 'd.' + v : s })

          // break the expression if its empty (resulting in undefined value)
          || 'x')

      + '}finally{return '

        // default to empty string for falsy values except zero
        + (nonull ? '!v&&v!==0?"":v' : 'v')

      + '}}).call(d)'
  }

})()
;(function(riot, is_browser) {

  if (!is_browser) return

  var tmpl = riot._tmpl,
      all_tags = [],
      tag_impl = {},
      doc = document

  function each(nodes, fn) {
    for (var i = 0; i < (nodes || []).length; i++) {
      if (fn(nodes[i], i) === false) i--
    }
  }

  function extend(obj, from) {
    from && Object.keys(from).map(function(key) {
      obj[key] = from[key]
    })
    return obj
  }

  function diff(arr1, arr2) {
    return arr1.filter(function(el) {
      return arr2.indexOf(el) < 0
    })
  }

  function walk(dom, fn) {
    dom = fn(dom) === false ? dom.nextSibling : dom.firstChild

    while (dom) {
      walk(dom, fn)
      dom = dom.nextSibling
    }
  }


  function mkdom(tmpl) {
    var tag_name = tmpl.trim().slice(1, 3).toLowerCase(),
        root_tag = /td|th/.test(tag_name) ? 'tr' : tag_name == 'tr' ? 'tbody' : 'div'
        el = doc.createElement(root_tag)

    el.innerHTML = tmpl
    return el
  }


  function update(expressions, instance) {

    // allow recalculation of context data
    instance.trigger('update')

    each(expressions, function(expr) {
      var tag = expr.tag,
          dom = expr.dom

      function remAttr(name) {
        dom.removeAttribute(name)
      }

      // loops first: TODO remove from expressions arr
      if (expr.loop) {
        remAttr('each')
        return loop(expr, instance)
      }

      // custom tag
      if (tag) return tag.update ? tag.update() :
        expr.tag = createTag({ tmpl: tag[0], fn: tag[1], root: dom, parent: instance })


      var attr_name = expr.attr,
          value = tmpl(expr.expr, instance)

      if (value == null) value = ''

      // no change
      if (expr.value === value) return
      expr.value = value


      // text node
      if (!attr_name) return dom.nodeValue = value

      // attribute
      if (!value && expr.bool || /obj|func/.test(typeof value)) remAttr(attr_name)

      // event handler
      if (typeof value == 'function') {
        dom[attr_name] = function(e) {

          // cross browser event fix
          e = e || window.event
          e.which = e.which || e.charCode || e.keyCode
          e.target = e.target || e.srcElement
          e.currentTarget = dom

          // currently looped item
          e.item = instance.__item || instance

          // prevent default behaviour (by default)
          if (value.call(instance, e) !== true) {
            e.preventDefault && e.preventDefault()
            e.returnValue = false
          }

          instance.update()
        }

      // show / hide / if
      } else if (/^(show|hide|if)$/.test(attr_name)) {
        remAttr(attr_name)
        if (attr_name == 'hide') value = !value
        dom.style.display = value ? '' : 'none'

      // normal attribute
      } else {
        if (expr.bool) {
          dom[attr_name] = value
          if (!value) return
          value = attr_name
        }

        dom.setAttribute(attr_name, value)
      }

    })

    instance.trigger('updated')

  }

  function parse(root) {

    var named_elements = {},
        expressions = []

    walk(root, function(dom) {

      var type = dom.nodeType,
          value = dom.nodeValue

      // text node
      if (type == 3 && dom.parentNode.tagName != 'STYLE') {
        addExpr(dom, value)

      // element
      } else if (type == 1) {

        // loop?
        value = dom.getAttribute('each')

        if (value) {
          addExpr(dom, value, { loop: 1 })
          return false
        }

        // custom tag?
        var tag = tag_impl[dom.tagName.toLowerCase()]

        // attributes
        each(dom.attributes, function(attr) {
          var name = attr.name,
              value = attr.value

          // named elements
          if (/^(name|id)$/.test(name)) named_elements[value] = dom

          // expressions
          if (!tag) {
            var bool = name.split('__')[1]
            addExpr(dom, value, { attr: bool || name, bool: bool })
            if (bool) {
              dom.removeAttribute(name)
              return false
            }
          }

        })

        if (tag) addExpr(dom, 0, { tag: tag })

      }

    })

    return { expr: expressions, elem: named_elements }

    function addExpr(dom, value, data) {
      if (value ? value.indexOf('{') >= 0 : data) {
        var expr = { dom: dom, expr: value }
        expressions.push(extend(expr, data || {}))
      }
    }
  }



  // create new custom tag (component)
  function createTag(conf) {

    var opts = conf.opts || {},
        dom = mkdom(conf.tmpl),
        mountNode = conf.root,
        parent = conf.parent,
        ast = parse(dom),
        tag = { root: mountNode, opts: opts, parent: parent, __item: conf.item },
        attributes = {}

    // named elements
    extend(tag, ast.elem)

    // attributes
    each(mountNode.attributes, function(attr) {
      attributes[attr.name] = attr.value
    })

    function updateOpts() {
      Object.keys(attributes).map(function(name) {
        var val = opts[name] = tmpl(attributes[name], parent || tag)
        if (typeof val == 'object') mountNode.removeAttribute(name)
      })
    }

    updateOpts()

    if (!tag.on) {
      riot.observable(tag)
      delete tag.off // off method not needed
    }

    if (conf.fn) conf.fn.call(tag, opts)


    tag.update = function(data, _system) {

      /*
        If loop is defined on the root of the HTML template
        the original parent is a temporary <div/> by mkdom()
      */
      if (parent && dom && !dom.firstChild) {
        mountNode = parent.root
        dom = null
      }

      if (_system || doc.body.contains(mountNode)) {
        extend(tag, data)
        extend(tag, tag.__item)
        updateOpts()
        update(ast.expr, tag)

        // update parent
        !_system && tag.__item && parent.update()
        return true

      } else {
        tag.trigger('unmount')
      }

    }

    tag.update(0, true)

    // append to root
    while (dom.firstChild) {
      if (conf.before) mountNode.insertBefore(dom.firstChild, conf.before)
      else mountNode.appendChild(dom.firstChild)
    }


    tag.trigger('mount')

    all_tags.push(tag)

    return tag
  }


  function loop(expr, instance) {

    // initialize once
    if (expr.done) return
    expr.done = true

    var dom = expr.dom,
        prev = dom.previousSibling,
        root = dom.parentNode,
        template = dom.outerHTML,
        val = expr.expr,
        els = val.split(/\s+in\s+/),
        rendered = [],
        checksum,
        keys


    if (els[1]) {
      val = '{ ' + els[1]
      keys = els[0].slice(1).trim().split(/,\s*/)
    }

    // clean template code
    instance.one('mount', function() {
      var p = dom.parentNode
      if (p) {
        root = p
        root.removeChild(dom)
      }
    })

    function startPos() {
      return Array.prototype.indexOf.call(root.childNodes, prev) + 1
    }

    instance.on('updated', function() {

      var items = tmpl(val, instance)
          is_array = Array.isArray(items)

      if (is_array) items = items.slice(0)

      else {

        if (!items) return // some IE8 issue

        // detect Object changes
        var testsum = JSON.stringify(items)
        if (testsum == checksum) return
        checksum = testsum

        items = Object.keys(items).map(function(key, i) {
          var item = {}
          item[keys[0]] = key
          item[keys[1]] = items[key]
          return item
        })

      }

      // remove redundant
      diff(rendered, items).map(function(item) {
        var pos = rendered.indexOf(item)
        root.removeChild(root.childNodes[startPos() + pos])
        rendered.splice(pos, 1)
      })

      // add new
      diff(items, rendered).map(function(item, i) {
        var pos = items.indexOf(item)

        // string array
        if (keys && !checksum) {
          var obj = {}
          obj[keys[0]] = item
          obj[keys[1]] = pos
          item = obj
        }

        var tag = createTag({
          before: root.childNodes[startPos() + pos],
          parent: instance,
          tmpl: template,
          item: item,
          root: root
        })

        instance.on('update', function() {
          tag.update(0, true)
        })

      })

      // assign rendered
      rendered = items

    })

  }

  riot.tag = function(name, tmpl, fn) {
    fn = fn || noop,
    tag_impl[name] = [tmpl, fn]
  }

  riot.mountTo = function(node, tagName, opts) {
    var tag = tag_impl[tagName]
    return tag && createTag({ tmpl: tag[0], fn: tag[1], root: node, opts: opts })
  }

  riot.mount = function(selector, opts) {
    if (selector == '*') selector = Object.keys(tag_impl).join(', ')

    var instances = []

    each(doc.querySelectorAll(selector), function(node) {
      if (node.riot) return

      var tagName = node.tagName.toLowerCase(),
          instance = riot.mountTo(node, tagName, opts)

      if (instance) {
        instances.push(instance)
        node.riot = 1
      }
    })

    return instances
  }

  // update everything
  riot.update = function() {
    return all_tags = all_tags.filter(function(tag) {
      return !!tag.update()
    })
  }

})(riot, this.top)


// support CommonJS
if (typeof exports === 'object')
  module.exports = riot

// support AMD
else if (typeof define === 'function' && define.amd)
  define(function() { return riot })

// support browser
else
  this.riot = riot

})();
},{}],"D:\\git\\von-wiki\\src\\js\\nav-dir.tag":[function(require,module,exports){
var riot = require('riot');
var riot = require('riot');

var NavList = require('./nav-list.tag');

riot.tag('nav-dir', '<h1>{ opts.name }</h1> <div id="js-top"> </div>', function(opts) {
	
	this.data = opts;
	this.folders = {};
	
	this.on('mount', function() {
		console.log('Running...');
		var i, pathParts, itemName, folder;
		var tree = this.data.repo.tree;
		var folderParentEl = document.getElementById('js-top');
		
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
				
				this.folders[folder+'/'+itemName] = i;
			}
			else {

				this.folders[itemName] = riot.mountTo(folderParentEl, 'nav-list', item);
			}
		}

		this.traverse(2);
		
	}.bind(this));

	this.traverse = function(level) {
		var i, item, pathParts, pathPartsClone, folder, parent, parentFolder;
		var tree = this.data.repo.tree;
		i = 0;
		for (folder in this.folders) {
			item = tree[this.folders[folder]];
			pathParts = folder.split('/');
			if (pathParts.length === level) {

				pathPartsClone = pathParts.slice(0);
				pathPartsClone.pop();
				parentFolder = pathPartsClone.join('/');

				parent = this.folders[parentFolder];

				this.folders[folder] = riot.mountTo(parent.listEl, 'nav-list', item);
				parent.add(this.folders[folder]);

				i++;
			}
		}

		if (i > 0) {

			setTimeout(function() {
				this.traverse(level+1);
			}.bind(this), 20);
		}
		else {

			setTimeout(function() {
				this.addFiles();
			}.bind(this), 20);
		}
	}.bind(this);
	
	this.addFiles = function() {
		var i, pathParts, itemName, folder, fileParts;
		var tree = this.data.repo.tree;
		var folderParentEl = document.getElementById('js-top');
		var fileType = 'md';


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
			
			
			
			if (pathParts.length > 0) {
				this.folders[folder].add(item);
			}
			else {
				riot.mountTo(folderParentEl, 'nav-item', item);
			}
		}

		riot.update();
	}.bind(this);


});
},{"./nav-list.tag":"D:\\git\\von-wiki\\src\\js\\nav-list.tag","riot":"D:\\git\\von-wiki\\node_modules\\riot\\riot.js"}],"D:\\git\\von-wiki\\src\\js\\nav-item.tag":[function(require,module,exports){
var riot = require('riot');
var utils = require('./utils');

riot.tag('nav-item', '<li class="{ selected:opened }" onclick="{ open }">{ opts.name }</li>', function(opts) {
	
	this.opened = false;
	this.data = opts;
	this.content = null;

	
	this.open = function(e) {
		var self = this;
		
	}.bind(this);


});
},{"./utils":"D:\\git\\von-wiki\\src\\js\\utils.js","riot":"D:\\git\\von-wiki\\node_modules\\riot\\riot.js"}],"D:\\git\\von-wiki\\src\\js\\nav-list.tag":[function(require,module,exports){
var riot = require('riot');
var NavItem = require('./nav-item.tag');

riot.tag('nav-list', '<span onclick="{ toggle }">{ opts.name }</span> <ul hide="{ !open }" id="{ handle }"> </ul>', function(opts) {
	
	this.data = opts;
	this.open = false;
	this.items = [];
	this.listEl = null;
	this.handle = Math.random().toString(36).slice(2);
	
	this.on('mount', function() {

		this.listEl = document.getElementById(this.handle);
	}.bind(this));
	
	this.on('update', function() {
		var i, item;
		
		if (!this.listEl) {
			return false;
		}


		for (i = 0; i < this.items.length; i++) {
			item = this.items[i];

			if (!item.data) {
				this.items[i] = riot.mountTo(this.listEl, 'nav-item', item);
			}
		}
		
	});
	
	this.add = function(e) {
		this.items.push(e);
		return true;
	}.bind(this);
	
	this.toggle = function(e) {
		this.open = !this.open;

		this.listEl.style.height = this.open ? 'auto' : '0';
	}.bind(this);
	

});
},{"./nav-item.tag":"D:\\git\\von-wiki\\src\\js\\nav-item.tag","riot":"D:\\git\\von-wiki\\node_modules\\riot\\riot.js"}],"D:\\git\\von-wiki\\src\\js\\utils.js":[function(require,module,exports){
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
},{}]},{},["../src/js/main.js"])


//# sourceMappingURL=main.js.map

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("meemoo-dataflow/build/dataflow.build.js", function(exports, require, module){
/*! dataflow.js - v0.0.7 - 2013-09-11 (9:36:20 PM GMT+0300)
* Copyright (c) 2013 Forrest Oliphant; Licensed MIT, GPL */
(function(Backbone) {
  var ensure = function (obj, key, type) {
    if (!obj[key]) {
      obj[key] = new type();
    }
    if (!(obj[key] instanceof type)) {
      obj[key] = new type(obj[key]);
    }
  };

  var ActionItem = Backbone.Model.extend({
    defaults: {
      action: null,
      label: '',
      disabled: false,
      icon: ''
    }
  });

  var ActionList = Backbone.Collection.extend({
    model: ActionItem
  });

  var ActionBar = Backbone.Model.extend({
    view: null,
    context: null,

    defaults: {
      control: null,
      actions: null,
      overflow: null,
      className: 'actionbar'
    },

    initialize: function (attributes, context) {
      ensure(this.attributes, 'control', ActionItem);
      ensure(this.attributes, 'actions', ActionList);
      ensure(this.attributes, 'overflow', ActionList);
      this.context = context;
    },

    render: function () {
      this.view = new ActionBarView({
        model: this,
        context: this.context
      });
      return this.view.render().el;
    },

    show: function () {
      var bar = this.render();
      Backbone.$('body').prepend(bar);
    },

    hide: function () {
      if (!this.view) {
        return;
      }
      this.view.$el.remove();
      this.view = null;
    }
  });

  var ContextBar = Backbone.Model.extend({
    view: null,
    context: null,

    defaults: {
      control: null,
      actions: null,
      className: 'contextbar'
    },

    initialize: function (attributes, context) {
      ensure(this.attributes, 'control', ActionItem);
      ensure(this.attributes, 'actions', ActionList);
      this.context = context;
    },

    render: function () {
      this.view = new ContextBarView({
        model: this,
        context: this.context
      });
      return this.view.render().el;
    },

    show: function () {
      var bar = this.render();
      Backbone.$('body').prepend(bar);
    },

    hide: function () {
      if (!this.view) {
        return;
      }
      this.view.$el.remove();
      this.view = null;
    }
  });

  var ActionBarView = Backbone.View.extend({
    tagName: 'div',
    className: 'navbar navbar-fixed-top',
    template: '<div class="navbar-inner"></div>',
    $inner: null,
    $control: null,
    $actions: null,
    context: null,

    events: {
      'click .control-up': 'handleUp',
      'click .control-icon': 'handleIcon',
      'click .control-label': 'handleLabel'
    },

    initialize: function (options) {
      this.listenTo(this.model.get('control'), 'change', this.renderControl);
      this.context = options.context;
    },

    handleUp: function (event) {
      event.preventDefault();
      if (this.model.get('control').get('disabled')) {
       return;
      }
      if (!this.model.get('control').get('up')) {
        return;
      }
      this.model.get('control').get('up').call(this.context);
    },

    handleIcon: function (event) {
      if (this.model.get('control').get('up')) {
        this.handleUp(event);
        return;
      }
      this.handleLabel(event);
    },

    handleLabel: function (event) {
      event.preventDefault();
      if (this.model.get('control').get('disabled')) {
       return;
      }
      if (!this.model.get('control').get('action')) {
        return;
      }
      this.model.get('control').get('action').call(this.context);
    },

    render: function () {
      this.$el.html(this.template);
      this.$el.addClass(this.model.get('className'));
      this.$inner = Backbone.$('.navbar-inner', this.$el);
      this.$control = null;
      this.$actions = null;
      this.renderControl();
      this.renderActions();
      this.renderOverflow();
      return this;
    },

    renderControl: function () {
      if (!this.model.get('control')) {
        return;
      }
      if (!this.$control) {
        this.$control = Backbone.$('<a>');
        this.$control.addClass('brand');
        this.$inner.prepend(this.$control);
      }
      var icon = this.model.get('control').get('icon');
      var up = this.model.get('control').get('up');
      var label = this.model.get('control').get('label');
      this.$control.empty();
      if (up) {
        this.$control.append(Backbone.$('<i class="control-up icon-chevron-left"></i><span class="control-up">&nbsp;</span>'));
      }
      if (icon) {
        this.$control.append(Backbone.$('<i class="control-icon icon-' + icon + '"></i>'));
      }
      if (label) {
        this.$control.append('<span class="control-label">&nbsp;' + label + '</span>');
      }
    },

    renderActions: function () {
      if (this.$actions) {
        return;
      }
      var view = new ActionListView({
        collection: this.model.get('actions'),
        context: this.context
      });
      this.$inner.append(view.render().$el);
      this.$actions = view.$el;
    },

    renderOverflow: function () {
    }
  });

  var ContextBarView = Backbone.View.extend({
    tagName: 'div',
    className: 'navbar navbar-inverse navbar-fixed-top',
    template: '<div class="navbar-inner"></div>',
    $inner: null,
    $control: null,
    $actions: null,
    context: null,

    events: {
      'click .control-icon': 'handleControl',
      'click .control-label': 'handleControl'
    },

    handleControl: function (event) {
      event.preventDefault();
      if (this.model.get('control').get('disabled')) {
       return;
      }
      if (!this.model.get('control').get('action')) {
        return;
      }
      this.model.get('control').get('action').call(this.context);
    },

    initialize: function (options) {
      this.listenTo(this.model.get('control'), 'change', this.renderControl);
      this.context = options.context;
    },

    render: function () {
      this.$el.html(this.template);
      this.$el.addClass(this.model.get('className'));
      this.$inner = Backbone.$('.navbar-inner', this.$el);
      this.$control = null;
      this.$actions = null;
      this.renderControl();
      this.renderActions();
      return this;
    },

    renderControl: function () {
      if (!this.$control) {
        this.$control = Backbone.$('<a>');
        this.$control.addClass('brand');
        this.$inner.prepend(this.$control);
      }
      var icon = this.model.get('control').get('icon');
      var label = this.model.get('control').get('label');
      this.$control.empty();
      if (icon) {
        this.$control.append(Backbone.$('<i class="control-icon icon-' + icon + '"></i>'));
      }
      if (label) {
        this.$control.append('<span class="control-label"> ' + label + '</span>');
      }
    },

    renderActions: function () {
      if (this.$actions) {
        return;
      }
      var view = new ActionListView({
        collection: this.model.get('actions'),
        context: this.context
      });
      this.$inner.append(view.render().$el);
      this.$actions = view.$el;
    }
  });

  var ActionListView = Backbone.View.extend({
    tagName: 'ul',
    className: 'nav pull-right',
    views: {},
    context: null,

    initialize: function (options) {
      this.collection = options.collection;
      this.context = options.context;
      this.listenTo(this.collection, 'add', this.addItem);
      this.listenTo(this.collection, 'remove', this.removeItem);
      this.listenTo(this.collection, 'reset', this.render);
    },

    render: function () {
      this.$el.empty();
      this.collection.each(this.addItem, this);
      return this;
    },

    addItem: function (action) {
      var view = new ActionItemView({
        model: action,
        context: this.context
      });
      this.$el.append(view.render().el);
      this.views[action.cid] = view;
    },

    removeItem: function (action) {
      if (!this.views[action.cid]) {
        return;
      }

      this.views[action.cid].$el.remove();
      delete this.views[action.cid];
    }
  });

  var ActionItemView = Backbone.View.extend({
    tagName: 'li',
    template: '<a></a>',
    context: null,

    events: {
      'click': 'handleClick'
    },
    
    initialize: function (options) {
      this.context = options.context;
      this.listenTo(this.model, 'change', this.render);
    },

    handleClick: function (event) {
      event.preventDefault();
      if (this.model.get('disabled')) {
        return;
      }
      if (!this.model.get('action')) {
        return;
      }
      this.model.get('action').call(this.context);
    },

    render: function () {
      this.$el.html(this.template);
      var $btn = Backbone.$('a', this.$el);
      $btn.append(Backbone.$('<i class="icon-' + this.model.get('icon') + '"></i>'));
      $btn.append( this.model.get('label') );

      if (this.model.get('disabled')) {
        this.$el.addClass('disabled');
      } else {
        this.$el.removeClass('disabled');
      }
      return this;
    }
  });

  window.ActionBar = ActionBar;
  window.ContextBar = ContextBar;
})(Backbone);

(function(){
  var App = Backbone.Model.extend({
    "$": function(query) {
      return this.$el.find(query);
    },
    initialize: function(q){
      this.el = document.createElement("div");
      this.el.className = "dataflow";
      this.$el = $(this.el);
      var menu = $('<div class="dataflow-menu">');
      var self = this;
      var menuClose = $('<button class="dataflow-menu-close icon-remove"></button>')
        .click( function(){ self.hideMenu(); } )
        .appendTo(menu);
      this.$el.append(menu);

      // Debug mode
      this.debug = this.get("debug");

      // Show controls?
      this.controls = this.get("controls");
      if (this.controls !== false) {
        // Default to true
        this.controls = true;
      }

      if (this.controls) {
        // Setup actionbar
        this.prepareActionBar();
        this.renderActionBar();

        // Add plugins
        for (var name in this.plugins) {
          if (this.plugins[name].initialize) {
            this.plugins[name].initialize(this);
          }
        }
      }

      // Show form fields on inputs?
      this.inputs = this.get("inputs");
      if (this.inputs !== false) {
        // Default to true
        this.inputs = true;
      }

      // Wires and names editable?
      this.editable = this.get("editable");
      if (this.editable !== false) {
        // Default to true
        this.editable = true;
      }

      // Add the main element to the page
      var appendTo = this.get("appendTo");
      appendTo = appendTo ? appendTo : "body";
      if (appendTo==="body") {
        // Fill whole page
        $("html, body").css({
          margin: "0px",
          padding: "0px",
          width: "100%",
          height: "100%"
        });
      }
      $(appendTo).append(this.el);

      if (!this.id) {
        this.id = $(appendTo).attr('id');
      }

      // Initialize state
      this.loadState();
    },
    prepareActionBar: function () {
      this.actionBar = new ActionBar({}, this);
      this.actionBar.get('control').set({
        label: 'Dataflow',
        icon: 'retweet'
      });
      this.contextBar = new ContextBar({}, this);
      this.contextBar.get('control').set({
        label: '1 selected',
        icon: 'ok',
        action: function () {
          if (this.currentGraph && this.currentGraph.view) {
            this.currentGraph.view.deselect();
          }
        }
      });
    },
    renderActionBar: function () {
      this.$el.append( this.actionBar.render() );
      this.$(".brand").attr({
        href: "https://github.com/meemoo/dataflow",
        target: "_blank"
      });
      this.$el.append( this.contextBar.render() );
      this.contextBar.view.$el.hide();
    },
    // Create the object to contain the modules
    modules: {},
    module: function(name) {
      // Create a new module reference scaffold or load an existing module.
      // If this module has already been created, return it.
      if (this.modules[name]) {
        return this.modules[name];
      }
      // Create a module scaffold and save it under this name
      this.modules[name] = {};
      return this.modules[name];
    },
    // Create the object to contain the nodes
    nodes: {},
    node: function(name) {
      // Create a new node reference scaffold or load an existing node.
      // If this node has already been created, return it.
      if (this.nodes[name]) {
        return this.nodes[name];
      }
      // Create a node scaffold and save it under this name
      this.nodes[name] = {};
      return this.nodes[name];
    },
    plugins: {},
    plugin: function(name) {
      if (this.plugins[name]) {
        return this.plugins[name];
      }
      this.plugins[name] = {};
      return this.plugins[name];
    },
    hideMenu: function () {
      this.$el.removeClass("menu-shown");
    },
    showMenu: function (id) {
      this.$el.addClass("menu-shown");
      this.$(".dataflow-menuitem").removeClass("shown");
      this.$(".dataflow-menuitem-"+id).addClass("shown");
    },
    addPlugin: function (info) {
      if (info.menu) {
        var menu = $("<div>")
          .addClass("dataflow-menuitem dataflow-menuitem-"+info.id)
          .append(info.menu);
        this.$(".dataflow-menu").append( menu );

        this.actionBar.get('actions').add({
          id: info.id,
          icon: info.icon,
          label: info.name,
          showLabel: false,
          action: function(){ this.showMenu(info.id); }
        });
      }
    },
    showContextBar: function () {
      this.actionBar.view.$el.hide();
      this.contextBar.view.$el.show();
    },
    hideContextBar: function () {
      this.contextBar.view.$el.hide();
      this.actionBar.view.$el.show();
    },
    contexts: {},
    addContext: function (info) {
      for (var i=0; i<info.contexts.length; i++){
        var c = info.contexts[i];
        if (!this.contexts[c]) {
          this.contexts[c] = [];
        }
        this.contexts[c].push(info);
      }
    },
    changeContext: function (selected) {
      if (!this.contextBar) { return false; }
      if (selected.length > 1) {
        // More than one selected: Move to subgraph, Cut/Copy
        this.contextBar.get('control').set({
          label: selected.length + ' selected'
        });
        this.contextBar.get('actions').reset();
        this.contextBar.get('actions').add(this.contexts.twoplus);

        this.showContextBar();
      } else if (selected.length === 1) {
        // One selected: Remove node, Rename node, Change component, Cut/Copy
        this.contextBar.get('control').set({
          label: '1 selected'
        });
        this.contextBar.get('actions').reset();
        this.contextBar.get('actions').add(this.contexts.one);
        this.showContextBar();
      } else {
        // None selected: hide contextBar
        this.hideContextBar();
      }
    },
    loadGraph: function (source) {
      if (this.graph) {
        if (this.currentGraph.view) {
          this.currentGraph.view.remove();
        }
        if (this.graph.view) {
          this.graph.view.remove();
        }
        this.graph.remove();
      }
      var Graph = this.module("graph");

      source.dataflow = this;
      var newGraph = new Graph.Model(source);
      newGraph.view = new Graph.View({model: newGraph});
      this.$el.append(newGraph.view.render().el);

      // For debugging
      this.graph = this.currentGraph = newGraph;

      return newGraph;
    },
    showGraph: function(graph){
      // Hide current
      this.currentGraph.view.$el.detach();
      // Show new
      this.$el.append(graph.view.el);
      graph.view.render();
      this.currentGraph = graph;
    },
    debug: false,
    log: function(message) {
      this.trigger("log", message, arguments);
      if (this.debug) {
        console.log("Dataflow: ", arguments);
      }
    },
    types: [
      "all",
      "canvas:2d",
      "canvas:webgl",
      "string",
      "number",
      "int",
      "object",
      "array"
    ]
  });

  // Our global
  window.Dataflow = App;
  if (typeof exports === 'object') {
    // CommonJS export
    exports.Dataflow = App;
  }

  // Backbone hacks
  // Discussed here http://stackoverflow.com/a/13075845/592125
  Backbone.View.prototype.addEvents = function(events) {
    this.delegateEvents( _.extend(_.clone(this.events), events) );
  };

  // Simple collection view
  Backbone.CollectionView = Backbone.Model.extend({
    // this.tagName and this.itemView should be set
    initialize: function(options){
      this.el = document.createElement(this.tagName);
      this.$el = $(this.el);
      this.parent = options.parent;
      var collection = this.get("collection");
      collection.each(this.addItem, this);
      collection.on("add", this.addItem, this);
      collection.on("remove", this.removeItem, this);
    },
    addItem: function(item){
      item.view = new this.itemView({
        model:item,
        parent: this.parent
      });
      this.$el.append(item.view.render().el);
    },
    removeItem: function(item){
      item.view.remove();
    }
  });
}());

// All code has been downloaded and evaluated and app is ready to be initialized.
// jQuery(function($) {

//   // Router
//   var DataflowRouter = Backbone.Router.extend({
//     routes: {
//       "": "index"
//     },
//     index: function() {

//     }
//   });
//   Dataflow.router = new DataflowRouter();
//   Backbone.history.start();

// });

(function(Dataflow) {
  var StateModel = Backbone.Model.extend({});

  Dataflow.prototype.loadState = function () {
    // Initialize State with localStorage
    var stateKey = 'dataflow-' + (this.id ? this.id : this.cid);
    var stateData = JSON.parse(window.localStorage.getItem(stateKey));
    if (!stateData) {
      stateData = {};
    }

    var state = new StateModel(stateData);
    this.set('state', state);

    // Set up persistence
    state.on('change', function (stateInstance) {
      window.localStorage.setItem(stateKey, JSON.stringify(stateInstance.toJSON()));
    });
  };

}(Dataflow));

(function(Dataflow) {
 
  var Graph = Dataflow.prototype.module("graph");

  // Dependencies
  var Node = Dataflow.prototype.module("node");
  var Edge = Dataflow.prototype.module("edge");

  Graph.Model = Backbone.Model.extend({
    defaults: {
      nodes: [],
      edges: [],
      panX: 0,
      panY: 0,
      zoom: 1
    },
    initialize: function() {
      this.dataflow = this.get("dataflow");

      var i;

      // Set up nodes 
      var nodes = this.nodes = new Node.Collection();
      nodes.parentGraph = this;
      // Node events
      nodes.on("all", function(){
        this.trigger("change");
      }, this);
      nodes.on("add", function(node){
        this.dataflow.trigger("node:add", this, node);
      }, this);
      nodes.on("remove", function(node){
        // Remove related edges and unload running processes if defined
        node.remove();
        this.dataflow.trigger("node:remove", this, node);
      }, this);
      // Convert nodes array to backbone collection
      var nodesArray = this.get("nodes");
      for(i=0; i<nodesArray.length; i++) {
        var node = nodesArray[i];
        node.parentGraph = this;
        if (node.type && this.dataflow.nodes[node.type]) {
          node = new this.dataflow.nodes[node.type].Model(node);
          nodes.add(node);
        } else {
          this.dataflow.log("node "+node.id+" not added: node type ("+node.type+") not found", node);
        }
      }

      // Set up edges
      var edges = this.edges = new Edge.Collection();
      edges.parentGraph = this;
      // Edge events
      edges.on("all", function(){
        this.trigger("change");
      }, this);
      edges.on("add", function(edge){
        this.dataflow.trigger("edge:add", this, edge);
      }, this);
      edges.on("remove", function(edge){
        this.dataflow.trigger("edge:remove", this, edge);
      }, this);
      // Convert edges array to backbone collection
      var edgesArray = this.get("edges");
      for(i=0; i<edgesArray.length; i++) {
        var edge = edgesArray[i];
        edge.parentGraph = this;
        edge.id = edge.source.node+":"+edge.source.port+"::"+edge.target.node+":"+edge.target.port;
        // Check that nodes and ports exist
        var sourceNode = nodes.get(edge.source.node);
        var targetNode = nodes.get(edge.target.node);
        if (sourceNode && targetNode && sourceNode.outputs.get(edge.source.port) && targetNode.inputs.get(edge.target.port)) {
          edge = new Edge.Model(edge);
          edges.add(edge);
        } else {
          this.dataflow.log("edge "+edge.id+" not added: node or port not found", edge);
        }
      }
      // Attach collections to graph
      this.set({
        nodes: nodes,
        edges: edges
      });

      // Listen for un/select
      this.on("selectionChanged", this.selectionChanged, this);
      this.on("select:node", this.selectNode, this);
      this.on("select:edge", this.selectEdge, this);

      // Pass graph change events up to dataflow
      this.on("change", function(){
        this.dataflow.trigger("change", this);
      }, this);
    },
    selectNode: function (node) {
      this.dataflow.trigger("select:node", this, node);
    },
    selectEdge: function (edge) {
      this.dataflow.trigger("select:edge", this, edge);
    },
    selectionChanged: function () {
      this.selected = this.nodes.where({selected:true});
      this.dataflow.changeContext(this.selected);
    },
    remove: function(){
      while(this.nodes.length > 0){
        this.nodes.remove(this.nodes.at(this.nodes.length-1));
      }
    },
    toJSON: function(){
      return {
        nodes: this.nodes,
        edges: this.edges
      };
    }
  });

}(Dataflow));

( function(Dataflow) {

  var Node = Dataflow.prototype.module("node");
 
  // Dependencies
  var Input = Dataflow.prototype.module("input");
  var Output = Dataflow.prototype.module("output");

  Node.Model = Backbone.Model.extend({
    defaults: function () {
      return {
        label: "",
        type: "test",
        x: 200,
        y: 100,
        state: {},
        selected: false
      };
    },
    initialize: function() {
      this.parentGraph = this.get("parentGraph");
      this.type = this.get("type");

      // Default label to type
      if (this.get("label")===""){
        this.set({
          "label": this.get("type")
        });
      }

      // Convert inputs array to backbone collection
      var inputArray = this.inputs;
      this.inputs = new Input.Collection();
      this.inputs.parentNode = this;
      for(var i=0; i<inputArray.length; i++) {
        var input = inputArray[i];

        // Save defaults to state
        var state = this.get("state");
        if (input.value !== undefined && state[input.id] === undefined) {
          state[input.id] = input.value;
        }

        input.parentNode = this;
        input = new Input.Model(input);
        this.inputs.add(input);
      }

      // Convert outputs array to backbone collection
      var outputArray = this.outputs;
      this.outputs = new Output.Collection();
      this.outputs.parentNode = this;
      for(i=0; i<outputArray.length; i++) {
        var output = outputArray[i];
        output.parentNode = this;
        output = new Output.Model(output);
        this.outputs.add(output);
      }

      // Selection event
      this.on("change:selected", this.changeSelected, this);

    },
    changeSelected: function() {
      if (this.get("selected")){
        this.parentGraph.trigger("select:node", this);
      }
    },
    setState: function (name, value) {
      var state = this.get("state");
      if (state[name] === value) {
        return;
      }
      state[name] = value;
      if (this["input"+name]){
        this["input"+name](value);
      }
      this.trigger("change:state", name, value); //TODO: design this
    },
    setBang: function (name) {
      if (this["input"+name]){
        this["input"+name]();
      }
      this.trigger("bang", name);
    },
    send: function (name, value) {
      // This isn't the only way that values are sent, see github.com/forresto/dataflow-webaudio
      // Values sent here will not be `set()` on the recieving node
      // The listener is set up in Edge/initialize

      // To make this synchronous
      // this.trigger("send:"+name, value);

      // Otherwise, to make this safe for infinite loops
      var self = this;
      _.defer(function(){
        self.trigger("send:"+name, value);
      });
    },
    recieve: function (name, value) {
      // The listener is set up in Edge/initialize
      if ( typeof this["input"+name] === "function" ) {
        this["input"+name](value);
      } else {
        this["_"+name] = value;
      }
    },
    remove: function(){
      // Node removed from graph's nodes collection
      this.inputs.each(function(input){
        input.remove();
      });
      this.outputs.each(function(output){
        output.remove();
      });
      this.unload();
      this.collection.remove(this);
    },
    unload: function(){
      // Stop any processes that need to be stopped
    },
    toString: function(){
      return this.id + " ("+this.type+")";
    },
    toJSON: function(){
      return {
        id: this.get("id"),
        label: this.get("label"),
        type: this.get("type"),
        x: this.get("x"),
        y: this.get("y"),
        state: this.get("state")
      };
    },
    inputs:[
      // {
      //   id: "input",
      //   type: "all"
      // }
    ],
    outputs:[
      // {
      //   id:"output",
      //   type: "all"
      // }
    ]
  });

  Node.Collection = Backbone.Collection.extend({
    model: Node.Model,
    comparator: function(node) {
      // Sort nodes by x position
      return node.get("x");
    }
  });

}(Dataflow) );

( function(Dataflow) {

  var Input = Dataflow.prototype.module("input");
 
  Input.Model = Backbone.Model.extend({
    defaults: {
      id: "input",
      label: "",
      type: "all",
      description: ""
    },
    initialize: function() {
      this.parentNode = this.get("parentNode");
      if (this.get("label")===""){
        this.set({label: this.id});
      }
      this.connected = [];
    },
    connect: function(edge){
      this.connected.push(edge);
      this.connected = _.uniq(this.connected);
    },
    disconnect: function(edge){
      this.connected = _.without(this.connected, edge);
    },
    remove: function(){
      // Port removed from node's inputs collection
      // Remove related edges
      while (this.connected.length > 0) {
        this.connected[0].remove();
      }
    }

  });

  Input.Collection = Backbone.Collection.extend({
    model: Input.Model
  });

}(Dataflow) );

( function(Dataflow) {

  var Input = Dataflow.prototype.module("input");
  var Output = Dataflow.prototype.module("output");
 
  // Output extends input
  Output.Model = Input.Model.extend({
    defaults: {
      id: "output",
      label: "",
      type: "all",
      description: ""
    }
  });

  Output.Collection = Backbone.Collection.extend({
    model: Output.Model
  });

}(Dataflow) );

( function(Dataflow) {

  var Edge = Dataflow.prototype.module("edge");

  Edge.Model = Backbone.Model.extend({
    defaults: {
      "z": 0,
      "route": 0,
      "selected": false
    },
    initialize: function() {
      var nodes, sourceNode, targetNode;
      var preview = this.get("preview");
      this.parentGraph = this.get("parentGraph");
      if (preview) {
        // Preview edge
        nodes = this.get("parentGraph").nodes;
        var source = this.get("source");
        var target = this.get("target");
        if (source) {
          sourceNode = nodes.get( this.get("source").node );
          this.source = sourceNode.outputs.get( this.get("source").port );
        } else if (target) {
          targetNode = nodes.get( this.get("target").node );
          this.target = targetNode.inputs.get( this.get("target").port );
        }
      } else {
        // Real edge
        // this.parentGraph = this.get("parentGraph");
        nodes = this.parentGraph.nodes;
        try{
          sourceNode = nodes.get( this.get("source").node );
          this.source = sourceNode.outputs.get( this.get("source").port );
          targetNode = nodes.get( this.get("target").node );
          this.target = targetNode.inputs.get( this.get("target").port );
        }catch(e){
          // Dataflow.log("node or port not found for edge", this);
        }

        this.source.connect(this);
        this.target.connect(this);

        // Set up listener
        sourceNode.on("send:"+this.source.id, this.send, this);

        this.bringToTop();

        // Selection event
        this.on("select", this.select, this);
      }
    },
    select: function() {
      this.parentGraph.trigger("select:edge", this);
    },
    send: function (value) {
      this.target.parentNode.recieve( this.target.id, value );
    },
    isConnectedToPort: function(port) {
      return ( this.source === port || this.target === port );
    },
    isConnectedToNode: function(node) {
      return ( this.source.parentNode === node || this.target.parentNode === node );
    },
    toString: function(){
      return this.get("source").node+":"+this.get("source").port+"::"+this.get("target").node+":"+this.get("target").port;
    },
    toJSON: function(){
      return {
        source: this.get("source"),
        target: this.get("target"),
        route: this.get("route")
      };
    },
    bringToTop: function(){
      var topZ = 0;
      this.parentGraph.edges.each(function(edge){
        if (edge !== this) {
          var thisZ = edge.get("z");
          if (thisZ > topZ) {
            topZ = thisZ;
          }
          if (edge.view){
            edge.view.unhighlight();
          }
        }
      }, this);
      this.set("z", topZ+1);
    },
    remove: function(){
      this.source.disconnect(this);
      this.target.disconnect(this);
      if (this.collection) {
        this.collection.remove(this);
      }

      // Remove listener
      this.source.parentNode.off("send:"+this.source.id, this.send, this);
    }
  });

  Edge.Collection = Backbone.Collection.extend({
    model: Edge.Model,
    comparator: function(edge) {
      // Sort edges by z order (z set by clicking; not saved to JSON)
      return edge.get("z");
    }
  });

}(Dataflow) );

(function(Dataflow) {

  var Graph = Dataflow.prototype.module("graph");

  // Dependencies
  var Node = Dataflow.prototype.module("node");
  var Edge = Dataflow.prototype.module("edge");

  var minZoom = 0.20;
  var maxZoom = 1.1;

  var cssZoomSupported = document.createElement("div").style.hasOwnProperty("zoom");

  var template = 
    '<div class="dataflow-graph-panzoom">'+
      '<div class="dataflow-graph zoom-normal">'+
        '<div class="dataflow-edges">'+
          '<svg class="dataflow-svg-edges" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" width="800" height="800"></svg>'+
        '</div>'+
        '<div class="dataflow-nodes" />'+
      '</div>'+
    '</div>'+
    '<div class="dataflow-graph-controls">'+
      '<button class="dataflow-graph-gotoparent"><i class="icon-chevron-left"></i> back to parent</button>'+
    '</div>';

  Graph.View = Backbone.View.extend({
    template: _.template(template),
    className: "dataflow-g",
    events: {
      "click .dataflow-graph": "deselect",
      "dragstart .dataflow-graph-panzoom": "panStart",
      "drag .dataflow-graph-panzoom": "pan",
      "dragstop .dataflow-graph-panzoom": "panStop",
      "click .dataflow-graph-gotoparent": "gotoParent",
      "mousewheel": "mouseWheel"
      // ".dataflow-graph transformstart": "pinchStart",
      // ".dataflow-graph transform": "pinch",
      // ".dataflow-graph transformend": "pinchEnd"
    },
    initialize: function() {
      // Graph container
      this.$el.html(this.template(this.model.toJSON()));

      var nodes = this.model.get("nodes");
      var edges = this.model.get("edges");

      // Initialize nodes
      this.nodes = nodes.view = {};
      this.model.nodes.each(this.addNode, this);
      this.model.nodes.on("add", this.addNode, this);
      this.model.nodes.on("remove", this.removeNode, this);
      // Initialize edges
      this.edges = edges.view = {};
      this.model.edges.each(this.addEdge, this);
      this.model.edges.on("add", this.addEdge, this);
      this.model.edges.on("remove", this.removeEdge, this);

      // For subgraphs only: navigate up
      var parentNode = this.model.get("parentNode");
      if (!parentNode){
        this.$(".dataflow-graph-controls").hide();
      }

      this.$(".dataflow-graph-panzoom").draggable({
        helper: function(){
          var h = $("<div>");
          this.model.dataflow.$el.append(h);
          return h;
        }.bind(this)
      });

      // Cache the graph div el
      this.$graphEl = this.$(".dataflow-graph");
      this.graphEl = this.$(".dataflow-graph")[0];

      // Default 3D transform
      this.$graphEl.css({
        transform: "translate3d(0, 0, 0) " +
                   "scale3d(1, 1, 1) ",
        transformOrigin: "left top"
      });

      this.bindInteraction();
    },
    panStartOffset: null,
    panStart: function (event, ui) {
      if (!ui) { return; }
      this.panStartOffset = ui.offset;
    },
    pan: function (event, ui) {
      if (!ui) { return; }
      var scale = this.model.get('zoom');
      var deltaX = ui.offset.left - this.panStartOffset.left;
      var deltaY = ui.offset.top - this.panStartOffset.top;
      this.$(".dataflow-graph").css({
        transform: "translate3d("+deltaX/scale+"px, "+deltaY/scale+"px, 0)"
      });
    },
    panStop: function (event, ui) {
      this.$(".dataflow-graph").css({
        transform: "translate3d(0, 0, 0)"
      });
      var scale = this.model.get('zoom');
      var deltaX = ui.offset.left - this.panStartOffset.left;
      var deltaY = ui.offset.top - this.panStartOffset.top;
      this.model.set({
        panX: this.model.get("panX") + deltaX/scale,
        panY: this.model.get("panY") + deltaY/scale
      });
    },
    tempPanX: 0,
    tempPanY: 0,
    setPanDebounce: _.debounce(function () {
      // Moves the graph back to 0,0 and changes pan, which will rerender wires
      this.$(".dataflow-graph").css({
        transform: "translate3d(0, 0, 0)"
      });
      this.model.set({
        panX: this.model.get("panX") + this.tempPanX,
        panY: this.model.get("panY") + this.tempPanY
      });
      this.tempPanX = 0;
      this.tempPanY = 0;
    }, 250),
    mouseWheel: function (event) {
      event.preventDefault();
      var oe = event.originalEvent;
      this.tempPanX += oe.wheelDeltaX/6;
      this.tempPanY += oe.wheelDeltaY/6;
      this.$(".dataflow-graph").css({
        transform: "translate3d("+this.tempPanX+"px, "+this.tempPanY+"px, 0)"
      });
      this.setPanDebounce();
    },
    gotoParent: function () {
      var parentNode = this.model.get("parentNode");
      if (parentNode){
        this.model.dataflow.showGraph( parentNode.parentGraph );
      }
    },
    bindInteraction: function () {
      this.bindZoom();
      this.bindScroll();
    },
    bindZoom: function () {
      if (!window.Hammer) {
        return;
      }
      var currentZoom, startX, startY, originX, originY, scale, deltaX, deltaY, distance_to_origin_x, distance_to_origin_y;
      var self = this;
      Hammer( this.$(".dataflow-graph-panzoom")[0] )
        .on('transformstart', function (event) {
          currentZoom = self.model.get('zoom');
          startX = event.gesture.center.pageX;
          startY = event.gesture.center.pageY;
          originX = startX/currentZoom;
          originY = startY/currentZoom;
          var graphOffset = self.$el.offset();
          distance_to_origin_x = originX - graphOffset.left;
          distance_to_origin_y = originY - graphOffset.top;
          self.$graphEl.css({
            transformOrigin: originX+"px "+originY+"px"
            // transformOrigin: startX+"px "+startY+"px"
          });
        })
        .on('transform', function (event) {
          scale = Math.max(minZoom/currentZoom, Math.min(event.gesture.scale, maxZoom/currentZoom));
          deltaX = (event.gesture.center.pageX - startX) / currentZoom;
          deltaY = (event.gesture.center.pageY - startY) / currentZoom;
          self.$graphEl.css({
            transform: "translate3d("+deltaX+"px,"+deltaY+"px, 0) " +
                       "scale3d("+scale+","+scale+", 1) "
          });
        })
        .on('transformend', function (event) {
          // Reset 3D transform
          self.$graphEl.css({
            transform: "translate3d(0, 0, 0) " +
                       "scale3d(1, 1, 1) "
          });
          // Zoom
          var zoom = currentZoom * scale;
          zoom = Math.max(minZoom, Math.min(zoom, maxZoom));
          self.model.set('zoom', zoom);
          distance_to_origin_x *= zoom;
          distance_to_origin_y *= zoom;
          self.model.set({
            panX: self.model.get("panX") + deltaX,
            panY: self.model.get("panY") + deltaY
          });
          console.log(self.model.attributes);
        });

      var onZoom = function () {
        var z = self.model.get('zoom');
        var lastClass = self.zoomClass;
        self.zoomClass = z < 0.5 ? "zoom-tiny" : (z < 0.8 ? "zoom-small" : (z < 1.3 ? "zoom-normal" : "zoom-big"));
        self.$graphEl
          .removeClass(lastClass)
          .addClass(self.zoomClass);
        self.graphEl.style.zoom = self.model.get('zoom');
      };

      this.model.on('change:zoom', onZoom);

      // Initial zoom this.model from localStorage
      if (this.model.get('zoom') !== 1) {
        onZoom();
      }
    },
    zoomClass: 1,
    zoomIn: function () {
      var currentZoom = this.model.get('zoom');
      var zoom = currentZoom * 0.9;
      zoom = Math.max(minZoom, zoom); 
      if (zoom !== currentZoom) {
        this.model.set('zoom', zoom);
      }
    },
    zoomOut: function () {
      var currentZoom = this.model.get('zoom');
      var zoom = currentZoom * 1.1;
      zoom = Math.min(maxZoom, zoom); 
      if (zoom !== currentZoom) {
        this.model.set('zoom', zoom);
      }
    },
    zoomCenter: function () {
      var currentZoom = this.model.get('zoom');
      var zoom = 1;
      if (zoom !== currentZoom) {
        this.model.set('zoom', 1);
      }
    },
    bindScroll: function () {
    },
    render: function() {
      // HACK to get them to show correct positions on load
      var self = this;
      _.defer(function(){
        self.rerenderEdges();
      }, this);

      return this;
    },
    addNode: function(node){
      // Initialize
      var CustomType = this.model.dataflow.nodes[node.type];
      if (CustomType && CustomType.View) {
        node.view = new CustomType.View({
          model:node,
          graph: this
        });
      } else {
        var BaseNode = this.model.dataflow.node("base");
        node.view = new BaseNode.View({
          model:node,
          graph: this
        });
      }
      // Save to local collection
      this.nodes[node.id] = node.view;
      // Render
      node.view.render();
      this.$(".dataflow-nodes").append(node.view.el);
    },
    removeNode: function(node){
      node.view.remove();
      this.nodes[node.id] = null;
      delete this.nodes[node.id];
    },
    addEdge: function(edge){
      // Initialize
      edge.view = new Edge.View({model:edge});
      // Save to local collection
      this.edges[edge.id] = edge.view;
      // Render
      edge.view.render();
      this.$('.dataflow-svg-edges')[0].appendChild(edge.view.el);
    },
    removeEdge: function(edge){
      if (edge.view) {
        edge.view.remove();
      }
      this.edges[edge.id] = null;
      delete this.edges[edge.id];
    },
    rerenderEdges: function(){
      _.each(this.edges, function(edgeView){
        edgeView.render();
      }, this);
    },
    sizeSVG: function(){
      // TODO timeout to not do this with many edge resizes at once
      try{
        var svg = this.$('.dataflow-svg-edges')[0];
        var rect = svg.getBBox();
        var width =  Math.max( Math.round(rect.x+rect.width +50), 50 );
        var height = Math.max( Math.round(rect.y+rect.height+50), 50 );
        svg.setAttribute("width", width);
        svg.setAttribute("height", height);
      } catch (error) {}
    },
    deselect: function () {
      this.model.nodes.invoke("set", {selected:false});
      this.model.edges.invoke("set", {selected:false});
      // this.model.nodes.each(function (node) {
      //   node.set("selected", false);
      // }, this);
      this.model.trigger("selectionChanged");
      this.unfade();
      this.model.dataflow.hideMenu();
    },
    fade: function () {
      this.model.nodes.each(function(node){
        if (node.view) {
          node.view.fade();
        }
      });
      this.fadeEdges();
    },
    fadeEdges: function () {
      this.model.edges.each(function(edge){
        if (edge.get("selected") || edge.source.parentNode.get("selected") || edge.target.parentNode.get("selected")) {
          edge.view.unfade();
        } else {
          edge.view.fade();
        }
      });
    },
    unfade: function () {
      this.model.nodes.each(function(node){
        if (node.view) {
          node.view.unfade();
        }
      });
      this.model.edges.each(function(edge){
        if (edge.view) {
          edge.view.unfade();
        }
      });
    }
  });

}(Dataflow) );

( function(Dataflow) {

  var Node = Dataflow.prototype.module("node");

  // Dependencies
  var Input = Dataflow.prototype.module("input");
  var Output = Dataflow.prototype.module("output");

  var template = 
    '<div class="outer" />'+
    '<div class="dataflow-node-header">'+
      '<h1 class="dataflow-node-title" title="<%- label %>: <%- type %>"><%- label %></h1>'+
    '</div>'+
    '<div class="dataflow-node-ports">'+
      '<div class="dataflow-node-ins"></div>'+
      '<div class="dataflow-node-outs"></div>'+
      '<div style="clear:both;"></div>'+
    '</div>'+
    '<div class="dataflow-node-inner"></div>';

  var innerTemplate = "";

  var zoom;
 
  Node.View = Backbone.View.extend({
    template: _.template(template),
    innerTemplate: _.template(innerTemplate),
    className: "dataflow-node",
    events: function(){
      return {
        "click .dataflow-node-header":  "select",
        "dragstart": "dragStart",
        "drag":      "drag",
        "dragstop":  "dragStop"
      };
    },
    initialize: function(options) {
      this.$el.html(this.template(this.model.toJSON()));

      this.graph = options.graph;

      // Add type class
      this.$el.addClass(this.model.type);

      if (!this.model.parentGraph.dataflow.editable) {
        // No edit name
        this.$(".dataflow-node-edit").hide();
      }

      // Initialize i/o views
      this.inputs = this.model.inputs.view = new Input.CollectionView({
        collection: this.model.inputs,
        parent: this
      });
      // Outs
      this.outputs = this.model.outputs.view = new Output.CollectionView({
        collection: this.model.outputs,
        parent: this
      });

      var self = this;
      this.$el.draggable({
        handle: "h1",
        helper: function(){
          return $('<div>');
        }
      });

      this.$el.data("dataflow-node-view", this);

      // Inner template
      this.$(".dataflow-node-inner").append(this.innerTemplate);

      // Listener to reset inputs list
      // this.inputs.on("change", function(input){
      //   this.$inputsList = null;
      // }, this);

      // Listen for graph panning
      this.listenTo(this.model.parentGraph, "change:panX change:panY", this.bumpPosition);

      // Selected listener
      this.listenTo(this.model, "change:selected", this.selectedChanged);

      this.listenTo(this.model, "change:label", this.changeLabel);

      this.$inner = this.$(".dataflow-node-inner");
    },
    render: function() {
      // Initial position
      this.$el.css({
        left: this.model.get("x") + this.model.parentGraph.get("panX"),
        top: this.model.get("y") + this.model.parentGraph.get("panY")
      });

      this.$(".dataflow-node-ins").html(this.inputs.el);
      this.$(".dataflow-node-outs").html(this.outputs.el);

      // Hide controls
      this.$(".dataflow-node-controls").hide();
      this.$(".label-edit").hide();

      return this;
    },
    _alsoDrag: [],
    _dragDelta: {},
    $dragHelpers: $('<div class="dataflow-nodes-helpers">'),
    dragStart: function(event, ui){
      if (!ui){ return; }
      // Select this
      if (!this.model.get("selected")){
        this.select(event, true);
      }

      // Don't drag graph
      event.stopPropagation();

      // Current zoom
      zoom = this.model.parentGraph.get('zoom');

      this.$dragHelpers.css({
        transform: "translate3d(0,0,0)"
      });
      this.$el.parent().append( this.$dragHelpers );

      // Make helper and save start position of all other selected
      var self = this;
      this._alsoDrag = this.model.collection.where({selected:true});

      _.each(this._alsoDrag, function(node){
        var $el = node.view.$el;
        // Add helper
        var helper = $('<div class="dataflow-node helper">').css({
          width: $el.width(),
          height: $el.height(),
          left: parseInt($el.css('left'), 10),
          top: parseInt($el.css('top'), 10)
        });
        this.$dragHelpers.append(helper);
      }, this);

    },
    changeLabel: function () {
      var label = this.model.get("label");
      var type = this.model.get("type");
      this.$(".dataflow-node-title")
        .text( label )
        .attr("title", label + ": " + type);
    },
    drag: function(event, ui){
      if (!ui){ return; }
      // Don't drag graph
      event.stopPropagation();

      var x = (ui.position.left - ui.originalPosition.left) / zoom;
      var y = (ui.position.top - ui.originalPosition.top) / zoom;
      this.$dragHelpers.css({
        transform: "translate3d("+x+"px,"+y+"px,0)"
      });
    },
    dragStop: function(event, ui){
      if (!ui){ return; }
      // Don't drag graph
      event.stopPropagation();

      var panX = this.model.parentGraph.get("panX");
      var panY = this.model.parentGraph.get("panY");
      var deltaX = (ui.position.left - ui.originalPosition.left) / zoom;
      var deltaY = (ui.position.top - ui.originalPosition.top) / zoom;
      // this.moveToPosition(this.model.get("x") + deltaX, this.model.get("y") + deltaY);
      // Also drag
      if (this._alsoDrag.length) {
        _.each(this._alsoDrag, function(node){
          node.view.moveToPosition(node.get("x") + deltaX, node.get("y") + deltaY);
        }, this);
        this._alsoDrag = [];
      }
      // Remove helpers
      this.$dragHelpers.empty();
      this.$dragHelpers.remove();
    },
    bumpPosition: function () {
      this.$el.css({
        left: this.model.get("x") + this.model.parentGraph.get("panX"),
        top: this.model.get("y") + this.model.parentGraph.get("panY")
      });
      this.model.trigger("change:x change:y");
    },
    moveToPosition: function(x, y){
      this.model.set({
        x: x,
        y: y
      }, {
        // Don't trigger wire move until bumped
        silent: true
      });
      this.bumpPosition();
    },
    removeModel: function(){
      this.model.remove();
    },
    bringToTop: function () {
      var topZ = 0;
      this.model.collection.each(function(node){
        var thisZ = parseInt(node.view.el.style.zIndex, 10);
        if (thisZ > topZ) {
          topZ = thisZ;
        }
      }, this);
      this.el.style.zIndex = topZ+1;
    },
    select: function(event, deselectOthers){
      // Don't click graph
      if (event) {
        event.stopPropagation();
      }
      var toggle = false;
      var selected = this.model.get("selected");
      if (event && (event.ctrlKey || event.metaKey)) {
        toggle = true;
        selected = !selected;
        this.model.set("selected", selected);
        if (!selected) {
          this.fade();
        }
      } else {
        // Deselect all
        this.model.parentGraph.edges.invoke("set", {selected:false});
        this.model.parentGraph.nodes.invoke("set", {selected:false});
        this.model.parentGraph.view.fade();
        selected = true;
        this.model.set("selected", true);
        this.showInspector();
      }
      this.bringToTop();
      this.model.parentGraph.view.fadeEdges();
      this.model.parentGraph.trigger("selectionChanged");
    },
    inspector: null,
    getInspector: function () {
      if (!this.inspector) {
        this.inspector = new Node.InspectView({model:this.model});
      }
      return this.inspector;
    },
    showInspector: function () {
      this.model.parentGraph.dataflow.showMenu("inspector");
      var $inspectMenu = this.model.parentGraph.dataflow.$(".dataflow-plugin-inspector");
      $inspectMenu.children().detach();
      $inspectMenu.append( this.getInspector().el );
    },
    fade: function(){
      this.$el.addClass("fade");
      this.$el.removeClass("ui-selected");
    },
    unfade: function(){
      this.$el.removeClass("fade");
    },
    selectedChanged: function () {
      if (this.model.get("selected")) {
        this.highlight();
      } else {
        this.unhighlight();
      }
    },
    highlight: function () {
      this.$el.removeClass("fade");
      this.$el.addClass("ui-selected");
    },
    unhighlight: function () {
      this.$el.removeClass("ui-selected");
    }//,
    // $inputList: null,
    // getInputList: function() {
    //   if (!this.$inputList) {
    //     this.$inputList = $("<div>");
    //     var model = this.model.toJSON();
    //     this.$inputList.html( this.inspectTemplate(model) );
    //     if (model.id !== model.label) {
    //       this.$inputList.children(".dataflow-node-inspector-title").prepend(model.id + ": ");
    //     }
    //     var $inputs = this.$inputList.children(".dataflow-node-inspector-inputs");
    //     this.model.inputs.each(function(input){
    //       if (input.view && input.view.$input) {
    //         $inputs.append( input.view.$input );
    //       }
    //     }, this);
    //   }
    //   return this.$inputList;
    // }
  });

}(Dataflow) );

( function(Dataflow) {

  var Input = Dataflow.prototype.module("input");

  // Dependencies
  var Edge = Dataflow.prototype.module("edge");

  var template = 
    '<span class="dataflow-port-plug in" title="drag to edit wire"></span>'+ //i18n
    '<span class="dataflow-port-hole in" title="drag to make new wire"></span>'+ //i18n
    '<label class="dataflow-port-label in" title="<%= description %>">'+
      '<%= label %>'+
    '</label>';  

  var zoom = 1;
 
  Input.View = Backbone.View.extend({
    template: _.template(template),
    tagName: "li",
    className: "dataflow-port dataflow-in",
    events: {
      "click":  "getTopEdge",
      "drop":   "connectEdge",
      "dragstart .dataflow-port-hole":  "newEdgeStart",
      "drag      .dataflow-port-hole":  "newEdgeDrag",
      "dragstop  .dataflow-port-hole":  "newEdgeStop",
      "dragstart .dataflow-port-plug":  "changeEdgeStart",
      "drag      .dataflow-port-plug":  "changeEdgeDrag",
      "dragstop  .dataflow-port-plug":  "changeEdgeStop"
    },
    $input: null,
    initialize: function(options) {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.addClass(this.model.get("type"));

      this.parent = options.parent;

      // Reset hole position
      var node = this.parent.model;
      var graph = node.parentGraph;
      this.listenTo(node, "change:x change:y", function(){
        this._holePosition = null;
      }.bind(this));
      this.listenTo(graph, "change:panX change:panY", function(){
        this._holePosition = null;
      }.bind(this));

      if (!this.model.parentNode.parentGraph.dataflow.editable) {
        // No drag and drop
        return;
      }

      var self = this;
      this.$(".dataflow-port-plug").draggable({
        cursor: "pointer",
        helper: function(){
          var helper = $('<span class="dataflow-port-plug in helper" />');
          self.parent.graph.$el.append(helper);
          return helper;
        },
        disabled: true,
        // To prevent accidental disconnects
        distance: 10,
        delay: 100
      });
      this.$(".dataflow-port-hole").draggable({
        cursor: "pointer",
        helper: function(){
          var helper = $('<span class="dataflow-port-plug out helper" />')
            .data({port: self.model});
          self.parent.graph.$el.append(helper);
          return helper;
        }
      });
      this.$el.droppable({
        accept: ".dataflow-port-plug.in, .dataflow-port-hole.out",
        activeClassType: "droppable-hover",
        refreshPositions: true
      });

      if (!this.model.parentNode.parentGraph.dataflow.inputs) {
        // No direct inputs
        return;
      }

      // Initialize direct input
      var type = this.model.get("type");
      var state = this.model.parentNode.get("state");
      options = this.model.get("options");
      if (options !== undefined) {
        // Normalize options
        if (_.isString(options)) {
          options = options.split(' ');
          this.model.set('options', options);
        }
        if (_.isArray(options)) {
          var o = {};
          for (var i=0; i<options.length; i++){
            o[options[i]] = options[i];
          }
          options = o;
          this.model.set('options', options);
        }
      }
      var input = this.renderInput(type, options);

      var val;
      if (state && state[this.model.id] !== undefined){
        // Use the stored state
        val = state[this.model.id];
      } else if (this.model.get("value") !== undefined) {
        // Use the default
        val = this.model.get("value");
      }

      this.setInputValue(input, type, val);

      this.model.parentNode.on('change:state', function () {
        var state = this.model.parentNode.get('state');
        if (!state || state[this.model.id] === undefined) {
          return;
        }
        this.setInputValue(input, type, state[this.model.id]);
      }.bind(this));

      var label = $("<label>")
        .append( input )
        .prepend( '<span>' + this.model.get("label") + "</span> " );
      this.$input = label;

    },
    renderInput: function (type, options) {
      var input;
      if (options) {
        input = $('<select class="input input-select">');
        for (var name in options) {
          var option = $('<option value="'+options[name]+'">'+name+'</option>')
            .data("val", options[name]);
          input.append(option);
        }
        input.change(this.inputSelect.bind(this));
        return input;
      }

      switch (type) {
        case 'int':
        case 'float':
        case 'number':
          var attributes = {};
          if (this.model.get("min") !== undefined) {
            attributes.min = this.model.get("min");
          }
          if (this.model.get("max") !== undefined) {
            attributes.max = this.model.get("max");
          }
          if (type === "int") {
            attributes.step = 1;
          }
          input = $('<input type="number" class="input input-number">')
            .attr(attributes)
            .addClass(type === "int" ? "input-int" : "input-float");
          if (type == 'int') {
            input.change(this.inputInt.bind(this));
          } else {
            input.change(this.inputFloat.bind(this));
          }
          return input;
        case 'boolean':
          input = $('<input type="checkbox" class="input input-boolean">');
          input.change(this.inputBoolean.bind(this));
          return input;
        case 'object':
          input = $('<textarea class="input input-object"></textarea>');
          input.on('change, keyup', this.inputObject.bind(this));
          return input;
        case 'bang':
          input = $('<button class="input input-bang">!</button>');
          input.click(this.inputBang.bind(this));
          return input;
        default:
          input = $('<input class="input input-string">');
          input.change(this.inputString.bind(this));
          return input;
      }
    },
    setInputValue: function (input, type, value) {
      if (!input) {
        return;
      }
      if (input[0].tagName === 'SELECT') {
        $('option', input).each(function () {
          var selectVal = $(this).data('val');
          $(this).prop('selected', selectVal == value);
        });
        return;
      }
      if (type === 'boolean') {
        input.prop('checked', value);
        return;
      }
      if (type === 'object') {
        input.text(JSON.stringify(value, null, 2));
        return;
      }
      input.val(value);
    },
    inputSelect: function(e){
      var val = $(e.target).find(":selected").data("val");
      this.model.parentNode.setState(this.model.id, val);
    },
    inputInt: function(e){
      this.model.parentNode.setState(this.model.id, parseInt($(e.target).val(), 10));
    },
    inputFloat: function(e){
      this.model.parentNode.setState(this.model.id, parseFloat($(e.target).val()));
    },
    inputString: function(e){
      this.model.parentNode.setState(this.model.id, $(e.target).val());
    },
    inputBoolean: function(e){
      this.model.parentNode.setState(this.model.id, $(e.target).prop("checked"));
    },
    inputObject: function(e){
      try {
        var obj = JSON.parse($(e.target).text());
        this.model.parentNode.setState(this.model.id, obj);
      } catch (err) {
        // TODO: We need error handling in the form
      }
    },
    inputBang: function(){
      this.model.parentNode.setBang(this.model.id);
    },
    render: function(){
      return this;
    },
    newEdgeStart: function(event, ui){
      if (!ui) { return; }
      // Don't drag node
      event.stopPropagation();
      
      ui.helper.data({
        route: this.topRoute
      });
      this.previewEdgeNew = new Edge.Model({
        target: {
          node: this.model.parentNode.id,
          port: this.model.id
        },
        parentGraph: this.model.parentNode.parentGraph,
        preview: true,
        route: this.topRoute
      });
      this.previewEdgeNewView = new Edge.View({
        model: this.previewEdgeNew
      });
      var graphSVGElement = this.model.parentNode.parentGraph.view.$('.dataflow-svg-edges')[0];
      graphSVGElement.appendChild(this.previewEdgeNewView.el);

      zoom = this.model.parentNode.parentGraph.get('zoom');
    },
    newEdgeDrag: function(event, ui){
      if (!this.previewEdgeNewView || !ui) {
        return;
      }
      // Don't drag node
      event.stopPropagation();

      ui.position.top = event.clientY / zoom;
      ui.position.left = event.clientX / zoom;
      var df = this.model.parentNode.parentGraph.view.el;
      ui.position.left += df.scrollLeft;
      ui.position.top += df.scrollTop;
      this.previewEdgeNewView.render({
        left: ui.position.left - df.scrollLeft,
        top: ui.position.top - df.scrollTop
      });
      this.model.parentNode.parentGraph.view.sizeSVG();
    },
    newEdgeStop: function(event, ui){
      // Don't drag node
      event.stopPropagation();

      // Clean up preview edge
      this.previewEdgeNewView.remove();
      delete this.previewEdgeNew;
      delete this.previewEdgeNewView;
    },
    getTopEdge: function() {
      var topEdge;
      var topZ = -1;
      if (this.isConnected){
        // Will get the top matching edge
        this.model.parentNode.parentGraph.edges.each(function(edge){
          var thisZ = edge.get("z");
          if(edge.target === this.model && thisZ > topZ ){
            topEdge = edge;
            topZ = thisZ;
          }
          if (edge.view) {
            edge.view.unhighlight();
          }
        }, this);
        if (topEdge && topEdge.view) {
          topEdge.view.bringToTop();
        }
      }
      return topEdge;
    },
    changeEdgeStart: function(event, ui){
      if (!ui) { return; }
      // Don't drag node
      event.stopPropagation();

      if (this.isConnected){
        var changeEdge = this.getTopEdge();
        if (changeEdge){
          // Remove edge
          changeEdge.remove();

          // Make preview
          if (ui) {
            ui.helper.data({
              port: changeEdge.source,
              route: changeEdge.get("route")
            });
          }
          this.previewEdgeChange = new Edge.Model({
            source: changeEdge.get("source"),
            route: changeEdge.get("route"),
            parentGraph: this.model.parentNode.parentGraph,
            preview: true
          });
          this.previewEdgeChangeView = new Edge.View({
            model: this.previewEdgeChange
          });
          var graphSVGElement = this.model.parentNode.parentGraph.view.$('.dataflow-svg-edges')[0];
          graphSVGElement.appendChild(this.previewEdgeChangeView.el);
          
          zoom = this.model.parentNode.parentGraph.get('zoom');
        }
      }
    },
    changeEdgeDrag: function(event, ui){
      if (!ui) { return; }
      // Don't drag node
      event.stopPropagation();
      
      if (this.previewEdgeChange) {
        this.previewEdgeChangeView.render(ui.offset);
        this.model.parentNode.parentGraph.view.sizeSVG();
      }
    },
    changeEdgeStop: function(event, ui){
      // Don't drag node
      event.stopPropagation();

      // Clean up preview edge
      if (this.previewEdgeChange) {
        this.previewEdgeChangeView.remove();
        delete this.previewEdgeChange;
        delete this.previewEdgeChangeView;
      }
    },
    connectEdge: function(event, ui) {
      // Dropped to this el
      var otherPort = ui.helper.data("port");
      var oldLength = this.model.parentNode.parentGraph.edges.length;

      if (otherPort.parentNode.parentGraph.dataflow !== this.model.parentNode.parentGraph.dataflow) {
        // from another widget
        return false;
      }

      var route = 0;
      if (ui.helper.data("route") !== undefined) {
        route = ui.helper.data("route");
      }

      this.model.parentNode.parentGraph.edges.add({
        id: otherPort.parentNode.id+":"+otherPort.id+"::"+this.model.parentNode.id+":"+this.model.id,
        parentGraph: this.model.parentNode.parentGraph,
        source: {
          node: otherPort.parentNode.id,
          port: otherPort.id
        },
        target: {
          node: this.model.parentNode.id,
          port: this.model.id
        },
        route: route
      });
      // Tells changeEdgeStop to remove to old edge
      ui.helper.data("removeChangeEdge", (oldLength < this.model.parentNode.parentGraph.edges.length));
    },
    _holePosition: null,
    holePosition: function(){
      // this._holePosition gets reset when graph panned or node moved
      if (!this._holePosition) {
        if (!this.parent){
          this.parent = this.options.parent;
        }
        var node = this.parent.model;
        var graph = node.parentGraph;
        var $graph = this.parent.graph.$el;
        var index = this.$el.index();
        var left = graph.get("panX") + node.get("x") + 18;
        var top = graph.get("panY") + node.get("y") + 48 + index*20;
        this._holePosition = { left:left, top:top };
      }
      return this._holePosition;
    },
    isConnected: false,
    plugSetActive: function(){
      try {
        this.$(".dataflow-port-plug").draggable("enable");
      } catch (e) { }
      this.$(".dataflow-port-plug, .dataflow-port-hole").addClass("active");
      this.isConnected = true;
    },
    plugCheckActive: function(){
      var topEdge;
      var topEdgeZ = -1;
      this.model.parentNode.parentGraph.edges.each(function(edge){
        if (edge.target === this.model) {
          var z = edge.get("z");
          if (z > topEdgeZ) {
            topEdge = edge;
            topEdgeZ = z;
          }
        }
      }, this);
      if (topEdge) {
        this.bringToTop(topEdge);
      } else {
        try {
          this.$(".dataflow-port-plug").draggable("disable");
        } catch (e) { }
        this.$(".dataflow-port-plug, .dataflow-port-hole").removeClass("active");
        this.isConnected = false;
      }
    },
    topRoute: 0,
    bringToTop: function (edge) {
      var route = edge.get("route");
      if (route !== undefined) {
        this.$(".dataflow-port-hole, .dataflow-port-plug").removeClass("route"+this.topRoute);
        this.$(".dataflow-port-hole, .dataflow-port-plug").addClass("route"+route);
        this.topRoute = route;
      }
    }
  });

  Input.CollectionView = Backbone.CollectionView.extend({
    tagName: "ul",
    itemView: Input.View
  }); 

}(Dataflow) );

( function(Dataflow) {

  var Output = Dataflow.prototype.module("output");

  // Dependencies
  var Edge = Dataflow.prototype.module("edge");
 
  var template = 
    '<span class="dataflow-port-label out" title="<%= description %>"><%= label %></span>'+
    '<span class="dataflow-port-hole out" title="drag to make new wire"></span>'+
    '<span class="dataflow-port-plug out" title="drag to edit wire"></span>';

  var zoom = 1;

  Output.View = Backbone.View.extend({
    template: _.template(template),
    tagName: "li",
    className: "dataflow-port dataflow-out",
    events: {
      "click": "getTopEdge",
      "drop":  "connectEdge",
      "dragstart .dataflow-port-hole": "newEdgeStart",
      "drag      .dataflow-port-hole": "newEdgeDrag",
      "dragstop  .dataflow-port-hole": "newEdgeStop",
      "dragstart .dataflow-port-plug": "changeEdgeStart",
      "drag      .dataflow-port-plug": "changeEdgeDrag",
      "dragstop  .dataflow-port-plug": "changeEdgeStop"
    },
    initialize: function (options) {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.addClass(this.model.get("type"));

      this.parent = options.parent;

      // Reset hole position
      var node = this.parent.model;
      var graph = node.parentGraph;
      this.listenTo(node, "change:x change:y change:w", function(){
        this._holePosition = null;
      }.bind(this));
      this.listenTo(graph, "change:panX change:panY", function(){
        this._holePosition = null;
      }.bind(this));

      if (!this.model.parentNode.parentGraph.dataflow.editable) {
        // No drag and drop
        return;
      }

      var self = this;
      this.$(".dataflow-port-plug").draggable({
        cursor: "pointer",
        helper: function(){
          var helper = $('<span class="dataflow-port-plug out helper" />');
          self.parent.graph.$el.append(helper);
          return helper;
        },
        disabled: true,
        // To prevent accidental disconnects
        distance: 10,
        delay: 100
      });
      this.$(".dataflow-port-hole").draggable({
        cursor: "pointer",
        helper: function(){
          var helper = $('<span class="dataflow-port-plug in helper" />')
            .data({port: self.model});
          self.parent.graph.$el.append(helper);
          return helper;
        }
      });
      this.$el.droppable({
        accept: ".dataflow-port-plug.out, .dataflow-port-hole.in",
        activeClassType: "droppable-hover"
      });
    },
    render: function () {
      return this;
    },
    newEdgeStart: function(event, ui){
      // Don't drag node
      event.stopPropagation();
      if (!ui) { return; }

      ui.helper.data({
        route: this.topRoute
      });
      this.previewEdge = new Edge.Model({
        source: {
          node: this.model.parentNode.id,
          port: this.model.id
        },
        parentGraph: this.model.parentNode.parentGraph,
        preview: true,
        route: this.topRoute
      });
      this.previewEdgeView = new Edge.View({
        model: this.previewEdge
      });
      var graphSVGElement = this.model.parentNode.parentGraph.view.$('.dataflow-svg-edges')[0];
      graphSVGElement.appendChild(this.previewEdgeView.el);

      zoom = this.model.parentNode.parentGraph.get('zoom');

    },
    newEdgeDrag: function(event, ui){
      // Don't drag node
      event.stopPropagation();
      if (!this.previewEdgeView || !ui) {
        return;
      }
      ui.position.top = event.clientY / zoom;
      ui.position.left = event.clientX / zoom;
      var df = this.model.parentNode.parentGraph.view.el;
      ui.position.left += df.scrollLeft;
      ui.position.top += df.scrollTop;
      this.previewEdgeView.render({
        left: ui.position.left - df.scrollLeft,
        top: ui.position.top - df.scrollTop
      });
    },
    newEdgeStop: function(event, ui){
      // Don't drag node
      event.stopPropagation();

      // Clean up preview edge
      this.previewEdgeView.remove();
      delete this.previewEdge;
      delete this.previewEdgeView;
    },
    getTopEdge: function() {
      var topEdge;
      var topZ = -1;
      if (this.isConnected){
        // Will get the top matching edge
        this.model.parentNode.parentGraph.edges.each(function(edge){
          var thisZ = edge.get("z");
          if(edge.source === this.model && thisZ > topZ ){
            topEdge = edge;
            topZ = thisZ;
          }
          if (edge.view) {
            edge.view.unhighlight();
          }
        }, this);
        if (topEdge && topEdge.view) {
          topEdge.view.bringToTop();
        }
      }
      return topEdge;
    },
    changeEdgeStart: function(event, ui){
      if (!ui) { return; }
      // Don't drag node
      event.stopPropagation();

      if (this.isConnected){
        var changeEdge = this.getTopEdge();
        if (changeEdge){
          // Remove edge
          changeEdge.remove();

          // Make preview
          if (ui) {
            ui.helper.data({
              port: changeEdge.target,
              route: changeEdge.get("route")
            });
          }
          this.previewEdgeChange = new Edge.Model({
            target: changeEdge.get("target"),
            route: changeEdge.get("route"),
            parentGraph: this.model.parentNode.parentGraph,
            preview: true
          });
          this.previewEdgeChangeView = new Edge.View({
            model: this.previewEdgeChange
          });
          var graphSVGElement = this.model.parentNode.parentGraph.view.$('.dataflow-svg-edges')[0];
          graphSVGElement.appendChild(this.previewEdgeChangeView.el);

          zoom = this.model.parentNode.parentGraph.get('zoom');
        }
      }
    },
    changeEdgeDrag: function(event, ui){
      if (!ui) { return; }
      // Don't drag node
      event.stopPropagation();

      if (this.previewEdgeChange) {
        this.previewEdgeChangeView.render(ui.offset);
        this.model.parentNode.parentGraph.view.sizeSVG();
      }
    },
    changeEdgeStop: function(event, ui){
      // Don't drag node
      event.stopPropagation();

      // Clean up preview edge
      if (this.previewEdgeChange) {
        this.previewEdgeChangeView.remove();
        delete this.previewEdgeChange;
        delete this.previewEdgeChangeView;
      }
    },
    connectEdge: function(event, ui) {
      // Dropped to this el
      var otherPort = ui.helper.data("port");
      var oldLength = this.model.parentNode.parentGraph.edges.length;

      if (otherPort.parentNode.parentGraph.dataflow !== this.model.parentNode.parentGraph.dataflow) {
        // from another widget
        return false;
      }

      var route = 0;
      if (ui.helper.data("route") !== undefined) {
        route = ui.helper.data("route");
      }

      this.model.parentNode.parentGraph.edges.add({
        id: this.model.parentNode.id+":"+this.model.id+"::"+otherPort.parentNode.id+":"+otherPort.id,
        parentGraph: this.model.parentNode.parentGraph,
        source: {
          node: this.model.parentNode.id,
          port: this.model.id
        },
        target: {
          node: otherPort.parentNode.id,
          port: otherPort.id
        },
        route: route
      });
      // Tells changeEdgeStop to remove to old edge
      ui.helper.data("removeChangeEdge", (oldLength < this.model.parentNode.parentGraph.edges.length));
    },
    _holePosition: null,
    holePosition: function () {
      // this._holePosition gets reset when graph panned or node moved
      if (!this._holePosition) {
        if (!this.parent){
          this.parent = this.options.parent;
        }
        var node = this.parent.model;
        var graph = node.parentGraph;
        var $graph = this.parent.graph.$el;
        var index = this.$el.index();
        var width = node.get("w") !== undefined ? node.get("w") : 175;
        var left = graph.get("panX") + node.get("x") + width - 18;
        var top = graph.get("panY") + node.get("y") + 48 + index*20;
        this._holePosition = { left:left, top:top };
      }
      return this._holePosition;
    },
    isConnected: false,
    plugSetActive: function(){
      try {
        this.$(".dataflow-port-plug").draggable("enable");
      } catch (e) { }
      this.$(".dataflow-port-plug, .dataflow-port-hole").addClass("active");
      this.isConnected = true;
    },
    plugCheckActive: function(){
      var topEdge;
      var topEdgeZ = -1;
      this.model.parentNode.parentGraph.edges.each(function(edge){
        if (edge.source === this.model) {
          var z = edge.get("z");
          if (z > topEdgeZ) {
            topEdge = edge;
            topEdgeZ = z;
          }
        }
      }, this);
      if (topEdge) {
        this.bringToTop(topEdge);
      } else {
        try {
          this.$(".dataflow-port-plug").draggable("disable");
        } catch (e) { }
        this.$(".dataflow-port-plug, .dataflow-port-hole").removeClass("active");
        this.isConnected = false;
      }
    },
    topRoute: 0,
    bringToTop: function (edge) {
      var route = edge.get("route");
      if (route !== undefined) {
        this.$(".dataflow-port-hole").removeClass("route"+this.topRoute);
        this.$(".dataflow-port-hole").addClass("route"+route);
        this.topRoute = route;
      }
    }
  });

  Output.CollectionView = Backbone.CollectionView.extend({
    tagName: "ul",
    itemView: Output.View
  }); 

}(Dataflow) );

( function(Dataflow) {

  var Edge = Dataflow.prototype.module("edge");

  // Thanks bobince http://stackoverflow.com/a/3642265/592125
  var makeSvgElement = function(tag, attrs) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) {
      if (k === "xlink:href") {
        // Pssh namespaces...
        svg.setAttributeNS('http://www.w3.org/1999/xlink','href', attrs[k]);
      } else {
        svg.setAttribute(k, attrs[k]);
      }
    }
    return svg;
  };

  var inspectTemplate = 
    '<h1 class="dataflow-edge-inspector-title">Edge</h1>'+
    '<div class="dataflow-edge-inspector-route-choose"></div>';
    // '<div class="dataflow-edge-inspector-route route<%- route %>"><%- route %></div>';

  var addClass = function (el, name) {
    if (el.classList) {
      el.classList.add(name);
    } else {
      // Works only here
      el.className = "dataflow-edge " + name;
    }
  };

  var removeClass = function (el, name) {
    if (el.classList) {
      el.classList.remove(name);
    } else {
      el.className = "dataflow-edge"; 
    }
  };
  
  Edge.View = Backbone.View.extend({
    tagName: "div",
    className: "dataflow-edge",
    positions: null,
    inspectTemplate: _.template(inspectTemplate),
    initialize: function() {
      this.positions = {
        from: null, 
        to: null
      };
      // Render on source/target view move
      if (this.model.source) {
        this.model.source.parentNode.on("change:x change:y change:w", this.render, this);
        // this.model.source.parentNode.inputs.on("add remove", this.render, this);
        // this.model.source.parentNode.outputs.on("add remove", this.render, this);
      }
      if (this.model.target) {
        this.model.target.parentNode.on("change:x change:y", this.render, this);
      }
      // Set port plug active
      if (this.model.source && this.model.source.view) {
        // Port plug active
        this.model.source.view.plugSetActive();
        // Port hole color
        this.model.source.view.bringToTop(this.model);
      }
      if (this.model.target && this.model.target.view) {
        // Port plug active
        this.model.target.view.plugSetActive();
        // Port hole color
        this.model.target.view.bringToTop(this.model);
      }
      // Made SVG elements
      this.el = makeSvgElement("g", {
        "class": "dataflow-edge"
      });
      this.elEdge = makeSvgElement("path", {
        "class": "dataflow-edge-wire"
      });
      this.elShadow = makeSvgElement("path", {
        "class": "dataflow-edge-shadow"
      });

      // Color route
      if (this.model.get("route") !== undefined) {
        this.elEdge.setAttribute("class", "dataflow-edge-wire route"+this.model.get("route"));
      }
      // Change color on route change
      var self = this;
      this.model.on("change:route", function(){
        self.elEdge.setAttribute("class", "dataflow-edge-wire route"+self.model.get("route"));
        self.bringToTop();
      });

      this.el.appendChild(this.elShadow);
      this.el.appendChild(this.elEdge);

      // Click handler
      this.el.addEventListener("click", function(event){
        self.click(event);
      });

      // Listen for select
      this.listenTo(this.model, "change:selected", this.selectedChange);

    },
    render: function(previewPosition){
      var source = this.model.source;
      var target = this.model.target;
      var dataflowParent, graphPos;
      if (source) {
        this.positions.from = source.view.holePosition();
      }
      else {
        // Preview 
        // TODO: match zoom
        dataflowParent = this.model.parentGraph.dataflow.$el.parent().position();
        graph = this.model.parentGraph.view.$el;
        this.positions.from = {
          left: graph.scrollLeft() + previewPosition.left - 5 - dataflowParent.left,
          top:  graph.scrollTop()  + previewPosition.top + 5 - dataflowParent.top
        };
      }
      if (target) {
        this.positions.to = target.view.holePosition();
      } else {
        // Preview
        dataflowParent = this.model.parentGraph.dataflow.$el.parent().position();
        graph = this.model.parentGraph.view.$el;
        this.positions.to = {
          left: graph.scrollLeft() + previewPosition.left + 15 - dataflowParent.left,
          top:  graph.scrollTop()  + previewPosition.top + 5 - dataflowParent.top
        };
      }
      // No half-pixels
      // this.positions.from.left = Math.floor(this.positions.from.left);
      // this.positions.from.top = Math.floor(this.positions.from.top);
      // this.positions.to.left = Math.floor(this.positions.to.left);
      // this.positions.to.top = Math.floor(this.positions.to.top);
 
      // Make and apply the path
      var pathD = this.edgePath(this.positions);
      this.elEdge.setAttribute("d", pathD);
      this.elShadow.setAttribute("d", pathD);
      // Reset bounding box
      if (this.model.parentGraph && this.model.parentGraph.view){
        this.model.parentGraph.view.sizeSVG();
      }
    },
    fade: function(){
      if (this.model.source.parentNode.get("selected") || this.model.target.parentNode.get("selected")) {
        return;
      }
      addClass(this.el, "fade");
    },
    unfade: function(){
      removeClass(this.el, "fade");
    },
    selectedChange: function () {
      if (this.model.get("selected")){
        this.highlight();
      } else {
        this.unhighlight();
      }
    },
    highlight: function(){
      addClass(this.el, "highlight");
    },
    unhighlight: function(){
      removeClass(this.el, "highlight");
    },
    edgePath: function(positions){
      var extend = 20;
      var x = (positions.to.left-extend) - (positions.from.left+extend);
      var halfX = Math.floor(x/2);
      var halfX2 = x-halfX;
      var y = positions.to.top - positions.from.top;
      var halfY = Math.floor(y/2);
      var halfY2 = y-halfY;

      var control1 = "";
      var control2 = "";

      // Todo: check if this wire path is occupied, if so shift it over

      if (Math.abs(y) > Math.abs(x)) {
        // More vertical travel
        if (y > 0) {
          if (x > 0) {
            control1 = " L " + (positions.from.left+extend+halfX) + " " + (positions.from.top+halfX);
            control2 = " L " + (positions.to.left-extend-halfX2) + " " + (positions.to.top-halfX2);
          } else if (x < 0) {
            control1 = " L " + (positions.from.left+extend+halfX) + " " + (positions.from.top-halfX);
            control2 = " L " + (positions.to.left-extend-halfX2) + " " + (positions.to.top+halfX2);
          }
        } else if (y < 0) {
          if (x > 0) {
            control1 = " L " + (positions.from.left+extend+halfX) + " " + (positions.from.top-halfX);
            control2 = " L " + (positions.to.left-extend-halfX2) + " " + (positions.to.top+halfX2);
          } else if (x < 0) {
            control1 = " L " + (positions.from.left+extend+halfX) + " " + (positions.from.top+halfX);
            control2 = " L " + (positions.to.left-extend-halfX2) + " " + (positions.to.top-halfX2);
          }          
        }
      } else if (Math.abs(y) < Math.abs(x)) {
        // More horizontal travel
        if (x > 0) {
          if (y > 0) {
            control1 = " L " + (positions.from.left+extend+halfY) + " " + (positions.from.top+halfY);
            control2 = " L " + (positions.to.left-extend-halfY2) + " " + (positions.to.top-halfY2);
          } else if (y < 0) {
            control1 = " L " + (positions.from.left+extend-halfY) + " " + (positions.from.top+halfY);
            control2 = " L " + (positions.to.left-extend+halfY2) + " " + (positions.to.top-halfY2);
          }
        } else if (x < 0) {
          if (y > 0) {
            control1 = " L " + (positions.from.left+extend-halfY) + " " + (positions.from.top+halfY);
            control2 = " L " + (positions.to.left-extend+halfY2) + " " + (positions.to.top-halfY2);
          } else if (y < 0) {
            control1 = " L " + (positions.from.left+extend+halfY) + " " + (positions.from.top+halfY);
            control2 = " L " + (positions.to.left-extend-halfY2) + " " + (positions.to.top-halfY2);
          }          
        }
      } 

      return "M " + positions.from.left + " " + positions.from.top + 
        " L " + (positions.from.left+extend) + " " + positions.from.top +
        control1 + control2 +
        " L " + (positions.to.left-extend) + " " + positions.to.top +
        " L " + positions.to.left + " " + positions.to.top;
    },
    remove: function(){
      var source = this.model.source;
      var target = this.model.target;
      // Remove listeners
      if (source) {
        source.parentNode.off(null, null, this);
      }
      if (target) {
        target.parentNode.off(null, null, this);
      }
      // Check if port plug is still active
      if (source) {
        source.view.plugCheckActive();
      }
      if (target) {
        target.view.plugCheckActive();
      }
      // Remove element
      this.el.parentNode.removeChild(this.el);
    },
    click: function(event){
      // Don't click graph
      if (event) {
        event.stopPropagation();
      }
      var selected;
      if (event && (event.ctrlKey || event.metaKey)) {
        // Toggle
        selected = this.model.get("selected");
        selected = !selected;
      } else {
        // Deselect all and select this
        selected = true;
        this.model.parentGraph.nodes.invoke("set", {selected:false});
        this.model.collection.invoke("set", {selected:false});
      }
      this.model.set({selected:selected});
      if (selected) {
        this.bringToTop();
        this.model.trigger("select");
        this.unfade();
        this.showInspector();
      }
      // Fade all and highlight related
      this.model.parentGraph.view.fade();
    },
    showInspector: function(){
      this.model.parentGraph.dataflow.showMenu("inspector");
      var $inspector = this.model.parentGraph.dataflow.$(".dataflow-plugin-inspector");
      $inspector.children().detach();
      $inspector.append( this.getInspect() );

      var $choose = this.$inspect.children(".dataflow-edge-inspector-route-choose");
      $choose.children().removeClass("active");
      $choose.children(".route"+this.model.get("route")).addClass("active");
    },
    bringToTop: function(){
      this.model.bringToTop();
      var parent = this.el.parentNode;
      if (parent) {
        parent.appendChild(this.el);
      }

      // Port hole color
      this.model.source.view.bringToTop(this.model);
      this.model.target.view.bringToTop(this.model);
    },
    $inspect: null,
    getInspect: function() {
      if (!this.$inspect) {
        this.$inspect = $("<div>");
        var model = this.model.toJSON();
        this.$inspect.html( this.inspectTemplate(model) );
        var $choose = this.$inspect.children(".dataflow-edge-inspector-route-choose");
        var self = this;
        var changeRoute = function(event){
          var route = $(event.target).data("route");
          self.model.set("route", route);
          $choose.children().removeClass("active");
          $choose.children(".route"+route).addClass("active");
        };
        for (var i=0; i<12; i++) {
          var button = $("<button>")
            .data("route", i)
            .addClass("route"+i)
            .click(changeRoute);
          $choose.append(button);
        }
      }
      return this.$inspect;
    }
  });

}(Dataflow) );

( function(Dataflow) {

  var Node = Dataflow.prototype.module("node");

  var template = 
    '<div class="dataflow-plugin-inspector-title">'+
      '<h1 class="dataflow-node-inspector-label" title="click to edit"><%- label %></h1>'+
      '<h2 class="dataflow-node-inspector-type"><%- type %></h2>'+
    '</div>'+
    // '<div class="dataflow-node-inspector-controls">'+
    //   '<button class="dataflow-node-delete">delete</button>'+
    // '</div>'+
    '<div class="dataflow-node-inspector-inputs"></div>';

  var makeEditable = function ($el, model, attribute) {
    $el[0].contentEditable = true;
    var initial = $el.text();
    var apply = function(){
      model.set(attribute, $el.text());
    };
    var revert = function(){
      $el.text(initial);
    };
    $el
      .focus(function(event){
        initial = $el.text();
      })
      .blur(function(event){
        apply();
      })
      .keydown(function(event){
        if (event.which === 27) {
          // ESC
          revert();
          $el.blur();
        } else if (event.which === 13) {
          // Enter
          $el.blur();
        }
      });
  };

  Node.InspectView = Backbone.View.extend({
    template: _.template(template),
    className: "dataflow-node-inspector",
    events: {
    },
    initialize: function(options) {
      this.$el.html(this.template(this.model.toJSON()));
      // Make input list
      var $inputs = this.$el.children(".dataflow-node-inspector-inputs");
      this.model.inputs.each(function(input){
        if (input.view && input.view.$input) {
          $inputs.append( input.view.$input );
        }
      }, this);

      makeEditable(this.$(".dataflow-node-inspector-label"), this.model, "label");
    },
    render: function() {
      return this;
    },
    removeModel: function(){
      this.model.remove();
    }
  });

}(Dataflow) );

( function(Dataflow) {

  var Edit = Dataflow.prototype.plugin("edit");

  Edit.initialize = function(dataflow){

    var buttons = $(
      '<div class="dataflow-plugin-edit">'+
        '<button class="selectall">Select All (A)</button><br />'+
        '<button class="cut">Cut (X)</button><br />'+
        '<button class="copy">Copy (C)</button><br />'+
        '<button class="paste">Paste (V)</button><br />'+
      '</div>'
    );

    // dataflow.addPlugin({
    //   id: "edit", 
    //   name: "edit", 
    //   menu: buttons, 
    //   icon: "edit"
    // });


    //
    // A
    //

    function selectAll(){
      dataflow.currentGraph.nodes.invoke("set", {selected:true});
    }
    buttons.children(".selectall").click(selectAll);
    Edit.selectAll = selectAll;

    //
    // X
    //

    function cut(){
      // Copy selected
      copy();
      // Move back so paste in original place
      _.each(copied.nodes, function(node){
        node.x -= 50;
        node.y -= 50;
      });
      // Remove selected
      var toRemove = dataflow.currentGraph.nodes.where({selected:true});
      _.each(toRemove, function(node){
        node.remove();
      });
    }
    buttons.children(".cut").click(cut);
    Edit.cut = cut;

    //
    // C
    //

    var copied = {};
    function copy(){
      copied = {};
      // nodes
      copied.nodes = dataflow.currentGraph.nodes.where({selected:true});
      copied.nodes = JSON.parse(JSON.stringify(copied.nodes));
      // edges
      copied.edges = [];
      dataflow.currentGraph.edges.each(function(edge){
        // Only copy the edges between nodes being copied
        var connectedSource = _.any(copied.nodes, function(node){
          return (edge.source.parentNode.id === node.id);
        });
        var connectedTarget = _.any(copied.nodes, function(node){
          return (edge.target.parentNode.id === node.id);
        });
        if (connectedSource && connectedTarget){
          copied.edges.push( JSON.parse(JSON.stringify(edge)) );
        }
      });
    }
    buttons.children(".copy").click(copy);
    Edit.copy = copy;

    //
    // V
    //

    function paste(){
      if (copied && copied.nodes && copied.nodes.length > 0) {
        // Deselect all
        dataflow.currentGraph.nodes.invoke("set", {selected:false});
        // Add nodes
        _.each(copied.nodes, function(node){
          // Offset pasted
          node.x += 50;
          node.y += 50;
          node.parentGraph = dataflow.currentGraph;
          node.selected = true;
          var oldId = node.id;
          // Make unique id
          while (dataflow.currentGraph.nodes.get(node.id)){
            node.id++;
          }
          // Update copied edges with new node id
          if (oldId !== node.id) {
            _.each(copied.edges, function(edge){
              if (edge.source.node === oldId) {
                edge.source.node = node.id;
              }
              if (edge.target.node === oldId) {
                edge.target.node = node.id;
              }
            });
          }
          var newNode = new dataflow.nodes[node.type].Model(node);
          dataflow.currentGraph.nodes.add(newNode);
          // Select new node
          newNode.view.bringToTop();
          newNode.view.highlight();
        });
        // Add edges
        _.each(copied.edges, function(edge){
          // Clone edge object (otherwise weirdness on multiple pastes)
          edge = JSON.parse(JSON.stringify(edge));
          // Add it
          edge.parentGraph = dataflow.currentGraph;
          edge.id = edge.source.node+":"+edge.source.port+"::"+edge.target.node+":"+edge.target.port;
          var newEdge = new dataflow.modules.edge.Model(edge);
          dataflow.currentGraph.edges.add(newEdge);
        });
      }
      // Rerender edges
      _.defer(function(){
        dataflow.currentGraph.view.rerenderEdges();
      });
    }
    buttons.children(".paste").click(paste);
    Edit.paste = paste;



    // Add context actions for actionbar

    dataflow.addContext({
      id: "cut",
      icon: "cut",
      label: "cut",
      action: cut,
      contexts: ["one", "twoplus"]
    });
    dataflow.addContext({
      id: "copy",
      icon: "copy",
      label: "copy",
      action: copy,
      contexts: ["one", "twoplus"]
    });
    dataflow.addContext({
      id: "paste",
      icon: "paste",
      label: "paste",
      action: paste,
      contexts: ["one", "twoplus"]
    });


  };


}(Dataflow) );

( function(Dataflow) {

  var Elements = Dataflow.prototype.plugin("elements");

  Elements.list = [
    {type: "div",    attributes: ["id", "class", "style"], events: ["pointermove", "pointerover", "pointerout"]},
    {type: "button", attributes: ["id", "class", "style"], events: ["pointerdown", "pointerup"]}
  ];

}(Dataflow) );

( function(Dataflow) {

  var Library = Dataflow.prototype.plugin("library");

  Library.initialize = function(dataflow){

    var $container = $('<div class="dataflow-plugin-overflow">');
    var $library = $('<ul class="dataflow-plugin-library" style="list-style:none; padding:0; margin:15px 0;" />');
    $container.append($library);

    var addNode = function(node, x, y) {
      return function(){
        // Deselect others
        dataflow.currentGraph.view.$(".dataflow-node").removeClass("ui-selected");

        // Current zoom
        zoom = dataflow.currentGraph.get('zoom');

        // Find vacant id
        var id = 1;
        while (dataflow.currentGraph.nodes.get(id)){
          id++;
        }
        // Position
        x = x===undefined ? 200 : x;
        y = y===undefined ? 200 : y;
        x = x/zoom - dataflow.currentGraph.get("panX");
        y = y/zoom - dataflow.currentGraph.get("panY");

        // Add node
        var newNode = new node.Model({
          id: id,
          x: x,
          y: y,
          parentGraph: dataflow.currentGraph
        });
        dataflow.currentGraph.nodes.add(newNode);
        // Select and bring to top
        newNode.view.select();
      };
    };

    var addElement = function (info) {

    };

    var addLibraryItem = function(node, name) {
      var addButton = $('<a class="button">+</a>')
        .attr("title", "click or drag")
        .draggable({
          helper: function(){
            var helper = $('<div class="dataflow-node helper"><div class="dataflow-node-title">'+name+'</div></div>');
            dataflow.$el.append(helper);
            return helper;
          },
          stop: function(event, ui) {
            addNode(node, ui.position.left, ui.position.top).call();
          }
        })
        .click(addNode(node));
      var item = $("<li />")
        .append(addButton)
        .append(name);
      $library.append(item);
    };

    var update = function(options){
      options = options ? options : {};
      options.exclude = options.exclude ? options.exclude : ["base", "base-resizable"];

      $library.empty();
      _.each(dataflow.nodes, function(node, index){
        if (options.exclude.indexOf(index) === -1) {
          addLibraryItem(node, index);
        }
      });
    };
    update();

    dataflow.addPlugin({
      id: "library", 
      name: "", 
      menu: $container, 
      icon: "plus"
    });

    Library.update = update;

  };

}(Dataflow) );

( function(Dataflow) {

  var Source = Dataflow.prototype.plugin("source");

  Source.initialize = function(dataflow){

    var $form = $( 
      '<form class="dataflow-plugin-view-source">'+
        '<div style="">'+
          '<textarea class="code" style="width:99%; height:400px;; margin:0; padding: 0;"></textarea><br/>'+
        '</div>'+
        '<input class="apply" type="submit" value="apply changes" style="position: absolute; right:5px; bottom:5px;" />'+
      '</form>'
    );
    var $code = $form.find(".code");

    $code.keydown(function(event){
      // Don't select / copy / paste nodes in the graph
      event.stopPropagation();
    });

    dataflow.addPlugin({
      id: "source", 
      name: "", 
      menu: $form, 
      icon: "cog"
    });

    var show = function(source) {
      var scrollBackTop = $code.prop("scrollTop");
      $code.val( source );
      $code.scrollTop( scrollBackTop );
    };

    Source.show = show;

    var showGraph = function(graph){
      if (dataflow.graph) {
        show( JSON.stringify(dataflow.graph.toJSON(), null, "  ") );
      }
    };

    Source.listeners = function(boo){
      if (boo) {
        // On change update code view
        dataflow.on("change", showGraph);
      } else {
        // Custom
        dataflow.off("change", showGraph);
      }
    };
    Source.listeners(true);

    // Apply source to test graph
    $form.submit(function(){
      var graph;
      try {
        graph = JSON.parse( $code.val() );
      } catch(error){
        dataflow.log("Invalid JSON");
        return false;
      }
      if (graph) {
        var g = dataflow.loadGraph(graph);
        g.trigger("change");
      }
      return false;
    });
    
  };

}(Dataflow) );

( function(Dataflow) {
 
  var Log = Dataflow.prototype.plugin("log");

  Log.initialize = function(dataflow){

    var $log = $(
      '<div class="dataflow-plugin-log dataflow-plugin-overflow">'+
        '<ol class="loglist"></ol>'+
      '</div>'
    );

    dataflow.addPlugin({
      id: "log", 
      name: "", 
      menu: $log, 
      icon: "th-list"
    });

    // Log message and scroll
    function log(message){
      message = _.escape(message);
      $log.children(".loglist").append("<li>" + message + "</li>");
      $log.scrollTop( $log.prop("scrollHeight") );
    }

    Log.add = log;

    var logged = function(message){
      log("log: " + message);
    };
    var nodeAdded = function(graph, node){
      log("node added: " + node.toString());
    };
    var nodeRemoved = function(graph, node){
      log("node removed: " + node.toString());
    };
    var edgeAdded = function(graph, edge){
      log("edge added: " + edge.toString());
    };
    var edgeRemoved = function(graph, edge){
      log("edge removed: " + edge.toString());
    };



    Log.listeners = function(boo){
      if (boo) {
        // Log
        dataflow.on("log", logged);

        // Log graph changes
        dataflow.on("node:add", nodeAdded);
        dataflow.on("node:remove", nodeRemoved);
        dataflow.on("edge:add", edgeAdded);
        dataflow.on("edge:remove", edgeRemoved);
      } else {
        // Custom for other integration
        dataflow.off("log", logged);
        dataflow.off("node:add", nodeAdded);
        dataflow.off("node:remove", nodeRemoved);
        dataflow.off("edge:add", edgeAdded);
        dataflow.off("edge:remove", edgeRemoved);
      }
    };
    Log.listeners(true);

  };

}(Dataflow) );

( function(Dataflow) {
 
  var Inspector = Dataflow.prototype.plugin("inspector");

  Inspector.initialize = function(dataflow){

    var $inspector = $(
      '<div class="dataflow-plugin-inspector"></div>'
    );

    // Doing this manually instead of dataflow.addPlugin()
    var $menu = $("<div>")
      .addClass("dataflow-menuitem dataflow-menuitem-inspector")
      .append($inspector);
    dataflow.$(".dataflow-menu").append($menu);

    var lastSelected = null;

    function updateInspector(){
      if (lastSelected) {
        if (lastSelected.view) {
          $inspector.children().detach();
          $inspector.append( lastSelected.view.getInspector().el );
        }
      }
    }
    // Inspector.updateInspector = updateInspector;

    function showInspector(){
      dataflow.showMenu("inspector");
      updateInspector();
    }

    dataflow.addContext({
      id: "inspector",
      icon: "info-sign",
      label: "inspect",
      action: showInspector,
      contexts: ["one", "twoplus"]
    });

    function selectNode (graph, node) {
      if (lastSelected !== node) {
        lastSelected = node;
        if ($menu.is(':visible')){
          updateInspector();
        }
      }
    }

    function updateInspectorEdge (edge) {
      $inspector.children().detach();
      $inspector.append( edge.view.getInspect() );
    }

    function selectEdge (graph, edge) {
      if (lastSelected !== edge) {
        lastSelected = edge;
        if ($menu.is(':visible')){
          updateInspectorEdge(edge);
        }
      }
    }

    Inspector.listeners = function(boo){
      if (boo) {
        // Selection changes
        dataflow.on("select:node", selectNode);
        dataflow.on("select:edge", selectEdge);
      } else {
        // Custom
        dataflow.off("select:node", selectNode);
        dataflow.off("select:edge", selectEdge);
      }
    };
    Inspector.listeners(true);

  };

}(Dataflow) );

( function(Dataflow) {

  // Load after other plugins
  // TODO: track which widget has focus if multiple in page
 
  var KeyBinding = Dataflow.prototype.plugin("keybinding");
  var Edit = Dataflow.prototype.plugin("edit");

  KeyBinding.initialize = function(dataflow){

    function zoomIn() {
      if (dataflow && dataflow.currentGraph && dataflow.currentGraph.view) {
        dataflow.currentGraph.view.zoomIn();
      }
    }

    function zoomOut() {
      if (dataflow && dataflow.currentGraph && dataflow.currentGraph.view) {
        dataflow.currentGraph.view.zoomOut();
      }
    }

    function zoomCenter() {
      if (dataflow && dataflow.currentGraph && dataflow.currentGraph.view) {
        dataflow.currentGraph.view.zoomCenter();
      }
    }

    function keyDown(event) {
      if (event.ctrlKey || event.metaKey) {
        switch (event.which) {
          case 189: // -
            event.preventDefault();
            zoomIn();
            break;
          case 187: // =
            event.preventDefault();
            zoomOut();
            break;
          case 48:
            event.preventDefault();
            zoomCenter();
            break;
          case 65: // a
            Edit.selectAll();
            break;
          case 88: // x
            Edit.cut();
            break;
          case 67: // c
            Edit.copy();
            break;
          case 86: // v
            Edit.paste();
            break;
          case 90: // z
            break;
          default:
            break;
        }
      }
    }

    KeyBinding.listeners = function(boo){
      if (boo) {
        $(document).on('keydown', keyDown);
      } else {
        $(document).off('keydown', keyDown);
      }
    };
    KeyBinding.listeners(true);

  };

}(Dataflow) );

( function(Dataflow) {
 
  // Dependencies
  var Node = Dataflow.prototype.module("node");
  var Base = Dataflow.prototype.node("base");

  Base.Model = Node.Model.extend({
    defaults: function(){
      var defaults = Node.Model.prototype.defaults.call(this);
      defaults.type = "base";
      return defaults;
    },
    initialize: function() {
      Node.Model.prototype.initialize.call(this);
    },
    unload: function(){
      // Stop any processes that need to be stopped
    },
    inputs:[],
    outputs:[]
  });

  Base.View = Node.View.extend({
  });

}(Dataflow) );

( function(Dataflow) {
 
  // Dependencies
  var Base = Dataflow.prototype.node("base");
  var BaseResizable = Dataflow.prototype.node("base-resizable");

  BaseResizable.Model = Base.Model.extend({
    defaults: function(){
      var defaults = Base.Model.prototype.defaults.call(this);
      defaults.type = "base-resizable";
      defaults.w = 200;
      defaults.h = 200;
      return defaults;
    },
    initialize: function() {
      Base.Model.prototype.initialize.call(this);
    },
    unload: function(){
      // Stop any processes that need to be stopped
    },
    toJSON: function(){
      var json = Base.Model.prototype.toJSON.call(this);
      json.w = this.get("w");
      json.h = this.get("h");
      return json;
    },
    inputs:[],
    outputs:[]
  });

  BaseResizable.View = Base.View.extend({
    initialize: function(options) {
      Base.View.prototype.initialize.call(this, options);
      // Initial size
      this.$el.css({
        width: this.model.get("w"),
        height: this.model.get("h")
      });
      // Make resizable
      var self = this;
      this.$el.resizable({
        helper: "dataflow-node helper",
        minHeight: 100,
        minWidth: 120,
        stop: function(event, ui) {
          self.resizeStop(event, ui);
        }
      });
      // The simplest way to extend the events hash
      // this.addEvents({
      //   'resizestop': 'resizeStop'
      // });
    },
    resizeStop: function(event, ui) {
      this.model.set({
        "w": ui.size.width,
        "h": ui.size.height
      });
    }
  });

}(Dataflow) );

( function(Dataflow) {
 
  // Dependencies
  var BaseResizable = Dataflow.prototype.node("base-resizable");
  var DataflowSubgraph = Dataflow.prototype.node("dataflow-subgraph");

  var Graph = Dataflow.prototype.module("graph");
  var Input = Dataflow.prototype.module("input");
  var Output = Dataflow.prototype.module("output");

  DataflowSubgraph.Model = BaseResizable.Model.extend({
    defaults: function(){
      var defaults = BaseResizable.Model.prototype.defaults.call(this);
      defaults.label = "subgraph";
      defaults.type = "dataflow-subgraph";
      defaults.graph = {
        nodes:[
          {id: "1", label: "in", type:"dataflow-input",  x:180, y: 15},
          {id:"99", label:"out", type:"dataflow-output", x:975, y:500}
        ]
      };
      return defaults;
    },
    initialize: function() {
      BaseResizable.Model.prototype.initialize.call(this);

      var graph = this.get("graph");
      graph.parentNode = this;
      graph.dataflow = this.parentGraph.dataflow;
      this.graph = new Graph.Model(graph);

      // Initialize i/o from subgraph
      var inputs = this.graph.nodes.filter(function(node){
        return (node.type === "dataflow-input");
      });
      _.each(inputs, this.addInput, this);
      var outputs = this.graph.nodes.filter(function(node){
        return (node.type === "dataflow-output");
      });
      _.each(outputs, this.addOutput, this);

      // Listen for new i/o
      this.graph.nodes.on("add", function(node){
        if (node.type === "dataflow-input") {
          this.addInput(node);
        } else if (node.type === "dataflow-output") {
          this.addOutput(node);
        }
      }, this);

      // Listen for removing i/o
      this.graph.nodes.on("remove", function(node){
        if (node.type === "dataflow-input") {
          this.removeInput(node);
        } else if (node.type === "dataflow-output") {
          this.removeOutput(node);
        }
      }, this);
    },
    addInput: function(input){
      var newInput = new Input.Model({
        id: input.id,
        label: input.get("label"),
        type: input.get("input-type"),
        parentNode: this,
        inputNode: input
      });
      this.inputs.add(newInput);
    },
    recieve: function (name, value) {
      // Forward data to subgraph
      var inputNode = this.inputs.get(name).get("inputNode");
      if (inputNode) {
        inputNode.send("data", value);
      }
    },
    addOutput: function(output){
      var newOutput = new Output.Model({
        id: output.id,
        label: output.get("label"),
        type: output.get("output-type"),
        parentNode: this,
        outputNode: output
      });
      this.outputs.add(newOutput);
      output.set("parentNode", this);
    },
    removeInput: function(node){
      var input = this.inputs.get(node.id);
      input.remove();
      this.inputs.remove(input);
    },
    removeOutput: function(node){
      var output = this.outputs.get(node.id);
      output.remove();
      this.outputs.remove(output);
    },
    toJSON: function(){
      var json = BaseResizable.Model.prototype.toJSON.call(this);
      json.graph = this.graph;
      return json;
    },
    remove: function(){
      BaseResizable.Model.prototype.remove.call(this);
      this.graph.remove();
    },
    inputs:[
    ],
    outputs:[
    ]
  });

  var innerTemplate = '<button class="show-subgraph">edit subgraph</button>';

  DataflowSubgraph.View = BaseResizable.View.extend({
    events: function(){
      var events = BaseResizable.View.prototype.events.call(this);
      events["click .show-subgraph"] = "showSubgraph";
      return events;
    },
    innerTemplate: _.template(innerTemplate),
    initialize: function(options) {
      BaseResizable.View.prototype.initialize.call(this, options);
      this.model.graph.view = new Graph.View({model:this.model.graph});

      // Listen for label changes
      this.model.inputs.each(this.addInput, this);
      this.model.inputs.on("add", this.addInput, this);
      this.model.outputs.each(this.addOutput, this);
      this.model.outputs.on("add", this.addOutput, this);
    },
    addInput: function(input){
      // Listen for label changes
      if (!input.get('inputNode')) {
        return;
      }
      input.get("inputNode").on("change:label", function(i){
        input.view.$(".label").text(i.get("label"));
      }, this);
    },
    addOutput: function(output){
      // Listen for label changes
      if (!output.get('outputNode')) {
        return;
      }
      output.get("outputNode").on("change:label", function(o){
        output.view.$(".label").text(o.get("label"));
      }, this);
    },
    showSubgraph: function(){
      this.model.graph.dataflow.showGraph(this.model.graph);
    }
  });

}(Dataflow) );

});
require.register("component-indexof/index.js", function(exports, require, module){
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("component-underscore/index.js", function(exports, require, module){
//     Underscore.js 1.3.3
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.3.3';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = Math.floor(Math.random() * ++index);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, val, context) {
    var iterator = lookupIterator(obj, val);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      if (a === void 0) return 1;
      if (b === void 0) return -1;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(obj, val) {
    return _.isFunction(val) ? val : function(obj) { return obj[val]; };
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, val, behavior) {
    var result = {};
    var iterator = lookupIterator(obj, val);
    each(obj, function(value, index) {
      var key = iterator(value, index);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    return group(obj, val, function(result, key, value) {
      (result[key] || (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, val) {
    return group(obj, val, function(result, key, value) {
      result[key] || (result[key] = 0);
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var value = iterator(obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj)                                     return [];
    if (_.isArray(obj))                           return slice.call(obj);
    if (_.isArguments(obj))                       return slice.call(obj);
    if (obj.toArray && _.isFunction(obj.toArray)) return obj.toArray();
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.isArray(obj) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var results = [];
    _.reduce(initial, function(memo, value, index) {
      if (isSorted ? (_.last(memo) !== value || !memo.length) : !_.include(memo, value)) {
        memo.push(value);
        results.push(array[index]);
      }
      return memo;
    }, []);
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, []));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(slice.call(arguments, 1), true, []);
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Zip together two arrays -- an array of keys and an array of values -- into
  // a single object.
  _.zipObject = function(keys, values) {
    var result = {};
    for (var i = 0, l = keys.length; i < l; i++) {
      result[keys[i]] = values[i];
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more, result;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        throttling = true;
        result = func.apply(context, args);
      }
      whenDone();
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var result = {};
    each(flatten(slice.call(arguments, 1), true, []), function(key) {
      if (key in obj) result[key] = obj[key];
    });
    return result;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return _.isNumber(obj) && isFinite(obj);
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // List of HTML entities for escaping.
  var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  // Regex containing the keys listed immediately above.
  var htmlEscaper = /[&<>"'\/]/g;

  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return ('' + string).replace(htmlEscaper, function(match) {
      return htmlEscapes[match];
    });
  };

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    '\\':   '\\',
    "'":    "'",
    r:      '\r',
    n:      '\n',
    t:      '\t',
    u2028:  '\u2028',
    u2029:  '\u2029'
  };

  for (var key in escapes) escapes[escapes[key]] = key;
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(unescaper, function(match, escape) {
      return escapes[escape];
    });
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    settings = _.defaults(settings || {}, _.templateSettings);

    // Compile the template source, taking care to escape characters that
    // cannot be included in a string literal and then unescape them in code
    // blocks.
    var source = "__p+='" + text
      .replace(escaper, function(match) {
        return '\\' + escapes[match];
      })
      .replace(settings.escape || noMatch, function(match, code) {
        return "'+\n((__t=(" + unescape(code) + "))==null?'':_.escape(__t))+\n'";
      })
      .replace(settings.interpolate || noMatch, function(match, code) {
        return "'+\n((__t=(" + unescape(code) + "))==null?'':__t)+\n'";
      })
      .replace(settings.evaluate || noMatch, function(match, code) {
        return "';\n" + unescape(code) + "\n__p+='";
      }) + "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'')};\n" +
      source + "return __p;\n";

    var render = new Function(settings.variable || 'obj', '_', source);
    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result(obj, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(this);

});
require.register("noflo-fbp/lib/fbp.js", function(exports, require, module){
module.exports = (function(){
  /*
   * Generated by PEG.js 0.7.0.
   *
   * http://pegjs.majda.cz/
   */
  
  function quote(s) {
    /*
     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
     * string literal except for the closing quote character, backslash,
     * carriage return, line separator, paragraph separator, and line feed.
     * Any character may appear in the form of an escape sequence.
     *
     * For portability, we also escape escape all control and non-ASCII
     * characters. Note that "\0" and "\v" escape sequences are not used
     * because JSHint does not like the first and IE the second.
     */
     return '"' + s
      .replace(/\\/g, '\\\\')  // backslash
      .replace(/"/g, '\\"')    // closing quote character
      .replace(/\x08/g, '\\b') // backspace
      .replace(/\t/g, '\\t')   // horizontal tab
      .replace(/\n/g, '\\n')   // line feed
      .replace(/\f/g, '\\f')   // form feed
      .replace(/\r/g, '\\r')   // carriage return
      .replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape)
      + '"';
  }
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input, startRule) {
      var parseFunctions = {
        "start": parse_start,
        "line": parse_line,
        "LineTerminator": parse_LineTerminator,
        "comment": parse_comment,
        "connection": parse_connection,
        "bridge": parse_bridge,
        "leftlet": parse_leftlet,
        "iip": parse_iip,
        "rightlet": parse_rightlet,
        "node": parse_node,
        "component": parse_component,
        "compMeta": parse_compMeta,
        "port": parse_port,
        "anychar": parse_anychar,
        "_": parse__,
        "__": parse___
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "start";
      }
      
      var pos = 0;
      var reportFailures = 0;
      var rightmostFailuresPos = 0;
      var rightmostFailuresExpected = [];
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        var escapeChar;
        var length;
        
        if (charCode <= 0xFF) {
          escapeChar = 'x';
          length = 2;
        } else {
          escapeChar = 'u';
          length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function matchFailed(failure) {
        if (pos < rightmostFailuresPos) {
          return;
        }
        
        if (pos > rightmostFailuresPos) {
          rightmostFailuresPos = pos;
          rightmostFailuresExpected = [];
        }
        
        rightmostFailuresExpected.push(failure);
      }
      
      function parse_start() {
        var result0, result1;
        var pos0;
        
        pos0 = pos;
        result0 = [];
        result1 = parse_line();
        while (result1 !== null) {
          result0.push(result1);
          result1 = parse_line();
        }
        if (result0 !== null) {
          result0 = (function(offset) { return parser.getResult();  })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_line() {
        var result0, result1, result2, result3, result4, result5, result6;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse__();
        if (result0 !== null) {
          if (input.substr(pos, 7) === "EXPORT=") {
            result1 = "EXPORT=";
            pos += 7;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"EXPORT=\"");
            }
          }
          if (result1 !== null) {
            if (/^[A-Z.]/.test(input.charAt(pos))) {
              result3 = input.charAt(pos);
              pos++;
            } else {
              result3 = null;
              if (reportFailures === 0) {
                matchFailed("[A-Z.]");
              }
            }
            if (result3 !== null) {
              result2 = [];
              while (result3 !== null) {
                result2.push(result3);
                if (/^[A-Z.]/.test(input.charAt(pos))) {
                  result3 = input.charAt(pos);
                  pos++;
                } else {
                  result3 = null;
                  if (reportFailures === 0) {
                    matchFailed("[A-Z.]");
                  }
                }
              }
            } else {
              result2 = null;
            }
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 58) {
                result3 = ":";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\":\"");
                }
              }
              if (result3 !== null) {
                if (/^[A-Z]/.test(input.charAt(pos))) {
                  result5 = input.charAt(pos);
                  pos++;
                } else {
                  result5 = null;
                  if (reportFailures === 0) {
                    matchFailed("[A-Z]");
                  }
                }
                if (result5 !== null) {
                  result4 = [];
                  while (result5 !== null) {
                    result4.push(result5);
                    if (/^[A-Z]/.test(input.charAt(pos))) {
                      result5 = input.charAt(pos);
                      pos++;
                    } else {
                      result5 = null;
                      if (reportFailures === 0) {
                        matchFailed("[A-Z]");
                      }
                    }
                  }
                } else {
                  result4 = null;
                }
                if (result4 !== null) {
                  result5 = parse__();
                  if (result5 !== null) {
                    result6 = parse_LineTerminator();
                    result6 = result6 !== null ? result6 : "";
                    if (result6 !== null) {
                      result0 = [result0, result1, result2, result3, result4, result5, result6];
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, priv, pub) {return parser.registerExports(priv.join(""),pub.join(""))})(pos0, result0[2], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          result0 = parse_comment();
          if (result0 !== null) {
            if (/^[\n\r\u2028\u2029]/.test(input.charAt(pos))) {
              result1 = input.charAt(pos);
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("[\\n\\r\\u2028\\u2029]");
              }
            }
            result1 = result1 !== null ? result1 : "";
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos0;
            }
          } else {
            result0 = null;
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            result0 = parse__();
            if (result0 !== null) {
              if (/^[\n\r\u2028\u2029]/.test(input.charAt(pos))) {
                result1 = input.charAt(pos);
                pos++;
              } else {
                result1 = null;
                if (reportFailures === 0) {
                  matchFailed("[\\n\\r\\u2028\\u2029]");
                }
              }
              if (result1 !== null) {
                result0 = [result0, result1];
              } else {
                result0 = null;
                pos = pos0;
              }
            } else {
              result0 = null;
              pos = pos0;
            }
            if (result0 === null) {
              pos0 = pos;
              pos1 = pos;
              result0 = parse__();
              if (result0 !== null) {
                result1 = parse_connection();
                if (result1 !== null) {
                  result2 = parse__();
                  if (result2 !== null) {
                    result3 = parse_LineTerminator();
                    result3 = result3 !== null ? result3 : "";
                    if (result3 !== null) {
                      result0 = [result0, result1, result2, result3];
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
              if (result0 !== null) {
                result0 = (function(offset, edges) {return parser.registerEdges(edges);})(pos0, result0[1]);
              }
              if (result0 === null) {
                pos = pos0;
              }
            }
          }
        }
        return result0;
      }
      
      function parse_LineTerminator() {
        var result0, result1, result2, result3;
        var pos0;
        
        pos0 = pos;
        result0 = parse__();
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 44) {
            result1 = ",";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\",\"");
            }
          }
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result2 = parse_comment();
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              if (/^[\n\r\u2028\u2029]/.test(input.charAt(pos))) {
                result3 = input.charAt(pos);
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("[\\n\\r\\u2028\\u2029]");
                }
              }
              result3 = result3 !== null ? result3 : "";
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos0;
              }
            } else {
              result0 = null;
              pos = pos0;
            }
          } else {
            result0 = null;
            pos = pos0;
          }
        } else {
          result0 = null;
          pos = pos0;
        }
        return result0;
      }
      
      function parse_comment() {
        var result0, result1, result2, result3;
        var pos0;
        
        pos0 = pos;
        result0 = parse__();
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 35) {
            result1 = "#";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"#\"");
            }
          }
          if (result1 !== null) {
            result2 = [];
            result3 = parse_anychar();
            while (result3 !== null) {
              result2.push(result3);
              result3 = parse_anychar();
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos0;
            }
          } else {
            result0 = null;
            pos = pos0;
          }
        } else {
          result0 = null;
          pos = pos0;
        }
        return result0;
      }
      
      function parse_connection() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_bridge();
        if (result0 !== null) {
          result1 = parse__();
          if (result1 !== null) {
            if (input.substr(pos, 2) === "->") {
              result2 = "->";
              pos += 2;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"->\"");
              }
            }
            if (result2 !== null) {
              result3 = parse__();
              if (result3 !== null) {
                result4 = parse_connection();
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, x, y) { return [x,y]; })(pos0, result0[0], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          result0 = parse_bridge();
        }
        return result0;
      }
      
      function parse_bridge() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_port();
        if (result0 !== null) {
          result1 = parse__();
          if (result1 !== null) {
            result2 = parse_node();
            if (result2 !== null) {
              result3 = parse__();
              if (result3 !== null) {
                result4 = parse_port();
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, x, proc, y) { return [{"tgt":{process:proc, port:x}},{"src":{process:proc, port:y}}]; })(pos0, result0[0], result0[2], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          result0 = parse_iip();
          if (result0 === null) {
            result0 = parse_rightlet();
            if (result0 === null) {
              result0 = parse_leftlet();
            }
          }
        }
        return result0;
      }
      
      function parse_leftlet() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_node();
        if (result0 !== null) {
          result1 = parse__();
          if (result1 !== null) {
            result2 = parse_port();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, proc, port) { return {"src":{process:proc, port:port}} })(pos0, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_iip() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 39) {
          result0 = "'";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"'\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          result2 = parse_anychar();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_anychar();
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 39) {
              result2 = "'";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"'\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, iip) { return {"data":iip.join("")} })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_rightlet() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_port();
        if (result0 !== null) {
          result1 = parse__();
          if (result1 !== null) {
            result2 = parse_node();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, port, proc) { return {"tgt":{process:proc, port:port}} })(pos0, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_node() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (/^[a-zA-Z]/.test(input.charAt(pos))) {
          result1 = input.charAt(pos);
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("[a-zA-Z]");
          }
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            if (/^[a-zA-Z]/.test(input.charAt(pos))) {
              result1 = input.charAt(pos);
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("[a-zA-Z]");
              }
            }
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result1 = parse_component();
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, node, comp) { if(comp){parser.addNode(node.join(""),comp);}; return node.join("")})(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_component() {
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 40) {
          result0 = "(";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"(\"");
          }
        }
        if (result0 !== null) {
          if (/^[a-zA-Z\/\-]/.test(input.charAt(pos))) {
            result2 = input.charAt(pos);
            pos++;
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("[a-zA-Z\\/\\-]");
            }
          }
          if (result2 !== null) {
            result1 = [];
            while (result2 !== null) {
              result1.push(result2);
              if (/^[a-zA-Z\/\-]/.test(input.charAt(pos))) {
                result2 = input.charAt(pos);
                pos++;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("[a-zA-Z\\/\\-]");
                }
              }
            }
          } else {
            result1 = null;
          }
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result2 = parse_compMeta();
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 41) {
                result3 = ")";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\")\"");
                }
              }
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, comp, meta) { var o = {}; comp ? o.comp = comp.join("") : o.comp = ''; meta ? o.meta = meta.join("").split(',') : null; return o; })(pos0, result0[1], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_compMeta() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 58) {
          result0 = ":";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\":\"");
          }
        }
        if (result0 !== null) {
          if (/^[a-zA-Z\/]/.test(input.charAt(pos))) {
            result2 = input.charAt(pos);
            pos++;
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("[a-zA-Z\\/]");
            }
          }
          if (result2 !== null) {
            result1 = [];
            while (result2 !== null) {
              result1.push(result2);
              if (/^[a-zA-Z\/]/.test(input.charAt(pos))) {
                result2 = input.charAt(pos);
                pos++;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("[a-zA-Z\\/]");
                }
              }
            }
          } else {
            result1 = null;
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, meta) {return meta})(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_port() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (/^[A-Z.0-9]/.test(input.charAt(pos))) {
          result1 = input.charAt(pos);
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("[A-Z.0-9]");
          }
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            if (/^[A-Z.0-9]/.test(input.charAt(pos))) {
              result1 = input.charAt(pos);
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("[A-Z.0-9]");
              }
            }
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, portname) {return portname.join("").toLowerCase()})(pos0, result0[0]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_anychar() {
        var result0;
        
        if (/^[a-zA-Z0-9 .,#:{}@+?!^=()_\-$*\/\\[\]{}"&`%|]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[a-zA-Z0-9 .,#:{}@+?!^=()_\\-$*\\/\\\\[\\]{}\"&`%|]");
          }
        }
        return result0;
      }
      
      function parse__() {
        var result0, result1;
        
        result0 = [];
        if (input.charCodeAt(pos) === 32) {
          result1 = " ";
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("\" \"");
          }
        }
        while (result1 !== null) {
          result0.push(result1);
          if (input.charCodeAt(pos) === 32) {
            result1 = " ";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\" \"");
            }
          }
        }
        result0 = result0 !== null ? result0 : "";
        return result0;
      }
      
      function parse___() {
        var result0, result1;
        
        if (input.charCodeAt(pos) === 32) {
          result1 = " ";
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("\" \"");
          }
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            if (input.charCodeAt(pos) === 32) {
              result1 = " ";
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\" \"");
              }
            }
          }
        } else {
          result0 = null;
        }
        return result0;
      }
      
      
      function cleanupExpected(expected) {
        expected.sort();
        
        var lastExpected = null;
        var cleanExpected = [];
        for (var i = 0; i < expected.length; i++) {
          if (expected[i] !== lastExpected) {
            cleanExpected.push(expected[i]);
            lastExpected = expected[i];
          }
        }
        return cleanExpected;
      }
      
      function computeErrorPosition() {
        /*
         * The first idea was to use |String.split| to break the input up to the
         * error position along newlines and derive the line and column from
         * there. However IE's |split| implementation is so broken that it was
         * enough to prevent it.
         */
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i < Math.max(pos, rightmostFailuresPos); i++) {
          var ch = input.charAt(i);
          if (ch === "\n") {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      
        var parser, edges, nodes; 
      
        parser = this;
      
        edges = parser.edges = [];
        
        parser.exports = []
      
        nodes = {};
      
        parser.addNode = function (nodeName, comp) {
          if (!nodes[nodeName]) {
            nodes[nodeName] = {}
          }
          if (!!comp.comp) {
            nodes[nodeName].component = comp.comp;
          }
          if (!!comp.meta) {
            nodes[nodeName].metadata={routes:comp.meta};
          }
         
        }
      
        parser.getResult = function () {
          return {processes:nodes, connections:parser.processEdges(), exports:parser.exports};
        }  
      
        var flatten = function (array, isShallow) {
          var index = -1,
            length = array ? array.length : 0,
            result = [];
      
          while (++index < length) {
            var value = array[index];
      
            if (value instanceof Array) {
              Array.prototype.push.apply(result, isShallow ? value : flatten(value));
            }
            else {
              result.push(value);
            }
          }
          return result;
        }
        
        parser.registerExports = function (priv, pub) {
          parser.exports.push({private:priv.toLowerCase(), public:pub.toLowerCase()})
        }
      
        parser.registerEdges = function (edges) {
      
          edges.forEach(function (o, i) {
            parser.edges.push(o);
          });
        }  
      
        parser.processEdges = function () {   
          var flats, grouped;
          flats = flatten(parser.edges);
          grouped = [];
          var current = {};
          flats.forEach(function (o, i) {
            if (i % 2 !== 0) { 
              var pair = grouped[grouped.length - 1];
              pair.tgt = o.tgt;
              return;
            }
            grouped.push(o);
          });
          return grouped;
        }
      
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos === input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos < input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos === 0|
       *   - |rightmostFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos !== input.length) {
        var offset = Math.max(pos, rightmostFailuresPos);
        var found = offset < input.length ? input.charAt(offset) : null;
        var errorPosition = computeErrorPosition();
        
        throw new this.SyntaxError(
          cleanupExpected(rightmostFailuresExpected),
          found,
          offset,
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(expected, found, offset, line, column) {
    function buildMessage(expected, found) {
      var expectedHumanized, foundHumanized;
      
      switch (expected.length) {
        case 0:
          expectedHumanized = "end of input";
          break;
        case 1:
          expectedHumanized = expected[0];
          break;
        default:
          expectedHumanized = expected.slice(0, expected.length - 1).join(", ")
            + " or "
            + expected[expected.length - 1];
      }
      
      foundHumanized = found ? quote(found) : "end of input";
      
      return "Expected " + expectedHumanized + " but " + foundHumanized + " found.";
    }
    
    this.name = "SyntaxError";
    this.expected = expected;
    this.found = found;
    this.message = buildMessage(expected, found);
    this.offset = offset;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();
});
require.register("noflo-noflo/src/lib/Graph.js", function(exports, require, module){
var EventEmitter, Graph,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
  EventEmitter = require('events').EventEmitter;
} else {
  EventEmitter = require('emitter');
}

Graph = (function(_super) {
  __extends(Graph, _super);

  Graph.prototype.name = '';

  Graph.prototype.nodes = [];

  Graph.prototype.edges = [];

  Graph.prototype.initializers = [];

  Graph.prototype.exports = [];

  function Graph(name) {
    this.name = name != null ? name : '';
    this.nodes = [];
    this.edges = [];
    this.initializers = [];
    this.exports = [];
  }

  Graph.prototype.addExport = function(privatePort, publicPort) {
    return this.exports.push({
      "private": privatePort.toLowerCase(),
      "public": publicPort.toLowerCase()
    });
  };

  Graph.prototype.addNode = function(id, component, metadata) {
    var node;
    if (!metadata) {
      metadata = {};
    }
    node = {
      id: id,
      component: component,
      metadata: metadata
    };
    this.nodes.push(node);
    this.emit('addNode', node);
    return node;
  };

  Graph.prototype.removeNode = function(id) {
    var edge, initializer, node, _i, _j, _len, _len1, _ref, _ref1;
    node = this.getNode(id);
    _ref = this.edges;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      edge = _ref[_i];
      if (!edge) {
        continue;
      }
      if (edge.from.node === node.id) {
        this.removeEdge(edge.from.node, edge.from.port);
      }
      if (edge.to.node === node.id) {
        this.removeEdge(edge.to.node, edge.to.port);
      }
    }
    _ref1 = this.initializers;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      initializer = _ref1[_j];
      if (!initializer) {
        continue;
      }
      if (initializer.to.node === node.id) {
        this.removeEdge(initializer.to.node, initializer.to.port);
      }
    }
    this.emit('removeNode', node);
    if (-1 !== this.nodes.indexOf(node)) {
      return this.nodes.splice(this.nodes.indexOf(node), 1);
    }
  };

  Graph.prototype.getNode = function(id) {
    var node, _i, _len, _ref;
    _ref = this.nodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      if (!node) {
        continue;
      }
      if (node.id === id) {
        return node;
      }
    }
    return null;
  };

  Graph.prototype.renameNode = function(oldId, newId) {
    var edge, iip, node, _i, _j, _len, _len1, _ref, _ref1;
    node = this.getNode(oldId);
    if (!node) {
      return;
    }
    node.id = newId;
    _ref = this.edges;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      edge = _ref[_i];
      if (!edge) {
        continue;
      }
      if (edge.from.node === oldId) {
        edge.from.node = newId;
      }
      if (edge.to.node === oldId) {
        edge.to.node = newId;
      }
    }
    _ref1 = this.initializers;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      iip = _ref1[_j];
      if (!iip) {
        continue;
      }
      if (iip.to.node === oldId) {
        iip.to.node = newId;
      }
    }
    return this.emit('renameNode', oldId, newId);
  };

  Graph.prototype.addEdge = function(outNode, outPort, inNode, inPort, metadata) {
    var edge;
    if (!metadata) {
      metadata = {};
    }
    edge = {
      from: {
        node: outNode,
        port: outPort
      },
      to: {
        node: inNode,
        port: inPort
      },
      metadata: metadata
    };
    this.edges.push(edge);
    this.emit('addEdge', edge);
    return edge;
  };

  Graph.prototype.removeEdge = function(node, port, node2, port2) {
    var edge, index, _i, _len, _ref, _results;
    _ref = this.edges;
    _results = [];
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      edge = _ref[index];
      if (!edge) {
        continue;
      }
      if (edge.from.node === node && edge.from.port === port) {
        if (node2 && port2) {
          if (!(edge.to.node === node2 && edge.to.port === port2)) {
            continue;
          }
        }
        this.emit('removeEdge', edge);
        this.edges.splice(index, 1);
      }
      if (edge.to.node === node && edge.to.port === port) {
        if (node2 && port2) {
          if (!(edge.from.node === node2 && edge.from.port === port2)) {
            continue;
          }
        }
        this.emit('removeEdge', edge);
        _results.push(this.edges.splice(index, 1));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Graph.prototype.addInitial = function(data, node, port, metadata) {
    var initializer;
    initializer = {
      from: {
        data: data
      },
      to: {
        node: node,
        port: port
      },
      metadata: metadata
    };
    this.initializers.push(initializer);
    this.emit('addInitial', initializer);
    return initializer;
  };

  Graph.prototype.removeInitial = function(node, port) {
    var edge, index, _i, _len, _ref, _results;
    _ref = this.initializers;
    _results = [];
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      edge = _ref[index];
      if (!edge) {
        continue;
      }
      if (edge.to.node === node && edge.to.port === port) {
        this.emit('removeInitial', edge);
        _results.push(this.initializers.splice(index, 1));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Graph.prototype.toDOT = function() {
    var cleanID, cleanPort, dot, edge, id, initializer, node, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
    cleanID = function(id) {
      return id.replace(/\s*/g, "");
    };
    cleanPort = function(port) {
      return port.replace(/\./g, "");
    };
    dot = "digraph {\n";
    _ref = this.nodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      dot += "    " + (cleanID(node.id)) + " [label=" + node.id + " shape=box]\n";
    }
    _ref1 = this.initializers;
    for (id = _j = 0, _len1 = _ref1.length; _j < _len1; id = ++_j) {
      initializer = _ref1[id];
      dot += "    data" + id + " [label=\"'" + initializer.from.data + "'\" shape=plaintext]\n";
      dot += "    data" + id + " -> " + (cleanID(initializer.to.node)) + "[headlabel=" + (cleanPort(initializer.to.port)) + " labelfontcolor=blue labelfontsize=8.0]\n";
    }
    _ref2 = this.edges;
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      edge = _ref2[_k];
      dot += "    " + (cleanID(edge.from.node)) + " -> " + (cleanID(edge.to.node)) + "[taillabel=" + (cleanPort(edge.from.port)) + " headlabel=" + (cleanPort(edge.to.port)) + " labelfontcolor=blue labelfontsize=8.0]\n";
    }
    dot += "}";
    return dot;
  };

  Graph.prototype.toYUML = function() {
    var edge, initializer, yuml, _i, _j, _len, _len1, _ref, _ref1;
    yuml = [];
    _ref = this.initializers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      initializer = _ref[_i];
      yuml.push("(start)[" + initializer.to.port + "]->(" + initializer.to.node + ")");
    }
    _ref1 = this.edges;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      edge = _ref1[_j];
      yuml.push("(" + edge.from.node + ")[" + edge.from.port + "]->(" + edge.to.node + ")");
    }
    return yuml.join(",");
  };

  Graph.prototype.toJSON = function() {
    var connection, edge, exported, initializer, json, node, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
    json = {
      properties: {},
      exports: [],
      processes: {},
      connections: []
    };
    if (this.name) {
      json.properties.name = this.name;
    }
    _ref = this.exports;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      exported = _ref[_i];
      json.exports.push({
        "private": exported["private"],
        "public": exported["public"]
      });
    }
    _ref1 = this.nodes;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      node = _ref1[_j];
      json.processes[node.id] = {
        component: node.component
      };
      if (node.metadata) {
        json.processes[node.id].metadata = node.metadata;
      }
    }
    _ref2 = this.edges;
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      edge = _ref2[_k];
      connection = {
        src: {
          process: edge.from.node,
          port: edge.from.port
        },
        tgt: {
          process: edge.to.node,
          port: edge.to.port
        }
      };
      if (Object.keys(edge.metadata).length) {
        connection.metadata = edge.metadata;
      }
      json.connections.push(connection);
    }
    _ref3 = this.initializers;
    for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
      initializer = _ref3[_l];
      json.connections.push({
        data: initializer.from.data,
        tgt: {
          process: initializer.to.node,
          port: initializer.to.port
        }
      });
    }
    return json;
  };

  Graph.prototype.save = function(file, success) {
    var json;
    json = JSON.stringify(this.toJSON(), null, 4);
    return require('fs').writeFile("" + file + ".json", json, "utf-8", function(err, data) {
      if (err) {
        throw err;
      }
      return success(file);
    });
  };

  return Graph;

})(EventEmitter);

exports.Graph = Graph;

exports.createGraph = function(name) {
  return new Graph(name);
};

exports.loadJSON = function(definition, success) {
  var conn, def, exported, graph, id, metadata, _i, _j, _len, _len1, _ref, _ref1, _ref2;
  if (!definition.properties) {
    definition.properties = {};
  }
  if (!definition.processes) {
    definition.processes = {};
  }
  if (!definition.connections) {
    definition.connections = [];
  }
  graph = new Graph(definition.properties.name);
  _ref = definition.processes;
  for (id in _ref) {
    def = _ref[id];
    if (!def.metadata) {
      def.metadata = {};
    }
    graph.addNode(id, def.component, def.metadata);
  }
  _ref1 = definition.connections;
  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
    conn = _ref1[_i];
    if (conn.data !== void 0) {
      graph.addInitial(conn.data, conn.tgt.process, conn.tgt.port.toLowerCase());
      continue;
    }
    metadata = conn.metadata ? conn.metadata : {};
    graph.addEdge(conn.src.process, conn.src.port.toLowerCase(), conn.tgt.process, conn.tgt.port.toLowerCase(), metadata);
  }
  if (definition.exports) {
    _ref2 = definition.exports;
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
      exported = _ref2[_j];
      graph.addExport(exported["private"], exported["public"]);
    }
  }
  return success(graph);
};

exports.loadFBP = function(fbpData, success) {
  var definition;
  definition = require('fbp').parse(fbpData);
  return exports.loadJSON(definition, success);
};

exports.loadFile = function(file, success) {
  var definition, e;
  if (!(typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1)) {
    try {
      definition = require(file);
      exports.loadJSON(definition, success);
    } catch (_error) {
      e = _error;
      throw new Error("Failed to load graph " + file + ": " + e.message);
    }
    return;
  }
  return require('fs').readFile(file, "utf-8", function(err, data) {
    if (err) {
      throw err;
    }
    if (file.split('.').pop() === 'fbp') {
      return exports.loadFBP(data, success);
    }
    definition = JSON.parse(data);
    return exports.loadJSON(definition, success);
  });
};

});
require.register("noflo-noflo/src/lib/InternalSocket.js", function(exports, require, module){
var EventEmitter, InternalSocket,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
  EventEmitter = require('events').EventEmitter;
} else {
  EventEmitter = require('emitter');
}

InternalSocket = (function(_super) {
  __extends(InternalSocket, _super);

  function InternalSocket() {
    this.connected = false;
    this.groups = [];
  }

  InternalSocket.prototype.connect = function() {
    if (this.connected) {
      return;
    }
    this.connected = true;
    return this.emit('connect', this);
  };

  InternalSocket.prototype.disconnect = function() {
    if (!this.connected) {
      return;
    }
    this.connected = false;
    return this.emit('disconnect', this);
  };

  InternalSocket.prototype.isConnected = function() {
    return this.connected;
  };

  InternalSocket.prototype.send = function(data) {
    if (!this.connected) {
      this.connect();
    }
    return this.emit('data', data);
  };

  InternalSocket.prototype.beginGroup = function(group) {
    this.groups.push(group);
    return this.emit('begingroup', group);
  };

  InternalSocket.prototype.endGroup = function() {
    return this.emit('endgroup', this.groups.pop());
  };

  InternalSocket.prototype.getId = function() {
    var fromStr, toStr;
    fromStr = function(from) {
      return "" + from.process.id + "() " + (from.port.toUpperCase());
    };
    toStr = function(to) {
      return "" + (to.port.toUpperCase()) + " " + to.process.id + "()";
    };
    if (!(this.from || this.to)) {
      return "UNDEFINED";
    }
    if (this.from && !this.to) {
      return "" + (fromStr(this.from)) + " -> ANON";
    }
    if (!this.from) {
      return "DATA -> " + (toStr(this.to));
    }
    return "" + (fromStr(this.from)) + " -> " + (toStr(this.to));
  };

  return InternalSocket;

})(EventEmitter);

exports.InternalSocket = InternalSocket;

exports.createSocket = function() {
  return new InternalSocket;
};

});
require.register("noflo-noflo/src/lib/Port.js", function(exports, require, module){
var EventEmitter, Port,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
  EventEmitter = require('events').EventEmitter;
} else {
  EventEmitter = require('emitter');
}

Port = (function(_super) {
  __extends(Port, _super);

  function Port(type) {
    this.type = type;
    if (!this.type) {
      this.type = 'all';
    }
    this.socket = null;
    this.from = null;
  }

  Port.prototype.attach = function(socket) {
    if (this.isAttached()) {
      throw new Error("" + this.name + ": Socket already attached " + (this.socket.getId()) + " - " + (socket.getId()));
    }
    this.socket = socket;
    return this.attachSocket(socket);
  };

  Port.prototype.attachSocket = function(socket, localId) {
    var _this = this;
    if (localId == null) {
      localId = null;
    }
    this.emit("attach", socket);
    this.from = socket.from;
    if (socket.setMaxListeners) {
      socket.setMaxListeners(0);
    }
    socket.on("connect", function() {
      return _this.emit("connect", socket, localId);
    });
    socket.on("begingroup", function(group) {
      return _this.emit("begingroup", group, localId);
    });
    socket.on("data", function(data) {
      return _this.emit("data", data, localId);
    });
    socket.on("endgroup", function(group) {
      return _this.emit("endgroup", group, localId);
    });
    return socket.on("disconnect", function() {
      return _this.emit("disconnect", socket, localId);
    });
  };

  Port.prototype.connect = function() {
    if (!this.socket) {
      throw new Error("No connection available");
    }
    return this.socket.connect();
  };

  Port.prototype.beginGroup = function(group) {
    var _this = this;
    if (!this.socket) {
      throw new Error("No connection available");
    }
    if (this.isConnected()) {
      return this.socket.beginGroup(group);
    }
    this.socket.once("connect", function() {
      return _this.socket.beginGroup(group);
    });
    return this.socket.connect();
  };

  Port.prototype.send = function(data) {
    var _this = this;
    if (!this.socket) {
      throw new Error("No connection available");
    }
    if (this.isConnected()) {
      return this.socket.send(data);
    }
    this.socket.once("connect", function() {
      return _this.socket.send(data);
    });
    return this.socket.connect();
  };

  Port.prototype.endGroup = function() {
    if (!this.socket) {
      throw new Error("No connection available");
    }
    return this.socket.endGroup();
  };

  Port.prototype.disconnect = function() {
    if (!this.socket) {
      throw new Error("No connection available");
    }
    return this.socket.disconnect();
  };

  Port.prototype.detach = function(socket) {
    if (!this.isAttached(socket)) {
      return;
    }
    this.emit("detach", this.socket);
    this.from = null;
    return this.socket = null;
  };

  Port.prototype.isConnected = function() {
    if (!this.socket) {
      return false;
    }
    return this.socket.isConnected();
  };

  Port.prototype.isAttached = function() {
    return this.socket !== null;
  };

  return Port;

})(EventEmitter);

exports.Port = Port;

});
require.register("noflo-noflo/src/lib/ArrayPort.js", function(exports, require, module){
var ArrayPort, port,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

port = require("./Port");

ArrayPort = (function(_super) {
  __extends(ArrayPort, _super);

  function ArrayPort(type) {
    this.type = type;
    if (!this.type) {
      this.type = 'all';
    }
    this.sockets = [];
  }

  ArrayPort.prototype.attach = function(socket) {
    this.sockets.push(socket);
    return this.attachSocket(socket, this.sockets.length - 1);
  };

  ArrayPort.prototype.connect = function(socketId) {
    if (socketId == null) {
      socketId = null;
    }
    if (socketId === null) {
      if (!this.sockets.length) {
        throw new Error("No sockets available");
      }
      this.sockets.forEach(function(socket) {
        return socket.connect();
      });
      return;
    }
    if (!this.sockets[socketId]) {
      throw new Error("No socket '" + socketId + "' available");
    }
    return this.sockets[socketId].connect();
  };

  ArrayPort.prototype.beginGroup = function(group, socketId) {
    var _this = this;
    if (socketId == null) {
      socketId = null;
    }
    if (socketId === null) {
      if (!this.sockets.length) {
        throw new Error("No sockets available");
      }
      this.sockets.forEach(function(socket, index) {
        return _this.beginGroup(group, index);
      });
      return;
    }
    if (!this.sockets[socketId]) {
      throw new Error("No socket '" + socketId + "' available");
    }
    if (this.isConnected(socketId)) {
      return this.sockets[socketId].beginGroup(group);
    }
    this.sockets[socketId].once("connect", function() {
      return _this.sockets[socketId].beginGroup(group);
    });
    return this.sockets[socketId].connect();
  };

  ArrayPort.prototype.send = function(data, socketId) {
    var _this = this;
    if (socketId == null) {
      socketId = null;
    }
    if (socketId === null) {
      if (!this.sockets.length) {
        throw new Error("No sockets available");
      }
      this.sockets.forEach(function(socket, index) {
        return _this.send(data, index);
      });
      return;
    }
    if (!this.sockets[socketId]) {
      throw new Error("No socket '" + socketId + "' available");
    }
    if (this.isConnected(socketId)) {
      return this.sockets[socketId].send(data);
    }
    this.sockets[socketId].once("connect", function() {
      return _this.sockets[socketId].send(data);
    });
    return this.sockets[socketId].connect();
  };

  ArrayPort.prototype.endGroup = function(socketId) {
    var _this = this;
    if (socketId == null) {
      socketId = null;
    }
    if (socketId === null) {
      if (!this.sockets.length) {
        throw new Error("No sockets available");
      }
      this.sockets.forEach(function(socket, index) {
        return _this.endGroup(index);
      });
      return;
    }
    if (!this.sockets[socketId]) {
      throw new Error("No socket '" + socketId + "' available");
    }
    return this.sockets[socketId].endGroup();
  };

  ArrayPort.prototype.disconnect = function(socketId) {
    var socket, _i, _len, _ref;
    if (socketId == null) {
      socketId = null;
    }
    if (socketId === null) {
      if (!this.sockets.length) {
        throw new Error("No sockets available");
      }
      _ref = this.sockets;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        socket = _ref[_i];
        socket.disconnect();
      }
      return;
    }
    if (!this.sockets[socketId]) {
      return;
    }
    return this.sockets[socketId].disconnect();
  };

  ArrayPort.prototype.detach = function(socket) {
    if (this.sockets.indexOf(socket) === -1) {
      return;
    }
    this.sockets.splice(this.sockets.indexOf(socket), 1);
    return this.emit("detach", socket);
  };

  ArrayPort.prototype.isConnected = function(socketId) {
    var connected,
      _this = this;
    if (socketId == null) {
      socketId = null;
    }
    if (socketId === null) {
      connected = false;
      this.sockets.forEach(function(socket) {
        if (socket.isConnected()) {
          return connected = true;
        }
      });
      return connected;
    }
    if (!this.sockets[socketId]) {
      return false;
    }
    return this.sockets[socketId].isConnected();
  };

  ArrayPort.prototype.isAttached = function(socketId) {
    if (socketId === void 0) {
      return false;
    }
    if (this.sockets[socketId]) {
      return true;
    }
    return false;
  };

  return ArrayPort;

})(port.Port);

exports.ArrayPort = ArrayPort;

});
require.register("noflo-noflo/src/lib/Component.js", function(exports, require, module){
var Component, EventEmitter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
  EventEmitter = require('events').EventEmitter;
} else {
  EventEmitter = require('emitter');
}

Component = (function(_super) {
  __extends(Component, _super);

  function Component() {
    _ref = Component.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Component.prototype.description = "";

  Component.prototype.getDescription = function() {
    return this.description;
  };

  Component.prototype.isReady = function() {
    return true;
  };

  Component.prototype.isSubgraph = function() {
    return false;
  };

  return Component;

})(EventEmitter);

exports.Component = Component;

});
require.register("noflo-noflo/src/lib/AsyncComponent.js", function(exports, require, module){
var AsyncComponent, component, port,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

port = require("./Port");

component = require("./Component");

AsyncComponent = (function(_super) {
  __extends(AsyncComponent, _super);

  function AsyncComponent(inPortName, outPortName, errPortName) {
    var _this = this;
    this.inPortName = inPortName != null ? inPortName : "in";
    this.outPortName = outPortName != null ? outPortName : "out";
    this.errPortName = errPortName != null ? errPortName : "error";
    if (!this.inPorts[this.inPortName]) {
      throw new Error("no inPort named '" + this.inPortName + "'");
    }
    if (!this.outPorts[this.outPortName]) {
      throw new Error("no outPort named '" + this.outPortName + "'");
    }
    this.load = 0;
    this.q = [];
    this.outPorts.load = new port.Port();
    this.inPorts[this.inPortName].on("begingroup", function(group) {
      if (_this.load > 0) {
        return _this.q.push({
          name: "begingroup",
          data: group
        });
      }
      return _this.outPorts[_this.outPortName].beginGroup(group);
    });
    this.inPorts[this.inPortName].on("endgroup", function() {
      if (_this.load > 0) {
        return _this.q.push({
          name: "endgroup"
        });
      }
      return _this.outPorts[_this.outPortName].endGroup();
    });
    this.inPorts[this.inPortName].on("disconnect", function() {
      if (_this.load > 0) {
        return _this.q.push({
          name: "disconnect"
        });
      }
      _this.outPorts[_this.outPortName].disconnect();
      if (_this.outPorts.load.isAttached()) {
        return _this.outPorts.load.disconnect();
      }
    });
    this.inPorts[this.inPortName].on("data", function(data) {
      if (_this.q.length > 0) {
        return _this.q.push({
          name: "data",
          data: data
        });
      }
      return _this.processData(data);
    });
  }

  AsyncComponent.prototype.processData = function(data) {
    var _this = this;
    this.incrementLoad();
    return this.doAsync(data, function(err) {
      if (err) {
        if (_this.outPorts[_this.errPortName] && _this.outPorts[_this.errPortName].isAttached()) {
          _this.outPorts[_this.errPortName].send(err);
          _this.outPorts[_this.errPortName].disconnect();
        } else {
          throw err;
        }
      }
      return _this.decrementLoad();
    });
  };

  AsyncComponent.prototype.incrementLoad = function() {
    this.load++;
    if (this.outPorts.load.isAttached()) {
      this.outPorts.load.send(this.load);
    }
    if (this.outPorts.load.isAttached()) {
      return this.outPorts.load.disconnect();
    }
  };

  AsyncComponent.prototype.doAsync = function(data, callback) {
    return callback(new Error("AsyncComponents must implement doAsync"));
  };

  AsyncComponent.prototype.decrementLoad = function() {
    var _this = this;
    if (this.load === 0) {
      throw new Error("load cannot be negative");
    }
    this.load--;
    if (this.outPorts.load.isAttached()) {
      this.outPorts.load.send(this.load);
    }
    if (this.outPorts.load.isAttached()) {
      this.outPorts.load.disconnect();
    }
    if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
      return process.nextTick(function() {
        return _this.processQueue();
      });
    } else {
      return setTimeout(function() {
        return _this.processQueue();
      }, 0);
    }
  };

  AsyncComponent.prototype.processQueue = function() {
    var event, processedData;
    if (this.load > 0) {
      return;
    }
    processedData = false;
    while (this.q.length > 0) {
      event = this.q[0];
      switch (event.name) {
        case "begingroup":
          if (processedData) {
            return;
          }
          this.outPorts[this.outPortName].beginGroup(event.data);
          this.q.shift();
          break;
        case "endgroup":
          if (processedData) {
            return;
          }
          this.outPorts[this.outPortName].endGroup();
          this.q.shift();
          break;
        case "disconnect":
          if (processedData) {
            return;
          }
          this.outPorts[this.outPortName].disconnect();
          if (this.outPorts.load.isAttached()) {
            this.outPorts.load.disconnect();
          }
          this.q.shift();
          break;
        case "data":
          this.processData(event.data);
          this.q.shift();
          processedData = true;
      }
    }
  };

  return AsyncComponent;

})(component.Component);

exports.AsyncComponent = AsyncComponent;

});
require.register("noflo-noflo/src/lib/LoggingComponent.js", function(exports, require, module){
var Component, Port, util,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Component = require("./Component").Component;

Port = require("./Port").Port;

if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
  util = require("util");
} else {
  util = {
    inspect: function(data) {
      return data;
    }
  };
}

exports.LoggingComponent = (function(_super) {
  __extends(LoggingComponent, _super);

  function LoggingComponent() {
    this.sendLog = __bind(this.sendLog, this);
    this.outPorts = {
      log: new Port()
    };
  }

  LoggingComponent.prototype.sendLog = function(message) {
    if (typeof message === "object") {
      message.when = new Date;
      message.source = this.constructor.name;
      if (this.nodeId != null) {
        message.nodeID = this.nodeId;
      }
    }
    if ((this.outPorts.log != null) && this.outPorts.log.isAttached()) {
      return this.outPorts.log.send(message);
    } else {
      return console.log(util.inspect(message, 4, true, true));
    }
  };

  return LoggingComponent;

})(Component);

});
require.register("noflo-noflo/src/lib/ComponentLoader.js", function(exports, require, module){
var ComponentLoader, internalSocket;

internalSocket = require('./InternalSocket');

ComponentLoader = (function() {
  function ComponentLoader(baseDir) {
    this.baseDir = baseDir;
    this.components = null;
    this.checked = [];
    this.revalidate = false;
  }

  ComponentLoader.prototype.getModulePrefix = function(name) {
    if (!name) {
      return '';
    }
    if (name === 'noflo') {
      return '';
    }
    return name.replace('noflo-', '');
  };

  ComponentLoader.prototype.getModuleComponents = function(moduleName) {
    var cPath, definition, dependency, e, name, prefix, _ref, _ref1, _results;
    if (this.checked.indexOf(moduleName) !== -1) {
      return;
    }
    this.checked.push(moduleName);
    try {
      definition = require("/" + moduleName + "/component.json");
    } catch (_error) {
      e = _error;
      return;
    }
    for (dependency in definition.dependencies) {
      this.getModuleComponents(dependency.replace('/', '-'));
    }
    if (!definition.noflo) {
      return;
    }
    prefix = this.getModulePrefix(definition.name);
    if (moduleName[0] === '/') {
      moduleName = moduleName.substr(1);
    }
    if (definition.noflo.components) {
      _ref = definition.noflo.components;
      for (name in _ref) {
        cPath = _ref[name];
        this.registerComponent(prefix, name, "/" + moduleName + "/" + cPath);
      }
    }
    if (definition.noflo.graphs) {
      _ref1 = definition.noflo.graphs;
      _results = [];
      for (name in _ref1) {
        cPath = _ref1[name];
        _results.push(this.registerComponent(prefix, name, "/" + moduleName + "/" + cPath));
      }
      return _results;
    }
  };

  ComponentLoader.prototype.listComponents = function(callback) {
    if (this.components !== null) {
      return callback(this.components);
    }
    this.components = {};
    this.getModuleComponents(this.baseDir);
    return callback(this.components);
  };

  ComponentLoader.prototype.load = function(name, callback) {
    var component, componentName, implementation, instance,
      _this = this;
    if (!this.components) {
      this.listComponents(function(components) {
        return _this.load(name, callback);
      });
      return;
    }
    component = this.components[name];
    if (!component) {
      for (componentName in this.components) {
        if (componentName.split('/')[1] === name) {
          component = this.components[componentName];
          break;
        }
      }
      if (!component) {
        throw new Error("Component " + name + " not available with base " + this.baseDir);
        return;
      }
    }
    if (this.isGraph(component)) {
      if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
        process.nextTick(function() {
          return _this.loadGraph(name, callback);
        });
      } else {
        setTimeout(function() {
          return _this.loadGraph(name, callback);
        }, 0);
      }
      return;
    }
    if (typeof component === 'function') {
      implementation = component;
      instance = new component;
    } else {
      implementation = require(component);
      instance = implementation.getComponent();
    }
    if (name === 'Graph') {
      instance.baseDir = this.baseDir;
    }
    return callback(instance);
  };

  ComponentLoader.prototype.isGraph = function(cPath) {
    if (typeof cPath !== 'string') {
      return false;
    }
    return cPath.indexOf('.fbp') !== -1 || cPath.indexOf('.json') !== -1;
  };

  ComponentLoader.prototype.loadGraph = function(name, callback) {
    var graph, graphImplementation, graphSocket;
    graphImplementation = require(this.components['Graph']);
    graphSocket = internalSocket.createSocket();
    graph = graphImplementation.getComponent();
    graph.baseDir = this.baseDir;
    graph.inPorts.graph.attach(graphSocket);
    graphSocket.send(this.components[name]);
    graphSocket.disconnect();
    delete graph.inPorts.graph;
    delete graph.inPorts.start;
    return callback(graph);
  };

  ComponentLoader.prototype.registerComponent = function(packageId, name, cPath, callback) {
    var fullName, prefix;
    prefix = this.getModulePrefix(packageId);
    fullName = "" + prefix + "/" + name;
    if (!packageId) {
      fullName = name;
    }
    this.components[fullName] = cPath;
    if (callback) {
      return callback();
    }
  };

  ComponentLoader.prototype.registerGraph = function(packageId, name, gPath, callback) {
    return this.registerComponent(packageId, name, gPath, callback);
  };

  ComponentLoader.prototype.clear = function() {
    this.components = null;
    this.checked = [];
    return this.revalidate = true;
  };

  return ComponentLoader;

})();

exports.ComponentLoader = ComponentLoader;

});
require.register("noflo-noflo/src/lib/NoFlo.js", function(exports, require, module){
exports.graph = require('./Graph');

exports.Graph = exports.graph.Graph;

exports.Network = require('./Network').Network;

exports.isBrowser = function() {
  if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
    return false;
  }
  return true;
};

if (!exports.isBrowser()) {
  exports.ComponentLoader = require('./nodejs/ComponentLoader').ComponentLoader;
} else {
  exports.ComponentLoader = require('./ComponentLoader').ComponentLoader;
}

exports.Component = require('./Component').Component;

exports.AsyncComponent = require('./AsyncComponent').AsyncComponent;

exports.LoggingComponent = require('./LoggingComponent').LoggingComponent;

exports.Port = require('./Port').Port;

exports.ArrayPort = require('./ArrayPort').ArrayPort;

exports.internalSocket = require('./InternalSocket');

exports.createNetwork = function(graph, callback, delay) {
  var network, networkReady;
  network = new exports.Network(graph);
  networkReady = function(network) {
    if (callback != null) {
      callback(network);
    }
    return network.sendInitials();
  };
  if (graph.nodes.length === 0) {
    setTimeout(function() {
      return networkReady(network);
    }, 0);
    return network;
  }
  network.loader.listComponents(function() {
    if (delay) {
      if (callback != null) {
        callback(network);
      }
      return;
    }
    return network.connect(function() {
      return networkReady(network);
    });
  });
  return network;
};

exports.loadFile = function(file, callback) {
  return exports.graph.loadFile(file, function(net) {
    return exports.createNetwork(net, callback);
  });
};

exports.saveFile = function(graph, file, callback) {
  return exports.graph.save(file, function() {
    return callback(file);
  });
};

});
require.register("noflo-noflo/src/lib/Network.js", function(exports, require, module){
var EventEmitter, Network, componentLoader, graph, internalSocket, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = require("underscore");

internalSocket = require("./InternalSocket");

graph = require("./Graph");

if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
  componentLoader = require("./nodejs/ComponentLoader");
  EventEmitter = require('events').EventEmitter;
} else {
  componentLoader = require('./ComponentLoader');
  EventEmitter = require('emitter');
}

Network = (function(_super) {
  __extends(Network, _super);

  Network.prototype.processes = {};

  Network.prototype.connections = [];

  Network.prototype.initials = [];

  Network.prototype.graph = null;

  Network.prototype.startupDate = null;

  Network.prototype.portBuffer = {};

  function Network(graph) {
    var _this = this;
    this.processes = {};
    this.connections = [];
    this.initials = [];
    this.graph = graph;
    if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
      this.baseDir = graph.baseDir || process.cwd();
    } else {
      this.baseDir = graph.baseDir || '/';
    }
    this.startupDate = new Date();
    this.handleStartEnd();
    this.graph.on('addNode', function(node) {
      return _this.addNode(node);
    });
    this.graph.on('removeNode', function(node) {
      return _this.removeNode(node);
    });
    this.graph.on('renameNode', function(oldId, newId) {
      return _this.renameNode(oldId, newId);
    });
    this.graph.on('addEdge', function(edge) {
      return _this.addEdge(edge);
    });
    this.graph.on('removeEdge', function(edge) {
      return _this.removeEdge(edge);
    });
    this.graph.on('addInitial', function(iip) {
      return _this.addInitial(iip);
    });
    this.graph.on('removeInitial', function(iip) {
      return _this.removeInitial(iip);
    });
    this.loader = new componentLoader.ComponentLoader(this.baseDir);
  }

  Network.prototype.uptime = function() {
    return new Date() - this.startupDate;
  };

  Network.prototype.handleStartEnd = function() {
    var connections, ended, started, timeOut,
      _this = this;
    connections = 0;
    started = false;
    ended = false;
    timeOut = null;
    this.on('connect', function(data) {
      if (!data.socket.from) {
        return;
      }
      if (timeOut) {
        clearTimeout(timeOut);
      }
      if (connections === 0 && !started) {
        _this.emit('start', {
          start: _this.startupDate
        });
        started = true;
      }
      return connections++;
    });
    return this.on('disconnect', function(data) {
      if (!data.socket.from) {
        return;
      }
      connections--;
      if (!(connections <= 0)) {
        return;
      }
      return timeOut = setTimeout(function() {
        if (ended) {
          return;
        }
        _this.emit('end', {
          start: _this.startupDate,
          end: new Date,
          uptime: _this.uptime()
        });
        started = false;
        return ended = true;
      }, 10);
    });
  };

  Network.prototype.load = function(component, callback) {
    if (typeof component === 'object') {
      return callback(component);
    }
    return this.loader.load(component, callback);
  };

  Network.prototype.addNode = function(node, callback) {
    var process,
      _this = this;
    if (this.processes[node.id]) {
      return;
    }
    process = {
      id: node.id
    };
    if (!node.component) {
      this.processes[process.id] = process;
      if (callback) {
        callback(process);
      }
      return;
    }
    return this.load(node.component, function(instance) {
      instance.nodeId = node.id;
      process.component = instance;
      if (instance.isSubgraph()) {
        _this.subscribeSubgraph(node.id, instance);
      }
      _this.processes[process.id] = process;
      if (callback) {
        return callback(process);
      }
    });
  };

  Network.prototype.removeNode = function(node) {
    if (!this.processes[node.id]) {
      return;
    }
    return delete this.processes[node.id];
  };

  Network.prototype.renameNode = function(oldId, newId) {
    var process;
    process = this.getNode(oldId);
    if (!process) {
      return;
    }
    process.id = newId;
    this.processes[newId] = process;
    return delete this.processes[oldId];
  };

  Network.prototype.getNode = function(id) {
    return this.processes[id];
  };

  Network.prototype.connect = function(done) {
    var edges, initializers, nodes, serialize,
      _this = this;
    if (done == null) {
      done = function() {};
    }
    serialize = function(next, add) {
      return function(type) {
        return _this["add" + type](add, function() {
          return next(type);
        });
      };
    };
    initializers = _.reduceRight(this.graph.initializers, serialize, done);
    edges = _.reduceRight(this.graph.edges, serialize, function() {
      return initializers("Initial");
    });
    nodes = _.reduceRight(this.graph.nodes, serialize, function() {
      return edges("Edge");
    });
    return nodes("Node");
  };

  Network.prototype.connectPort = function(socket, process, port, inbound) {
    if (inbound) {
      socket.to = {
        process: process,
        port: port
      };
      if (!(process.component.inPorts && process.component.inPorts[port])) {
        throw new Error("No inport '" + port + "' defined in process " + process.id + " (" + (socket.getId()) + ")");
        return;
      }
      return process.component.inPorts[port].attach(socket);
    }
    socket.from = {
      process: process,
      port: port
    };
    if (!(process.component.outPorts && process.component.outPorts[port])) {
      throw new Error("No outport '" + port + "' defined in process " + process.id + " (" + (socket.getId()) + ")");
      return;
    }
    return process.component.outPorts[port].attach(socket);
  };

  Network.prototype.subscribeSubgraph = function(nodeName, process) {
    var emitSub,
      _this = this;
    if (!process.isReady()) {
      process.once('ready', function() {
        _this.subscribeSubgraph(nodeName, process);
      });
    }
    if (!process.network) {
      return;
    }
    emitSub = function(type, data) {
      if (!data) {
        data = {};
      }
      if (data.subgraph) {
        data.subgraph = "" + nodeName + ":" + data.subgraph;
      } else {
        data.subgraph = nodeName;
      }
      return _this.emit(type, data);
    };
    process.network.on('connect', function(data) {
      return emitSub('connect', data);
    });
    process.network.on('begingroup', function(data) {
      return emitSub('begingroup', data);
    });
    process.network.on('data', function(data) {
      return emitSub('data', data);
    });
    process.network.on('endgroup', function(data) {
      return emitSub('endgroup', data);
    });
    return process.network.on('disconnect', function(data) {
      return emitSub('disconnect', data);
    });
  };

  Network.prototype.subscribeSocket = function(socket) {
    var _this = this;
    socket.on('connect', function() {
      return _this.emit('connect', {
        id: socket.getId(),
        socket: socket
      });
    });
    socket.on('begingroup', function(group) {
      return _this.emit('begingroup', {
        id: socket.getId(),
        socket: socket,
        group: group
      });
    });
    socket.on('data', function(data) {
      return _this.emit('data', {
        id: socket.getId(),
        socket: socket,
        data: data
      });
    });
    socket.on('endgroup', function(group) {
      return _this.emit('endgroup', {
        id: socket.getId(),
        socket: socket,
        group: group
      });
    });
    return socket.on('disconnect', function() {
      return _this.emit('disconnect', {
        id: socket.getId(),
        socket: socket
      });
    });
  };

  Network.prototype.addEdge = function(edge, callback) {
    var from, socket, to,
      _this = this;
    socket = internalSocket.createSocket();
    from = this.getNode(edge.from.node);
    if (!from) {
      throw new Error("No process defined for outbound node " + edge.from.node);
    }
    if (!from.component) {
      throw new Error("No component defined for outbound node " + edge.from.node);
    }
    if (!from.component.isReady()) {
      from.component.once("ready", function() {
        return _this.addEdge(edge, callback);
      });
      return;
    }
    to = this.getNode(edge.to.node);
    if (!to) {
      throw new Error("No process defined for inbound node " + edge.to.node);
    }
    if (!to.component) {
      throw new Error("No component defined for inbound node " + edge.to.node);
    }
    if (!to.component.isReady()) {
      to.component.once("ready", function() {
        return _this.addEdge(edge, callback);
      });
      return;
    }
    this.connectPort(socket, to, edge.to.port, true);
    this.connectPort(socket, from, edge.from.port, false);
    this.subscribeSocket(socket);
    this.connections.push(socket);
    if (callback) {
      return callback();
    }
  };

  Network.prototype.removeEdge = function(edge) {
    var connection, _i, _len, _ref, _results;
    _ref = this.connections;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      connection = _ref[_i];
      if (!connection) {
        continue;
      }
      if (!(edge.to.node === connection.to.process.id && edge.to.port === connection.to.port)) {
        continue;
      }
      connection.to.process.component.inPorts[connection.to.port].detach(connection);
      if (edge.from.node) {
        if (connection.from && edge.from.node === connection.from.process.id && edge.from.port === connection.from.port) {
          connection.from.process.component.outPorts[connection.from.port].detach(connection);
        }
      }
      _results.push(this.connections.splice(this.connections.indexOf(connection), 1));
    }
    return _results;
  };

  Network.prototype.addInitial = function(initializer, callback) {
    var socket, to,
      _this = this;
    socket = internalSocket.createSocket();
    this.subscribeSocket(socket);
    to = this.getNode(initializer.to.node);
    if (!to) {
      throw new Error("No process defined for inbound node " + initializer.to.node);
    }
    if (!(to.component.isReady() || to.component.inPorts[initializer.to.port])) {
      to.component.setMaxListeners(0);
      to.component.once("ready", function() {
        return _this.addInitial(initializer, callback);
      });
      return;
    }
    this.connectPort(socket, to, initializer.to.port, true);
    this.connections.push(socket);
    this.initials.push({
      socket: socket,
      data: initializer.from.data
    });
    if (callback) {
      return callback();
    }
  };

  Network.prototype.removeInitial = function(initializer) {
    var connection, _i, _len, _ref, _results;
    _ref = this.connections;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      connection = _ref[_i];
      if (!connection) {
        continue;
      }
      if (!(initializer.to.node === connection.to.process.id && initializer.to.port === connection.to.port)) {
        continue;
      }
      connection.to.process.component.inPorts[connection.to.port].detach(connection);
      _results.push(this.connections.splice(this.connections.indexOf(connection), 1));
    }
    return _results;
  };

  Network.prototype.sendInitial = function(initial) {
    initial.socket.connect();
    initial.socket.send(initial.data);
    return initial.socket.disconnect();
  };

  Network.prototype.sendInitials = function() {
    var send,
      _this = this;
    send = function() {
      var initial, _i, _len, _ref;
      _ref = _this.initials;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        initial = _ref[_i];
        _this.sendInitial(initial);
      }
      return _this.initials = [];
    };
    if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
      return process.nextTick(send);
    } else {
      return setTimeout(send, 0);
    }
  };

  return Network;

})(EventEmitter);

exports.Network = Network;

});
require.register("noflo-noflo/src/components/Graph.js", function(exports, require, module){
var Graph, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
  noflo = require("../../lib/NoFlo");
} else {
  noflo = require('../lib/NoFlo');
}

Graph = (function(_super) {
  __extends(Graph, _super);

  function Graph() {
    var _this = this;
    this.network = null;
    this.ready = true;
    this.started = false;
    this.baseDir = null;
    this.inPorts = {
      graph: new noflo.Port('all'),
      start: new noflo.Port('bang')
    };
    this.outPorts = {};
    this.inPorts.graph.on("data", function(data) {
      return _this.setGraph(data);
    });
    this.inPorts.start.on("data", function() {
      _this.started = true;
      if (!_this.network) {
        return;
      }
      return _this.network.connect(function() {
        var name, notReady, process, _ref;
        _this.network.sendInitials();
        notReady = false;
        _ref = _this.network.processes;
        for (name in _ref) {
          process = _ref[name];
          if (!_this.checkComponent(name, process)) {
            notReady = true;
          }
        }
        if (!notReady) {
          return _this.setToReady();
        }
      });
    });
  }

  Graph.prototype.setGraph = function(graph) {
    var _this = this;
    this.ready = false;
    if (typeof graph === 'object') {
      if (typeof graph.addNode === 'function') {
        return this.createNetwork(graph);
      }
      noflo.graph.loadJSON(graph, function(instance) {
        instance.baseDir = _this.baseDir;
        return _this.createNetwork(instance);
      });
      return;
    }
    if (graph.substr(0, 1) !== "/") {
      graph = "" + (process.cwd()) + "/" + graph;
    }
    return graph = noflo.graph.loadFile(graph, function(instance) {
      instance.baseDir = _this.baseDir;
      return _this.createNetwork(instance);
    });
  };

  Graph.prototype.createNetwork = function(graph) {
    var _ref,
      _this = this;
    if (((_ref = this.inPorts.start) != null ? _ref.isAttached() : void 0) && !this.started) {
      noflo.createNetwork(graph, function(network) {
        _this.network = network;
        return _this.emit('network', _this.network);
      }, true);
      return;
    }
    return noflo.createNetwork(graph, function(network) {
      var name, notReady, process, _ref1;
      _this.network = network;
      _this.emit('network', _this.network);
      notReady = false;
      _ref1 = _this.network.processes;
      for (name in _ref1) {
        process = _ref1[name];
        if (!_this.checkComponent(name, process)) {
          notReady = true;
        }
      }
      if (!notReady) {
        return _this.setToReady();
      }
    });
  };

  Graph.prototype.checkComponent = function(name, process) {
    var _this = this;
    if (!process.component.isReady()) {
      process.component.once("ready", function() {
        _this.checkComponent(name, process);
        return _this.setToReady();
      });
      return false;
    }
    this.findEdgePorts(name, process);
    return true;
  };

  Graph.prototype.portName = function(nodeName, portName) {
    return "" + (nodeName.toLowerCase()) + "." + portName;
  };

  Graph.prototype.isExported = function(port, nodeName, portName) {
    var exported, newPort, _i, _len, _ref;
    newPort = this.portName(nodeName, portName);
    if (port.isAttached()) {
      return false;
    }
    if (this.network.graph.exports.length === 0) {
      return newPort;
    }
    _ref = this.network.graph.exports;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      exported = _ref[_i];
      if (exported["private"] === newPort) {
        return exported["public"];
      }
    }
    return false;
  };

  Graph.prototype.setToReady = function() {
    var _this = this;
    if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
      return process.nextTick(function() {
        _this.ready = true;
        return _this.emit('ready');
      });
    } else {
      return setTimeout(function() {
        _this.ready = true;
        return _this.emit('ready');
      }, 0);
    }
  };

  Graph.prototype.findEdgePorts = function(name, process) {
    var port, portName, targetPortName, _ref, _ref1;
    _ref = process.component.inPorts;
    for (portName in _ref) {
      port = _ref[portName];
      targetPortName = this.isExported(port, name, portName);
      if (targetPortName === false) {
        continue;
      }
      this.inPorts[targetPortName] = port;
    }
    _ref1 = process.component.outPorts;
    for (portName in _ref1) {
      port = _ref1[portName];
      targetPortName = this.isExported(port, name, portName);
      if (targetPortName === false) {
        continue;
      }
      this.outPorts[targetPortName] = port;
    }
    return true;
  };

  Graph.prototype.isReady = function() {
    return this.ready;
  };

  Graph.prototype.isSubgraph = function() {
    return true;
  };

  return Graph;

})(noflo.Component);

exports.getComponent = function() {
  return new Graph;
};

});
require.register("noflo-noflo/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo","description":"Flow-Based Programming environment for JavaScript","keywords":["fbp","workflow","flow"],"repo":"noflo/noflo","version":"0.4.0","dependencies":{"component/emitter":"*","component/underscore":"*","noflo/fbp":"*"},"development":{},"license":"MIT","main":"src/lib/NoFlo.js","scripts":["src/lib/Graph.js","src/lib/InternalSocket.js","src/lib/Port.js","src/lib/ArrayPort.js","src/lib/Component.js","src/lib/AsyncComponent.js","src/lib/LoggingComponent.js","src/lib/ComponentLoader.js","src/lib/NoFlo.js","src/lib/Network.js","src/components/Graph.js"],"json":["component.json"],"noflo":{"components":{"Graph":"src/components/Graph.js"}}}');
});
require.register("noflo-noflo-core/index.js", function(exports, require, module){
/*
 * This file can be used for general library features of core.
 *
 * The library features can be made available as CommonJS modules that the
 * components in this project utilize.
 */

});
require.register("noflo-noflo-core/components/Callback.js", function(exports, require, module){
var Callback, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

_ = require('underscore')._;

Callback = (function(_super) {
  __extends(Callback, _super);

  Callback.prototype.description = 'This component calls a given callback function for each\
  IP it receives.  The Callback component is typically used to connect\
  NoFlo with external Node.js code.';

  function Callback() {
    var _this = this;
    this.callback = null;
    this.inPorts = {
      "in": new noflo.Port('all'),
      callback: new noflo.Port('function')
    };
    this.outPorts = {
      error: new noflo.Port('object')
    };
    this.inPorts.callback.on('data', function(data) {
      if (!_.isFunction(data)) {
        _this.error('The provided callback must be a function');
        return;
      }
      return _this.callback = data;
    });
    this.inPorts["in"].on('data', function(data) {
      if (!_this.callback) {
        _this.error('No callback provided');
        return;
      }
      return _this.callback(data);
    });
  }

  Callback.prototype.error = function(msg) {
    if (this.outPorts.error.isAttached()) {
      this.outPorts.error.send(new Error(msg));
      this.outPorts.error.disconnect();
      return;
    }
    throw new Error(msg);
  };

  return Callback;

})(noflo.Component);

exports.getComponent = function() {
  return new Callback;
};

});
require.register("noflo-noflo-core/components/Drop.js", function(exports, require, module){
var Drop, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Drop = (function(_super) {
  __extends(Drop, _super);

  Drop.prototype.description = 'This component drops every packet it receives with no\
  action';

  function Drop() {
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {};
  }

  return Drop;

})(noflo.Component);

exports.getComponent = function() {
  return new Drop;
};

});
require.register("noflo-noflo-core/components/Group.js", function(exports, require, module){
var Group, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Group = (function(_super) {
  __extends(Group, _super);

  function Group() {
    var _this = this;
    this.groups = [];
    this.newGroups = [];
    this.threshold = null;
    this.inPorts = {
      "in": new noflo.ArrayPort,
      group: new noflo.ArrayPort,
      threshold: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on('connect', function() {
      var group, _i, _len, _ref, _results;
      _ref = _this.newGroups;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        group = _ref[_i];
        _results.push(_this.outPorts.out.beginGroup(group));
      }
      return _results;
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on('endgroup', function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      var group, _i, _len, _ref;
      _ref = _this.newGroups;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        group = _ref[_i];
        _this.outPorts.out.endGroup();
      }
      _this.outPorts.out.disconnect();
      return _this.groups = [];
    });
    this.inPorts.group.on('data', function(data) {
      var diff;
      if (_this.threshold) {
        diff = _this.newGroups.length - _this.threshold + 1;
        if (diff > 0) {
          _this.newGroups = _this.newGroups.slice(diff);
        }
      }
      return _this.newGroups.push(data);
    });
    this.inPorts.threshold.on('data', function(threshold) {
      _this.threshold = threshold;
    });
  }

  return Group;

})(noflo.Component);

exports.getComponent = function() {
  return new Group;
};

});
require.register("noflo-noflo-core/components/Kick.js", function(exports, require, module){
var Kick, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Kick = (function(_super) {
  __extends(Kick, _super);

  Kick.prototype.description = 'This component generates a single packet and sends it to\
  the output port. Mostly usable for debugging, but can also be useful\
  for starting up networks.';

  function Kick() {
    var _this = this;
    this.data = {
      packet: null,
      group: []
    };
    this.groups = [];
    this.inPorts = {
      "in": new noflo.Port(),
      data: new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.ArrayPort()
    };
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.groups.push(group);
    });
    this.inPorts["in"].on('data', function() {
      return _this.data.group = _this.groups.slice(0);
    });
    this.inPorts["in"].on('endgroup', function(group) {
      return _this.groups.pop();
    });
    this.inPorts["in"].on('disconnect', function() {
      _this.sendKick(_this.data);
      return _this.groups = [];
    });
    this.inPorts.data.on('data', function(data) {
      return _this.data.packet = data;
    });
  }

  Kick.prototype.sendKick = function(kick) {
    var group, _i, _j, _len, _len1, _ref, _ref1;
    _ref = kick.group;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      group = _ref[_i];
      this.outPorts.out.beginGroup(group);
    }
    this.outPorts.out.send(kick.packet);
    _ref1 = kick.group;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      group = _ref1[_j];
      this.outPorts.out.endGroup();
    }
    return this.outPorts.out.disconnect();
  };

  return Kick;

})(noflo.Component);

exports.getComponent = function() {
  return new Kick;
};

});
require.register("noflo-noflo-core/components/Merge.js", function(exports, require, module){
var Merge, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Merge = (function(_super) {
  __extends(Merge, _super);

  Merge.prototype.description = 'This component receives data on multiple input ports and\
    sends the same data out to the connected output port';

  function Merge() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.ArrayPort()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts["in"].on('connect', function() {
      return _this.outPorts.out.connect();
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      var socket, _i, _len, _ref;
      _ref = _this.inPorts["in"].sockets;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        socket = _ref[_i];
        if (socket.connected) {
          return;
        }
      }
      return _this.outPorts.out.disconnect();
    });
  }

  return Merge;

})(noflo.Component);

exports.getComponent = function() {
  return new Merge;
};

});
require.register("noflo-noflo-core/components/Output.js", function(exports, require, module){
var Output, noflo, util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

if (!noflo.isBrowser()) {
  util = require('util');
} else {
  util = {
    inspect: function(data) {
      return data;
    }
  };
}

Output = (function(_super) {
  __extends(Output, _super);

  Output.prototype.description = 'This component receives input on a single inport, and\
    sends the data items directly to console.log';

  function Output() {
    var _this = this;
    this.options = {
      showHidden: false,
      depth: 2,
      colors: false
    };
    this.inPorts = {
      "in": new noflo.ArrayPort,
      options: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on('data', function(data) {
      _this.log(data);
      if (_this.outPorts.out.isAttached()) {
        return _this.outPorts.out.send(data);
      }
    });
    this.inPorts["in"].on('disconnect', function() {
      if (_this.outPorts.out.isAttached()) {
        return _this.outPorts.out.disconnect();
      }
    });
    this.inPorts.options.on('data', function(data) {
      return _this.setOptions(data);
    });
  }

  Output.prototype.setOptions = function(options) {
    var key, value, _results;
    if (typeof options !== 'object') {
      throw new Error('Options is not an object');
    }
    _results = [];
    for (key in options) {
      if (!__hasProp.call(options, key)) continue;
      value = options[key];
      _results.push(this.options[key] = value);
    }
    return _results;
  };

  Output.prototype.log = function(data) {
    return console.log(util.inspect(data, this.options.showHidden, this.options.depth, this.options.colors));
  };

  return Output;

})(noflo.Component);

exports.getComponent = function() {
  return new Output();
};

});
require.register("noflo-noflo-core/components/Repeat.js", function(exports, require, module){
var Repeat, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Repeat = (function(_super) {
  __extends(Repeat, _super);

  function Repeat() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts["in"].on('connect', function() {
      return _this.outPorts.out.connect();
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return Repeat;

})(noflo.Component);

exports.getComponent = function() {
  return new Repeat();
};

});
require.register("noflo-noflo-core/components/RepeatAsync.js", function(exports, require, module){
var RepeatAsync, noflo, util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

if (!noflo.isBrowser()) {
  util = require('util');
} else {
  util = {
    inspect: function(data) {
      return data;
    }
  };
}

RepeatAsync = (function(_super) {
  __extends(RepeatAsync, _super);

  RepeatAsync.prototype.description = "Like 'Repeat', except repeat on next tick";

  function RepeatAsync() {
    var _this = this;
    this.groups = [];
    this.inPorts = {
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.groups.push(group);
    });
    this.inPorts["in"].on('data', function(data) {
      var groups, later;
      groups = _this.groups;
      later = function() {
        var group, _i, _j, _len, _len1;
        for (_i = 0, _len = groups.length; _i < _len; _i++) {
          group = groups[_i];
          _this.outPorts.out.beginGroup(group);
        }
        _this.outPorts.out.send(data);
        for (_j = 0, _len1 = groups.length; _j < _len1; _j++) {
          group = groups[_j];
          _this.outPorts.out.endGroup();
        }
        return _this.outPorts.out.disconnect();
      };
      return setTimeout(later, 0);
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.groups = [];
    });
  }

  return RepeatAsync;

})(noflo.Component);

exports.getComponent = function() {
  return new RepeatAsync;
};

});
require.register("noflo-noflo-core/components/Split.js", function(exports, require, module){
var Split, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Split = (function(_super) {
  __extends(Split, _super);

  Split.prototype.description = 'This component receives data on a single input port and\
    sends the same data out to all connected output ports';

  function Split() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port('all')
    };
    this.outPorts = {
      out: new noflo.ArrayPort('all')
    };
    this.inPorts["in"].on('connect', function() {
      return _this.outPorts.out.connect();
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return Split;

})(noflo.Component);

exports.getComponent = function() {
  return new Split;
};

});
require.register("noflo-noflo-core/components/RunInterval.js", function(exports, require, module){
var RunInterval, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

RunInterval = (function(_super) {
  __extends(RunInterval, _super);

  RunInterval.prototype.description = 'Send a packet at the given interval';

  function RunInterval() {
    var _this = this;
    this.interval = null;
    this.inPorts = {
      interval: new noflo.Port('number'),
      stop: new noflo.Port('bang')
    };
    this.outPorts = {
      out: new noflo.Port('bang')
    };
    this.inPorts.interval.on('data', function(interval) {
      if (_this.interval) {
        clearInterval(_this.interval);
      }
      _this.outPorts.out.connect();
      return _this.interval = setInterval(function() {
        return _this.outPorts.out.send(true);
      }, interval);
    });
    this.inPorts.stop.on('data', function() {
      if (!_this.interval) {
        return;
      }
      clearInterval(_this.interval);
      return _this.outPorts.out.disconnect();
    });
  }

  return RunInterval;

})(noflo.Component);

exports.getComponent = function() {
  return new RunInterval;
};

});
require.register("noflo-noflo-core/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-core","description":"NoFlo Essentials","repo":"noflo/noflo-core","version":"0.1.0","author":{"name":"Henri Bergius","email":"henri.bergius@iki.fi"},"contributors":[{"name":"Kenneth Kan","email":"kenhkan@gmail.com"},{"name":"Ryan Shaw","email":"ryanshaw@unc.edu"}],"keywords":[],"dependencies":{"noflo/noflo":"*","component/underscore":"*"},"scripts":["components/Callback.js","components/Drop.js","components/Group.js","components/Kick.js","components/Merge.js","components/Output.js","components/Repeat.js","components/RepeatAsync.js","components/Split.js","components/RunInterval.js","index.js"],"json":["component.json"],"noflo":{"components":{"Callback":"components/Callback.js","Drop":"components/Drop.js","Group":"components/Group.js","Kick":"components/Kick.js","Merge":"components/Merge.js","Output":"components/Output.js","Repeat":"components/Repeat.js","RepeatAsync":"components/RepeatAsync.js","Split":"components/Split.js","RunInterval":"components/RunInterval.js"}}}');
});
require.register("noflo-noflo-flow/index.js", function(exports, require, module){
/*
 * This file can be used for general library features of flow.
 *
 * The library features can be made available as CommonJS modules that the
 * components in this project utilize.
 */

});
require.register("noflo-noflo-flow/components/Gate.js", function(exports, require, module){
var Gate, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Gate = (function(_super) {
  __extends(Gate, _super);

  Gate.prototype.description = 'This component forwards received packets when the gate is open';

  function Gate() {
    var _this = this;
    this.open = false;
    this.inPorts = {
      "in": new noflo.Port('all'),
      open: new noflo.Port('bang'),
      close: new noflo.Port('bang')
    };
    this.outPorts = {
      out: new noflo.Port('all')
    };
    this.inPorts["in"].on('connect', function() {
      if (!_this.open) {
        return;
      }
      return _this.outPorts.out.connect();
    });
    this.inPorts["in"].on('begingroup', function(group) {
      if (!_this.open) {
        return;
      }
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      if (!_this.open) {
        return;
      }
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      if (!_this.open) {
        return;
      }
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      if (!_this.open) {
        return;
      }
      return _this.outPorts.out.disconnect();
    });
    this.inPorts.open.on('data', function() {
      return _this.open = true;
    });
    this.inPorts.close.on('data', function() {
      return _this.open = false;
    });
  }

  return Gate;

})(noflo.Component);

exports.getComponent = function() {
  return new Gate;
};

});
require.register("noflo-noflo-flow/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-flow","description":"Flow Control for NoFlo","author":"Henri Bergius <henri.bergius@iki.fi>","repo":"noflo/noflo-dom","version":"0.2.0","keywords":[],"dependencies":{"noflo/noflo":"*"},"scripts":["components/Gate.js","index.js"],"json":["component.json"],"noflo":{"components":{"Gate":"components/Gate.js"}}}');
});
require.register("noflo-noflo-objects/index.js", function(exports, require, module){
/*
 * This file can be used for general library features of objects.
 *
 * The library features can be made available as CommonJS modules that the
 * components in this project utilize.
 */

});
require.register("noflo-noflo-objects/components/Extend.js", function(exports, require, module){
var Extend, cleanSymbols, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = require("underscore");

noflo = require("noflo");

Extend = (function(_super) {
  __extends(Extend, _super);

  Extend.prototype.description = "Extend an incoming object to some predefined  objects, optionally by a certain property";

  function Extend() {
    var _this = this;
    this.bases = [];
    this.key = null;
    this.inPorts = {
      "in": new noflo.Port,
      base: new noflo.Port,
      key: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.base.on("data", function(base) {
      if (base != null) {
        return _this.bases.push(base);
      } else {
        return _this.bases = [];
      }
    });
    this.inPorts.key.on("data", function(key) {
      _this.key = key;
    });
    this.inPorts["in"].on("connect", function() {
      return _this.objects = [];
    });
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(incoming) {
      var base, out, _i, _len, _ref;
      out = {};
      _ref = _this.bases;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        base = _ref[_i];
        if ((_this.key == null) || (incoming[_this.key] != null) && incoming[_this.key] === base[_this.key]) {
          _.extend(out, base);
        }
      }
      _.extend(out, incoming);
      return _this.outPorts.out.send(out);
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return Extend;

})(noflo.Component);

cleanSymbols = function(str) {
  return str.replace(/[^a-zA-Z0-9]/g, "");
};

exports.getComponent = function() {
  return new Extend;
};

});
require.register("noflo-noflo-objects/components/MergeObjects.js", function(exports, require, module){
var MergeObjects, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = require("underscore");

noflo = require("noflo");

MergeObjects = (function(_super) {
  __extends(MergeObjects, _super);

  MergeObjects.prototype.description = "merges all incoming objects into one";

  function MergeObjects() {
    var _this = this;
    this.merge = _.bind(this.merge, this);
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("connect", function() {
      _this.groups = [];
      return _this.objects = [];
    });
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.groups.push(group);
    });
    this.inPorts["in"].on("data", function(object) {
      return _this.objects.push(object);
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.groups.pop();
    });
    this.inPorts["in"].on("disconnect", function() {
      _this.outPorts.out.send(_.reduce(_this.objects, _this.merge, {}));
      return _this.outPorts.out.disconnect();
    });
  }

  MergeObjects.prototype.merge = function(origin, object) {
    var key, oValue, value;
    for (key in object) {
      value = object[key];
      oValue = origin[key];
      if (oValue != null) {
        switch (toString.call(oValue)) {
          case "[object Array]":
            origin[key].push.apply(origin[key], value);
            break;
          case "[object Object]":
            origin[key] = this.merge(oValue, value);
            break;
          default:
            origin[key] = value;
        }
      } else {
        origin[key] = value;
      }
    }
    return origin;
  };

  return MergeObjects;

})(noflo.Component);

exports.getComponent = function() {
  return new MergeObjects;
};

});
require.register("noflo-noflo-objects/components/SplitObject.js", function(exports, require, module){
var SplitObject, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

SplitObject = (function(_super) {
  __extends(SplitObject, _super);

  SplitObject.prototype.description = "splits a single object into multiple IPs,    wrapped with the key as the group";

  function SplitObject() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      var key, value, _results;
      _results = [];
      for (key in data) {
        value = data[key];
        _this.outPorts.out.beginGroup(key);
        _this.outPorts.out.send(value);
        _results.push(_this.outPorts.out.endGroup());
      }
      return _results;
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return SplitObject;

})(noflo.Component);

exports.getComponent = function() {
  return new SplitObject;
};

});
require.register("noflo-noflo-objects/components/ReplaceKey.js", function(exports, require, module){
var ReplaceKey, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

ReplaceKey = (function(_super) {
  __extends(ReplaceKey, _super);

  ReplaceKey.prototype.description = "given a regexp matching any key of an incoming  object as a data IP, replace the key with the provided string";

  function ReplaceKey() {
    var _this = this;
    this.patterns = {};
    this.inPorts = {
      "in": new noflo.Port,
      pattern: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.pattern.on("data", function(patterns) {
      _this.patterns = patterns;
    });
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      var key, newKey, pattern, replace, value, _ref;
      newKey = null;
      for (key in data) {
        value = data[key];
        _ref = _this.patterns;
        for (pattern in _ref) {
          replace = _ref[pattern];
          pattern = new RegExp(pattern);
          if (key.match(pattern) != null) {
            newKey = key.replace(pattern, replace);
            data[newKey] = value;
            delete data[key];
          }
        }
      }
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      _this.pattern = null;
      return _this.outPorts.out.disconnect();
    });
  }

  return ReplaceKey;

})(noflo.Component);

exports.getComponent = function() {
  return new ReplaceKey;
};

});
require.register("noflo-noflo-objects/components/Keys.js", function(exports, require, module){
var Keys, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

Keys = (function(_super) {
  __extends(Keys, _super);

  Keys.prototype.description = "gets only the keys of an object and forward them as an array";

  function Keys() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      var key, _i, _len, _ref, _results;
      _ref = _.keys(data);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        _results.push(_this.outPorts.out.send(key));
      }
      return _results;
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return Keys;

})(noflo.Component);

exports.getComponent = function() {
  return new Keys;
};

});
require.register("noflo-noflo-objects/components/Values.js", function(exports, require, module){
var Values, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

Values = (function(_super) {
  __extends(Values, _super);

  Values.prototype.description = "gets only the values of an object and forward them as an array";

  function Values() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      var value, _i, _len, _ref, _results;
      _ref = _.values(data);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        value = _ref[_i];
        _results.push(_this.outPorts.out.send(value));
      }
      return _results;
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return Values;

})(noflo.Component);

exports.getComponent = function() {
  return new Values;
};

});
require.register("noflo-noflo-objects/components/Join.js", function(exports, require, module){
var Join, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = require("underscore");

noflo = require("noflo");

Join = (function(_super) {
  __extends(Join, _super);

  Join.prototype.description = "Join all values of a passed packet together as a  string with a predefined delimiter";

  function Join() {
    var _this = this;
    this.delimiter = ",";
    this.inPorts = {
      "in": new noflo.Port,
      delimiter: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.delimiter.on("data", function(delimiter) {
      _this.delimiter = delimiter;
    });
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(object) {
      if (_.isObject(object)) {
        return _this.outPorts.out.send(_.values(object).join(_this.delimiter));
      }
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return Join;

})(noflo.Component);

exports.getComponent = function() {
  return new Join;
};

});
require.register("noflo-noflo-objects/components/ExtractProperty.js", function(exports, require, module){
var ExtractProperty, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

ExtractProperty = (function(_super) {
  __extends(ExtractProperty, _super);

  ExtractProperty.prototype.description = "Given a key, return only the value matching that key  in the incoming object";

  function ExtractProperty() {
    var _this = this;
    this.key = null;
    this.inPorts = {
      "in": new noflo.Port,
      key: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.key.on("data", function(key) {
      _this.key = key;
    });
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      if ((_this.key != null) && _.isObject(data)) {
        return _this.outPorts.out.send(data[_this.key]);
      }
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return ExtractProperty;

})(noflo.Component);

exports.getComponent = function() {
  return new ExtractProperty;
};

});
require.register("noflo-noflo-objects/components/InsertProperty.js", function(exports, require, module){
var InsertProperty, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

InsertProperty = (function(_super) {
  __extends(InsertProperty, _super);

  InsertProperty.prototype.description = "Insert a property into incoming objects.";

  function InsertProperty() {
    var _this = this;
    this.properties = {};
    this.inPorts = {
      "in": new noflo.Port,
      property: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.property.on("connect", function() {
      return _this.properties = {};
    });
    this.inPorts.property.on("begingroup", function(key) {
      _this.key = key;
    });
    this.inPorts.property.on("data", function(value) {
      if (_this.key != null) {
        return _this.properties[_this.key] = value;
      }
    });
    this.inPorts.property.on("endgroup", function() {
      return _this.key = null;
    });
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      var key, value, _ref;
      if (!_.isObject(data)) {
        data = {};
      }
      _ref = _this.properties;
      for (key in _ref) {
        value = _ref[key];
        data[key] = value;
      }
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return InsertProperty;

})(noflo.Component);

exports.getComponent = function() {
  return new InsertProperty;
};

});
require.register("noflo-noflo-objects/components/SliceArray.js", function(exports, require, module){
var SliceArray, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

SliceArray = (function(_super) {
  __extends(SliceArray, _super);

  function SliceArray() {
    var _this = this;
    this.begin = 0;
    this.end = null;
    this.inPorts = {
      "in": new noflo.Port(),
      begin: new noflo.Port(),
      end: new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port(),
      error: new noflo.Port()
    };
    this.inPorts.begin.on('data', function(data) {
      return _this.begin = data;
    });
    this.inPorts.end.on('data', function(data) {
      return _this.end = data;
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.sliceData(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  SliceArray.prototype.sliceData = function(data) {
    var sliced;
    if (!data.slice) {
      return this.outPorts.error.send("Data " + (typeof data) + " cannot be sliced");
    }
    if (this.end !== null) {
      sliced = data.slice(this.begin, this.end);
    }
    if (this.end === null) {
      sliced = data.slice(this.begin);
    }
    return this.outPorts.out.send(sliced);
  };

  return SliceArray;

})(noflo.Component);

exports.getComponent = function() {
  return new SliceArray;
};

});
require.register("noflo-noflo-objects/components/SplitArray.js", function(exports, require, module){
var SplitArray, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

SplitArray = (function(_super) {
  __extends(SplitArray, _super);

  function SplitArray() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.ArrayPort()
    };
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      var item, key, _i, _len, _results;
      if (toString.call(data) !== '[object Array]') {
        for (key in data) {
          item = data[key];
          _this.outPorts.out.beginGroup(key);
          _this.outPorts.out.send(item);
          _this.outPorts.out.endGroup();
        }
        return;
      }
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        item = data[_i];
        _results.push(_this.outPorts.out.send(item));
      }
      return _results;
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function(data) {
      return _this.outPorts.out.disconnect();
    });
  }

  return SplitArray;

})(noflo.Component);

exports.getComponent = function() {
  return new SplitArray;
};

});
require.register("noflo-noflo-objects/components/FilterPropertyValue.js", function(exports, require, module){
var FilterPropertyValue, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

FilterPropertyValue = (function(_super) {
  __extends(FilterPropertyValue, _super);

  function FilterPropertyValue() {
    var _this = this;
    this.accepts = {};
    this.regexps = {};
    this.inPorts = {
      accept: new noflo.ArrayPort(),
      regexp: new noflo.ArrayPort(),
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.accept.on('data', function(data) {
      return _this.prepareAccept(data);
    });
    this.inPorts.regexp.on('data', function(data) {
      return _this.prepareRegExp(data);
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      if (_this.filtering()) {
        return _this.filterData(data);
      }
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  FilterPropertyValue.prototype.filtering = function() {
    return (Object.keys(this.accepts)).length > 0 || (Object.keys(this.regexps)).length > 0;
  };

  FilterPropertyValue.prototype.prepareAccept = function(map) {
    var e, mapParts;
    if (typeof map === 'object') {
      this.accepts = map;
      return;
    }
    mapParts = map.split('=');
    try {
      return this.accepts[mapParts[0]] = eval(mapParts[1]);
    } catch (_error) {
      e = _error;
      if (e instanceof ReferenceError) {
        return this.accepts[mapParts[0]] = mapParts[1];
      } else {
        throw e;
      }
    }
  };

  FilterPropertyValue.prototype.prepareRegExp = function(map) {
    var mapParts;
    mapParts = map.split('=');
    return this.regexps[mapParts[0]] = mapParts[1];
  };

  FilterPropertyValue.prototype.filterData = function(object) {
    var match, newData, property, regexp, value;
    newData = {};
    match = false;
    for (property in object) {
      value = object[property];
      if (this.accepts[property]) {
        if (this.accepts[property] !== value) {
          continue;
        }
        match = true;
      }
      if (this.regexps[property]) {
        regexp = new RegExp(this.regexps[property]);
        if (!regexp.exec(value)) {
          continue;
        }
        match = true;
      }
      newData[property] = value;
      continue;
    }
    if (!match) {
      return;
    }
    return this.outPorts.out.send(newData);
  };

  return FilterPropertyValue;

})(noflo.Component);

exports.getComponent = function() {
  return new FilterPropertyValue;
};

});
require.register("noflo-noflo-objects/components/FlattenObject.js", function(exports, require, module){
var FlattenObject, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

FlattenObject = (function(_super) {
  __extends(FlattenObject, _super);

  function FlattenObject() {
    var _this = this;
    this.map = {};
    this.inPorts = {
      map: new noflo.ArrayPort(),
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.map.on('data', function(data) {
      return _this.prepareMap(data);
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      var object, _i, _len, _ref, _results;
      _ref = _this.flattenObject(data);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        object = _ref[_i];
        _results.push(_this.outPorts.out.send(_this.mapKeys(object)));
      }
      return _results;
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  FlattenObject.prototype.prepareMap = function(map) {
    var mapParts;
    if (typeof map === 'object') {
      this.map = map;
      return;
    }
    mapParts = map.split('=');
    return this.map[mapParts[0]] = mapParts[1];
  };

  FlattenObject.prototype.mapKeys = function(object) {
    var key, map, _ref;
    _ref = this.map;
    for (key in _ref) {
      map = _ref[key];
      object[map] = object.flattenedKeys[key];
    }
    delete object.flattenedKeys;
    return object;
  };

  FlattenObject.prototype.flattenObject = function(object) {
    var flattened, flattenedValue, key, val, value, _i, _len;
    flattened = [];
    for (key in object) {
      value = object[key];
      if (typeof value === 'object') {
        flattenedValue = this.flattenObject(value);
        for (_i = 0, _len = flattenedValue.length; _i < _len; _i++) {
          val = flattenedValue[_i];
          val.flattenedKeys.push(key);
          flattened.push(val);
        }
        continue;
      }
      flattened.push({
        flattenedKeys: [key],
        value: value
      });
    }
    return flattened;
  };

  return FlattenObject;

})(noflo.Component);

exports.getComponent = function() {
  return new FlattenObject;
};

});
require.register("noflo-noflo-objects/components/MapProperty.js", function(exports, require, module){
var MapProperty, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

MapProperty = (function(_super) {
  __extends(MapProperty, _super);

  function MapProperty() {
    var _this = this;
    this.map = {};
    this.regexps = {};
    this.inPorts = {
      map: new noflo.ArrayPort(),
      regexp: new noflo.ArrayPort(),
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.map.on('data', function(data) {
      return _this.prepareMap(data);
    });
    this.inPorts.regexp.on('data', function(data) {
      return _this.prepareRegExp(data);
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.mapData(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  MapProperty.prototype.prepareMap = function(map) {
    var mapParts;
    if (typeof map === 'object') {
      this.map = map;
      return;
    }
    mapParts = map.split('=');
    return this.map[mapParts[0]] = mapParts[1];
  };

  MapProperty.prototype.prepareRegExp = function(map) {
    var mapParts;
    mapParts = map.split('=');
    return this.regexps[mapParts[0]] = mapParts[1];
  };

  MapProperty.prototype.mapData = function(data) {
    var expression, matched, newData, property, regexp, replacement, value, _ref;
    newData = {};
    for (property in data) {
      value = data[property];
      if (property in this.map) {
        property = this.map[property];
      }
      _ref = this.regexps;
      for (expression in _ref) {
        replacement = _ref[expression];
        regexp = new RegExp(expression);
        matched = regexp.exec(property);
        if (!matched) {
          continue;
        }
        property = property.replace(regexp, replacement);
      }
      if (property in newData) {
        if (Array.isArray(newData[property])) {
          newData[property].push(value);
        } else {
          newData[property] = [newData[property], value];
        }
      } else {
        newData[property] = value;
      }
    }
    return this.outPorts.out.send(newData);
  };

  return MapProperty;

})(noflo.Component);

exports.getComponent = function() {
  return new MapProperty;
};

});
require.register("noflo-noflo-objects/components/RemoveProperty.js", function(exports, require, module){
var RemoveProperty, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

_ = require('underscore');

RemoveProperty = (function(_super) {
  __extends(RemoveProperty, _super);

  function RemoveProperty() {
    var _this = this;
    this.properties = [];
    this.inPorts = {
      "in": new noflo.Port(),
      property: new noflo.ArrayPort()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.property.on('data', function(data) {
      return _this.properties.push(data);
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.outPorts.out.send(_this.removeProperties(data));
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  RemoveProperty.prototype.removeProperties = function(object) {
    var property, _i, _len, _ref;
    object = _.clone(object);
    _ref = this.properties;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      property = _ref[_i];
      delete object[property];
    }
    return object;
  };

  return RemoveProperty;

})(noflo.Component);

exports.getComponent = function() {
  return new RemoveProperty;
};

});
require.register("noflo-noflo-objects/components/MapPropertyValue.js", function(exports, require, module){
var MapPropertyValue, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

MapPropertyValue = (function(_super) {
  __extends(MapPropertyValue, _super);

  function MapPropertyValue() {
    var _this = this;
    this.mapAny = {};
    this.map = {};
    this.regexpAny = {};
    this.regexp = {};
    this.inPorts = {
      map: new noflo.ArrayPort(),
      regexp: new noflo.ArrayPort(),
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.map.on('data', function(data) {
      return _this.prepareMap(data);
    });
    this.inPorts.regexp.on('data', function(data) {
      return _this.prepareRegExp(data);
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.mapData(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  MapPropertyValue.prototype.prepareMap = function(map) {
    var mapParts;
    if (typeof map === 'object') {
      this.mapAny = map;
      return;
    }
    mapParts = map.split('=');
    if (mapParts.length === 3) {
      this.map[mapParts[0]] = {
        from: mapParts[1],
        to: mapParts[2]
      };
      return;
    }
    return this.mapAny[mapParts[0]] = mapParts[1];
  };

  MapPropertyValue.prototype.prepareRegExp = function(map) {
    var mapParts;
    mapParts = map.split('=');
    if (mapParts.length === 3) {
      this.regexp[mapParts[0]] = {
        from: mapParts[1],
        to: mapParts[2]
      };
      return;
    }
    return this.regexpAny[mapParts[0]] = mapParts[1];
  };

  MapPropertyValue.prototype.mapData = function(data) {
    var expression, matched, property, regexp, replacement, value, _ref;
    for (property in data) {
      value = data[property];
      if (this.map[property] && this.map[property].from === value) {
        data[property] = this.map[property].to;
      }
      if (this.mapAny[value]) {
        data[property] = this.mapAny[value];
      }
      if (this.regexp[property]) {
        regexp = new RegExp(this.regexp[property].from);
        matched = regexp.exec(value);
        if (matched) {
          data[property] = value.replace(regexp, this.regexp[property].to);
        }
      }
      _ref = this.regexpAny;
      for (expression in _ref) {
        replacement = _ref[expression];
        regexp = new RegExp(expression);
        matched = regexp.exec(value);
        if (!matched) {
          continue;
        }
        data[property] = value.replace(regexp, replacement);
      }
    }
    return this.outPorts.out.send(data);
  };

  return MapPropertyValue;

})(noflo.Component);

exports.getComponent = function() {
  return new MapPropertyValue;
};

});
require.register("noflo-noflo-objects/components/GetObjectKey.js", function(exports, require, module){
var GetObjectKey, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

GetObjectKey = (function(_super) {
  __extends(GetObjectKey, _super);

  function GetObjectKey() {
    var _this = this;
    this.sendGroup = true;
    this.data = [];
    this.key = [];
    this.inPorts = {
      "in": new noflo.Port(),
      key: new noflo.ArrayPort(),
      sendgroup: new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port(),
      object: new noflo.Port(),
      missed: new noflo.Port()
    };
    this.inPorts["in"].on('connect', function() {
      return _this.data = [];
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      if (_this.key.length) {
        return _this.getKey(data);
      }
      return _this.data.push(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      var data, _i, _len, _ref;
      if (!_this.data.length) {
        _this.outPorts.out.disconnect();
        return;
      }
      if (!_this.key.length) {
        return;
      }
      _ref = _this.data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        data = _ref[_i];
        _this.getKey(data);
      }
      _this.outPorts.out.disconnect();
      if (_this.outPorts.object.isAttached()) {
        return _this.outPorts.object.disconnect();
      }
    });
    this.inPorts.key.on('data', function(data) {
      return _this.key.push(data);
    });
    this.inPorts.key.on('disconnect', function() {
      var data, _i, _len, _ref;
      if (!_this.data.length) {
        return;
      }
      _ref = _this.data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        data = _ref[_i];
        _this.getKey(data);
      }
      _this.data = [];
      return _this.outPorts.out.disconnect();
    });
    this.inPorts.sendgroup.on('data', function(data) {
      if (typeof data === 'string') {
        if (data.toLowerCase() === 'false') {
          _this.sendGroup = false;
          return;
        }
        _this.sendGroup = true;
        return;
      }
      return _this.sendGroup = data;
    });
  }

  GetObjectKey.prototype.error = function(data, error) {
    if (this.outPorts.missed.isAttached()) {
      this.outPorts.missed.send(data);
      this.outPorts.missed.disconnect();
      return;
    }
    throw error;
  };

  GetObjectKey.prototype.getKey = function(data) {
    var key, _i, _len, _ref;
    if (!this.key.length) {
      this.error(data, new Error('Key not defined'));
      return;
    }
    if (typeof data !== 'object') {
      this.error(data, new Error('Data is not an object'));
      return;
    }
    if (data === null) {
      this.error(data, new Error('Data is NULL'));
      return;
    }
    _ref = this.key;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      if (data[key] === void 0) {
        this.error(data, new Error("Object has no key " + key));
        continue;
      }
      if (this.sendGroup) {
        this.outPorts.out.beginGroup(key);
      }
      this.outPorts.out.send(data[key]);
      if (this.sendGroup) {
        this.outPorts.out.endGroup();
      }
    }
    if (!this.outPorts.object.isAttached()) {
      return;
    }
    return this.outPorts.object.send(data);
  };

  return GetObjectKey;

})(noflo.Component);

exports.getComponent = function() {
  return new GetObjectKey;
};

});
require.register("noflo-noflo-objects/components/UniqueArray.js", function(exports, require, module){
var UniqueArray, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

UniqueArray = (function(_super) {
  __extends(UniqueArray, _super);

  function UniqueArray() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts["in"].on('data', function(data) {
      return _this.outPorts.out.send(_this.unique(data));
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  UniqueArray.prototype.unique = function(array) {
    var member, newArray, seen, _i, _len;
    seen = {};
    newArray = [];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      member = array[_i];
      seen[member] = member;
    }
    for (member in seen) {
      newArray.push(member);
    }
    return newArray;
  };

  return UniqueArray;

})(noflo.Component);

exports.getComponent = function() {
  return new UniqueArray;
};

});
require.register("noflo-noflo-objects/components/SetProperty.js", function(exports, require, module){
var SetProperty, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

SetProperty = (function(_super) {
  __extends(SetProperty, _super);

  function SetProperty() {
    var _this = this;
    this.properties = {};
    this.inPorts = {
      property: new noflo.ArrayPort(),
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.property.on('data', function(data) {
      return _this.setProperty(data);
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.addProperties(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  SetProperty.prototype.setProperty = function(prop) {
    var propParts;
    if (typeof prop === 'object') {
      this.prop = prop;
      return;
    }
    propParts = prop.split('=');
    return this.properties[propParts[0]] = propParts[1];
  };

  SetProperty.prototype.addProperties = function(object) {
    var property, value, _ref;
    _ref = this.properties;
    for (property in _ref) {
      value = _ref[property];
      object[property] = value;
    }
    return this.outPorts.out.send(object);
  };

  return SetProperty;

})(noflo.Component);

exports.getComponent = function() {
  return new SetProperty;
};

});
require.register("noflo-noflo-objects/components/SimplifyObject.js", function(exports, require, module){
var SimplifyObject, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

_ = require('underscore')._;

SimplifyObject = (function(_super) {
  __extends(SimplifyObject, _super);

  function SimplifyObject() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on('beginGroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.outPorts.out.send(_this.simplify(data));
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  SimplifyObject.prototype.simplify = function(data) {
    if (_.isArray(data)) {
      if (data.length === 1) {
        return data[0];
      }
      return data;
    }
    if (!_.isObject(data)) {
      return data;
    }
    return this.simplifyObject(data);
  };

  SimplifyObject.prototype.simplifyObject = function(data) {
    var keys, simplified,
      _this = this;
    keys = _.keys(data);
    if (keys.length === 1 && keys[0] === '$data') {
      return this.simplify(data['$data']);
    }
    simplified = {};
    _.each(data, function(value, key) {
      return simplified[key] = _this.simplify(value);
    });
    return simplified;
  };

  return SimplifyObject;

})(noflo.Component);

exports.getComponent = function() {
  return new SimplifyObject;
};

});
require.register("noflo-noflo-objects/components/DuplicateProperty.js", function(exports, require, module){
var DuplicateProperty, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

DuplicateProperty = (function(_super) {
  __extends(DuplicateProperty, _super);

  function DuplicateProperty() {
    var _this = this;
    this.properties = {};
    this.separator = '/';
    this.inPorts = {
      property: new noflo.ArrayPort(),
      separator: new noflo.Port(),
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.property.on('data', function(data) {
      return _this.setProperty(data);
    });
    this.inPorts.separator.on('data', function(data) {
      return _this.separator = data;
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.addProperties(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  DuplicateProperty.prototype.setProperty = function(prop) {
    var propParts;
    if (typeof prop === 'object') {
      this.prop = prop;
      return;
    }
    propParts = prop.split('=');
    if (propParts.length > 2) {
      this.properties[propParts.pop()] = propParts;
      return;
    }
    return this.properties[propParts[1]] = propParts[0];
  };

  DuplicateProperty.prototype.addProperties = function(object) {
    var newValues, newprop, original, originalProp, _i, _len, _ref;
    _ref = this.properties;
    for (newprop in _ref) {
      original = _ref[newprop];
      if (typeof original === 'string') {
        object[newprop] = object[original];
        continue;
      }
      newValues = [];
      for (_i = 0, _len = original.length; _i < _len; _i++) {
        originalProp = original[_i];
        newValues.push(object[originalProp]);
      }
      object[newprop] = newValues.join(this.separator);
    }
    return this.outPorts.out.send(object);
  };

  return DuplicateProperty;

})(noflo.Component);

exports.getComponent = function() {
  return new DuplicateProperty;
};

});
require.register("noflo-noflo-objects/components/CreateObject.js", function(exports, require, module){
var CreateObject, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

CreateObject = (function(_super) {
  __extends(CreateObject, _super);

  function CreateObject() {
    var _this = this;
    this.inPorts = {
      start: new noflo.Port('bang')
    };
    this.outPorts = {
      out: new noflo.Port('object')
    };
    this.inPorts.start.on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts.start.on("data", function() {
      _this.outPorts.out.send({});
      return _this.outPorts.out.disconnect();
    });
    this.inPorts.start.on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
  }

  return CreateObject;

})(noflo.Component);

exports.getComponent = function() {
  return new CreateObject;
};

});
require.register("noflo-noflo-objects/components/CreateDate.js", function(exports, require, module){
var CreateDate, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

CreateDate = (function(_super) {
  __extends(CreateDate, _super);

  function CreateDate() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port('string')
    };
    this.outPorts = {
      out: new noflo.Port('object')
    };
    this.inPorts["in"].on("data", function(data) {
      var date;
      if (data === "now" || data === null || data === true) {
        date = new Date;
      } else {
        date = new Date(data);
      }
      _this.outPorts.out.send(date);
      return _this.outPorts.out.disconnect();
    });
  }

  return CreateDate;

})(noflo.Component);

exports.getComponent = function() {
  return new CreateDate;
};

});
require.register("noflo-noflo-objects/components/SetPropertyValue.js", function(exports, require, module){
var SetPropertyValue, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

SetPropertyValue = (function(_super) {
  __extends(SetPropertyValue, _super);

  function SetPropertyValue() {
    var _this = this;
    this.property = null;
    this.value = null;
    this.data = [];
    this.groups = [];
    this.inPorts = {
      property: new noflo.Port(),
      value: new noflo.Port(),
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.property.on('data', function(data) {
      _this.property = data;
      if (_this.value && _this.data.length) {
        return _this.addProperties();
      }
    });
    this.inPorts.value.on('data', function(data) {
      _this.value = data;
      if (_this.property && _this.data.length) {
        return _this.addProperties();
      }
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.groups.push(group);
    });
    this.inPorts["in"].on('data', function(data) {
      if (_this.property && _this.value) {
        _this.addProperty({
          data: data,
          group: _this.groups.slice(0)
        });
        return;
      }
      return _this.data.push({
        data: data,
        group: _this.groups.slice(0)
      });
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.groups.pop();
    });
    this.inPorts["in"].on('disconnect', function() {
      if (_this.property && _this.value) {
        _this.outPorts.out.disconnect();
      }
      return _this.value = null;
    });
  }

  SetPropertyValue.prototype.addProperty = function(object) {
    var group, _i, _j, _len, _len1, _ref, _ref1, _results;
    object.data[this.property] = this.value;
    _ref = object.group;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      group = _ref[_i];
      this.outPorts.out.beginGroup(group);
    }
    this.outPorts.out.send(object.data);
    _ref1 = object.group;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      group = _ref1[_j];
      _results.push(this.outPorts.out.endGroup());
    }
    return _results;
  };

  SetPropertyValue.prototype.addProperties = function() {
    var object, _i, _len, _ref;
    _ref = this.data;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      object = _ref[_i];
      this.addProperty(object);
    }
    this.data = [];
    return this.outPorts.out.disconnect();
  };

  return SetPropertyValue;

})(noflo.Component);

exports.getComponent = function() {
  return new SetPropertyValue;
};

});
require.register("noflo-noflo-objects/components/CallMethod.js", function(exports, require, module){
var CallMethod, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

CallMethod = (function(_super) {
  __extends(CallMethod, _super);

  CallMethod.prototype.description = "call a method on an object";

  function CallMethod() {
    var _this = this;
    this.method = null;
    this.inPorts = {
      "in": new noflo.Port('object'),
      method: new noflo.Port('string')
    };
    this.outPorts = {
      out: new noflo.Port('all'),
      error: new noflo.Port('string')
    };
    this.inPorts["in"].on("data", function(data) {
      var msg;
      if (!_this.method) {
        return;
      }
      if (!data[_this.method]) {
        msg = "Method '" + _this.method + "' not available";
        if (_this.outPorts.error.isAttached()) {
          _this.outPorts.error.send(msg);
          _this.outPorts.error.disconnect();
          return;
        }
        throw new Error(msg);
      }
      return _this.outPorts.out.send(data[_this.method].call(data));
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
    this.inPorts.method.on("data", function(data) {
      return _this.method = data;
    });
  }

  return CallMethod;

})(noflo.Component);

exports.getComponent = function() {
  return new CallMethod;
};

});
require.register("noflo-noflo-objects/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-objects","description":"Object Utilities for NoFlo","version":"0.1.0","keywords":["noflo","objects","utilities"],"author":"Kenneth Kan <kenhkan@gmail.com>","repo":"noflo/objects","dependencies":{"noflo/noflo":"*","component/underscore":"*"},"scripts":["components/Extend.js","components/MergeObjects.js","components/SplitObject.js","components/ReplaceKey.js","components/Keys.js","components/Values.js","components/Join.js","components/ExtractProperty.js","components/InsertProperty.js","components/SliceArray.js","components/SplitArray.js","components/FilterPropertyValue.js","components/FlattenObject.js","components/MapProperty.js","components/RemoveProperty.js","components/MapPropertyValue.js","components/GetObjectKey.js","components/UniqueArray.js","components/SetProperty.js","components/SimplifyObject.js","components/DuplicateProperty.js","components/CreateObject.js","components/CreateDate.js","components/SetPropertyValue.js","components/CallMethod.js","index.js"],"json":["component.json"],"noflo":{"components":{"Extend":"components/Extend.js","MergeObjects":"components/MergeObjects.js","SplitObject":"components/SplitObject.js","ReplaceKey":"components/ReplaceKey.js","Keys":"components/Keys.js","Values":"components/Values.js","Join":"components/Join.js","ExtractProperty":"components/ExtractProperty.js","InsertProperty":"components/InsertProperty.js","SliceArray":"components/SliceArray.js","SplitArray":"components/SplitArray.js","FilterPropertyValue":"components/FilterPropertyValue.js","FlattenObject":"components/FlattenObject.js","MapProperty":"components/MapProperty.js","RemoveProperty":"components/RemoveProperty.js","MapPropertyValue":"components/MapPropertyValue.js","GetObjectKey":"components/GetObjectKey.js","UniqueArray":"components/UniqueArray.js","SetProperty":"components/SetProperty.js","SimplifyObject":"components/SimplifyObject.js","DuplicateProperty":"components/DuplicateProperty.js","CreateObject":"components/CreateObject.js","CreateDate":"components/CreateDate.js","SetPropertyValue":"components/SetPropertyValue.js","CallMethod":"components/CallMethod.js"}}}');
});
require.register("noflo-noflo-strings/index.js", function(exports, require, module){
/*
 * This file can be used for general library features that are exposed as CommonJS modules
 * that the components then utilize
 */

});
require.register("noflo-noflo-strings/components/Filter.js", function(exports, require, module){
var Filter, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

Filter = (function(_super) {
  __extends(Filter, _super);

  Filter.prototype.description = "filters an IP which is a string using a regex";

  function Filter() {
    var _this = this;
    this.regex = null;
    this.inPorts = {
      "in": new noflo.Port('string'),
      pattern: new noflo.Port('string')
    };
    this.outPorts = {
      out: new noflo.Port('string'),
      missed: new noflo.Port('string')
    };
    this.inPorts.pattern.on("data", function(data) {
      return _this.regex = new RegExp(data);
    });
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      if (typeof data !== 'string') {
        data = data.toString();
      }
      if ((_this.regex != null) && ((data != null ? typeof data.match === "function" ? data.match(_this.regex) : void 0 : void 0) != null)) {
        _this.outPorts.out.send(data);
        return;
      }
      if (_this.outPorts.missed.isAttached()) {
        return _this.outPorts.missed.send(data);
      }
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      _this.outPorts.out.disconnect();
      if (_this.outPorts.missed.isAttached()) {
        return _this.outPorts.missed.disconnect();
      }
    });
  }

  return Filter;

})(noflo.Component);

exports.getComponent = function() {
  return new Filter;
};

});
require.register("noflo-noflo-strings/components/SendString.js", function(exports, require, module){
var SendString, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

SendString = (function(_super) {
  __extends(SendString, _super);

  function SendString() {
    var _this = this;
    this.string = '';
    this.inPorts = {
      string: new noflo.Port('string'),
      "in": new noflo.Port('bang')
    };
    this.outPorts = {
      out: new noflo.Port('string')
    };
    this.inPorts.string.on('data', function(data) {
      return _this.string = data;
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.outPorts.out.send(_this.string);
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return SendString;

})(noflo.Component);

exports.getComponent = function() {
  return new SendString;
};

});
require.register("noflo-noflo-strings/components/StringTemplate.js", function(exports, require, module){
var StringTemplate, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

_ = require('underscore');

StringTemplate = (function(_super) {
  __extends(StringTemplate, _super);

  function StringTemplate() {
    var _this = this;
    this.template = null;
    this.inPorts = {
      template: new noflo.Port('string'),
      "in": new noflo.Port('object')
    };
    this.outPorts = {
      out: new noflo.Port('string')
    };
    this.inPorts.template.on('data', function(data) {
      return _this.template = _.template(data);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.outPorts.out.send(_this.template(data));
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return StringTemplate;

})(noflo.Component);

exports.getComponent = function() {
  return new StringTemplate;
};

});
require.register("noflo-noflo-strings/components/Replace.js", function(exports, require, module){
var Replace, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Replace = (function(_super) {
  __extends(Replace, _super);

  Replace.prototype.description = 'Given a fixed pattern and its replacement, replace all\
  occurrences in the incoming template.';

  function Replace() {
    var _this = this;
    this.pattern = null;
    this.replacement = '';
    this.inPorts = {
      "in": new noflo.Port('string'),
      pattern: new noflo.Port('string'),
      replacement: new noflo.Port('string')
    };
    this.outPorts = {
      out: new noflo.Port('string')
    };
    this.inPorts.pattern.on('data', function(data) {
      return _this.pattern = new RegExp(data, 'g');
    });
    this.inPorts.replacement.on('data', function(data) {
      return _this.replacement = data.replace('\\\\n', "\n");
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      var string;
      string = data;
      if (_this.pattern != null) {
        string = ("" + data).replace(_this.pattern, _this.replacement);
      }
      return _this.outPorts.out.send(string);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return Replace;

})(noflo.Component);

exports.getComponent = function() {
  return new Replace;
};

});
require.register("noflo-noflo-strings/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-strings","description":"String Utilities for NoFlo","author":"Henri Bergius <henri.bergius@iki.fi>","repo":"noflo/noflo-strings","version":"0.0.1","keywords":[],"dependencies":{"noflo/noflo":"*","component/underscore":"*"},"scripts":["components/Filter.js","components/SendString.js","components/StringTemplate.js","components/Replace.js","index.js"],"json":["component.json"],"noflo":{"components":{"Filter":"components/Filter.js","SendString":"components/SendString.js","StringTemplate":"components/StringTemplate.js","Replace":"components/Replace.js"}}}');
});
require.register("noflo-noflo-dom/index.js", function(exports, require, module){
/*
 * This file can be used for general library features that are exposed as CommonJS modules
 * that the components then utilize
 */

});
require.register("noflo-noflo-dom/components/AddClass.js", function(exports, require, module){
var AddClass, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

AddClass = (function(_super) {
  __extends(AddClass, _super);

  AddClass.prototype.description = 'Add a class to an element';

  function AddClass() {
    var _this = this;
    this.element = null;
    this["class"] = null;
    this.inPorts = {
      element: new noflo.Port('object'),
      "class": new noflo.Port('string')
    };
    this.outPorts = {};
    this.inPorts.element.on('data', function(data) {
      _this.element = data;
      if (_this["class"]) {
        return _this.addClass();
      }
    });
    this.inPorts["class"].on('data', function(data) {
      _this["class"] = data;
      if (_this.element) {
        return _this.addClass();
      }
    });
  }

  AddClass.prototype.addClass = function() {
    return this.element.classList.add(this["class"]);
  };

  return AddClass;

})(noflo.Component);

exports.getComponent = function() {
  return new AddClass;
};

});
require.register("noflo-noflo-dom/components/AppendChild.js", function(exports, require, module){
var AppendChild, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

AppendChild = (function(_super) {
  __extends(AppendChild, _super);

  AppendChild.prototype.description = 'Append elements as children of a parent element';

  function AppendChild() {
    var _this = this;
    this.parent = null;
    this.children = [];
    this.inPorts = {
      parent: new noflo.Port('object'),
      child: new noflo.Port('object')
    };
    this.outPorts = {};
    this.inPorts.parent.on('data', function(data) {
      _this.parent = data;
      if (_this.children.length) {
        return _this.append();
      }
    });
    this.inPorts.child.on('data', function(data) {
      if (!_this.parent) {
        _this.children.push(data);
        return;
      }
      return _this.parent.appendChild(data);
    });
  }

  AppendChild.prototype.append = function() {
    var child, _i, _len, _ref;
    _ref = this.children;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      this.parent.appendChild(child);
    }
    return this.children = [];
  };

  return AppendChild;

})(noflo.Component);

exports.getComponent = function() {
  return new AppendChild;
};

});
require.register("noflo-noflo-dom/components/CreateElement.js", function(exports, require, module){
var CreateElement, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

CreateElement = (function(_super) {
  __extends(CreateElement, _super);

  CreateElement.prototype.description = 'Create a new DOM Element';

  function CreateElement() {
    var _this = this;
    this.inPorts = {
      tagname: new noflo.Port('string')
    };
    this.outPorts = {
      element: new noflo.Port('object')
    };
    this.inPorts.tagname.on('data', function(data) {
      return _this.outPorts.element.send(document.createElement(data));
    });
    this.inPorts.tagname.on('disconnect', function() {
      return _this.outPorts.element.disconnect();
    });
  }

  return CreateElement;

})(noflo.Component);

exports.getComponent = function() {
  return new CreateElement;
};

});
require.register("noflo-noflo-dom/components/CreateFragment.js", function(exports, require, module){
var CreateFragment, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

CreateFragment = (function(_super) {
  __extends(CreateFragment, _super);

  CreateFragment.prototype.description = 'Create a new DOM DocumentFragment';

  function CreateFragment() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port('bang')
    };
    this.outPorts = {
      fragment: new noflo.Port('object')
    };
    this.inPorts["in"].on('data', function() {
      return _this.outPorts.fragment.send(document.createDocumentFragment());
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.fragment.disconnect();
    });
  }

  return CreateFragment;

})(noflo.Component);

exports.getComponent = function() {
  return new CreateFragment;
};

});
require.register("noflo-noflo-dom/components/GetAttribute.js", function(exports, require, module){
var GetAttribute, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

GetAttribute = (function(_super) {
  __extends(GetAttribute, _super);

  function GetAttribute() {
    var _this = this;
    this.attribute = null;
    this.element = null;
    this.inPorts = {
      element: new noflo.Port('object'),
      attribute: new noflo.Port('string')
    };
    this.outPorts = {
      out: new noflo.Port('string')
    };
    this.inPorts.element.on('data', function(data) {
      _this.element = data;
      if (_this.attribute) {
        return _this.getAttribute();
      }
    });
    this.inPorts.attribute.on('data', function(data) {
      _this.attribute = data;
      if (_this.element) {
        return _this.getAttribute();
      }
    });
  }

  GetAttribute.prototype.getAttribute = function() {
    var value;
    value = this.element.getAttribute(this.attribute);
    this.outPorts.out.beginGroup(this.attribute);
    this.outPorts.out.send(value);
    this.outPorts.out.endGroup();
    return this.outPorts.out.disconnect();
  };

  return GetAttribute;

})(noflo.Component);

exports.getComponent = function() {
  return new GetAttribute;
};

});
require.register("noflo-noflo-dom/components/GetElement.js", function(exports, require, module){
var GetElement, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

GetElement = (function(_super) {
  __extends(GetElement, _super);

  GetElement.prototype.description = 'Get a DOM element matching a query';

  function GetElement() {
    var _this = this;
    this.container = null;
    this.inPorts = {
      "in": new noflo.Port('object'),
      selector: new noflo.Port('string')
    };
    this.outPorts = {
      element: new noflo.Port('object'),
      error: new noflo.Port('object')
    };
    this.inPorts["in"].on('data', function(data) {
      if (typeof data.querySelector !== 'function') {
        _this.error('Given container doesn\'t support querySelectors');
        return;
      }
      return _this.container = data;
    });
    this.inPorts.selector.on('data', function(data) {
      return _this.select(data);
    });
  }

  GetElement.prototype.select = function(selector) {
    var el, element, _i, _len;
    if (this.container) {
      el = this.container.querySelectorAll(selector);
    } else {
      el = document.querySelectorAll(selector);
    }
    if (!el.length) {
      this.error("No element matching '" + selector + "' found");
      return;
    }
    for (_i = 0, _len = el.length; _i < _len; _i++) {
      element = el[_i];
      this.outPorts.element.send(element);
    }
    return this.outPorts.element.disconnect();
  };

  GetElement.prototype.error = function(msg) {
    if (this.outPorts.error.isAttached()) {
      this.outPorts.error.send(new Error(msg));
      this.outPorts.error.disconnect();
      return;
    }
    throw new Error(msg);
  };

  return GetElement;

})(noflo.Component);

exports.getComponent = function() {
  return new GetElement;
};

});
require.register("noflo-noflo-dom/components/ReadHtml.js", function(exports, require, module){
var ReadHtml, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

ReadHtml = (function(_super) {
  __extends(ReadHtml, _super);

  ReadHtml.prototype.description = 'Read HTML from an existing element';

  function ReadHtml() {
    var _this = this;
    this.inPorts = {
      container: new noflo.Port('object')
    };
    this.outPorts = {
      html: new noflo.Port('string')
    };
    this.inPorts.container.on('data', function(data) {
      _this.outPorts.html.send(data.innerHTML);
      return _this.outPorts.html.disconnect();
    });
  }

  return ReadHtml;

})(noflo.Component);

exports.getComponent = function() {
  return new ReadHtml;
};

});
require.register("noflo-noflo-dom/components/WriteHtml.js", function(exports, require, module){
var WriteHtml, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

WriteHtml = (function(_super) {
  __extends(WriteHtml, _super);

  WriteHtml.prototype.description = 'Write HTML inside an existing element';

  function WriteHtml() {
    var _this = this;
    this.container = null;
    this.html = null;
    this.inPorts = {
      html: new noflo.Port('string'),
      container: new noflo.Port('object')
    };
    this.outPorts = {};
    this.inPorts.html.on('data', function(data) {
      _this.html = data;
      if (_this.container) {
        return _this.writeHtml();
      }
    });
    this.inPorts.container.on('data', function(data) {
      _this.container = data;
      if (_this.html) {
        return _this.writeHtml();
      }
    });
  }

  WriteHtml.prototype.writeHtml = function() {
    this.container.innerHTML = this.html;
    return this.html = null;
  };

  return WriteHtml;

})(noflo.Component);

exports.getComponent = function() {
  return new WriteHtml;
};

});
require.register("noflo-noflo-dom/components/RemoveClass.js", function(exports, require, module){
var RemoveClass, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

RemoveClass = (function(_super) {
  __extends(RemoveClass, _super);

  RemoveClass.prototype.description = 'Remove a class from an element';

  function RemoveClass() {
    var _this = this;
    this.element = null;
    this["class"] = null;
    this.inPorts = {
      element: new noflo.Port('object'),
      "class": new noflo.Port('string')
    };
    this.outPorts = {};
    this.inPorts.element.on('data', function(data) {
      _this.element = data;
      if (_this["class"]) {
        return _this.removeClass();
      }
    });
    this.inPorts["class"].on('data', function(data) {
      _this["class"] = data;
      if (_this.element) {
        return _this.removeClass();
      }
    });
  }

  RemoveClass.prototype.removeClass = function() {
    return this.element.classList.remove(this["class"]);
  };

  return RemoveClass;

})(noflo.Component);

exports.getComponent = function() {
  return new RemoveClass;
};

});
require.register("noflo-noflo-dom/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-dom","description":"Document Object Model components for NoFlo","author":"Henri Bergius <henri.bergius@iki.fi>","repo":"noflo/noflo-dom","version":"0.0.1","keywords":[],"dependencies":{"noflo/noflo":"*"},"scripts":["components/AddClass.js","components/AppendChild.js","components/CreateElement.js","components/CreateFragment.js","components/GetAttribute.js","components/GetElement.js","components/ReadHtml.js","components/WriteHtml.js","components/RemoveClass.js","index.js"],"json":["component.json"],"noflo":{"components":{"AddClass":"components/AddClass.js","AppendChild":"components/AppendChild.js","CreateElement":"components/CreateElement.js","CreateFragment":"components/CreateFragment.js","GetAttribute":"components/GetAttribute.js","GetElement":"components/GetElement.js","WriteHtml":"components/WriteHtml.js","ReadHtml":"components/ReadHtml.js","RemoveClass":"components/RemoveClass.js"}}}');
});
require.register("noflo-noflo-css/index.js", function(exports, require, module){
/*
 * This file can be used for general library features that are exposed as CommonJS modules
 * that the components then utilize
 */

});
require.register("noflo-noflo-css/components/MoveElement.js", function(exports, require, module){
var MoveElement, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

MoveElement = (function(_super) {
  __extends(MoveElement, _super);

  MoveElement.prototype.description = 'Change the coordinates of a DOM element';

  function MoveElement() {
    var _this = this;
    this.element = null;
    this.inPorts = {
      element: new noflo.Port('object'),
      x: new noflo.Port('number'),
      y: new noflo.Port('number'),
      z: new noflo.Port('number')
    };
    this.inPorts.element.on('data', function(element) {
      return _this.element = element;
    });
    this.inPorts.x.on('data', function(x) {
      return _this.setPosition('left', "" + x + "px");
    });
    this.inPorts.y.on('data', function(y) {
      return _this.setPosition('top', "" + y + "px");
    });
    this.inPorts.z.on('data', function(z) {
      return _this.setPosition('zIndex', z);
    });
  }

  MoveElement.prototype.setPosition = function(attr, value) {
    this.element.style.position = 'absolute';
    return this.element.style[attr] = value;
  };

  return MoveElement;

})(noflo.Component);

exports.getComponent = function() {
  return new MoveElement;
};

});
require.register("noflo-noflo-css/components/RotateElement.js", function(exports, require, module){
var RotateElement, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

RotateElement = (function(_super) {
  __extends(RotateElement, _super);

  RotateElement.prototype.description = 'Change the coordinates of a DOM element';

  function RotateElement() {
    var _this = this;
    this.element = null;
    this.inPorts = {
      element: new noflo.Port('object'),
      percent: new noflo.Port('number')
    };
    this.inPorts.element.on('data', function(element) {
      return _this.element = element;
    });
    this.inPorts.percent.on('data', function(percent) {
      if (_this.element) {
        return _this.setRotation(_this.element, percent);
      }
    });
  }

  RotateElement.prototype.setRotation = function(element, percent) {
    var degrees;
    degrees = 360 * percent % 360;
    return this.setVendor(element, "transform", "rotate(" + degrees + "deg)");
  };

  RotateElement.prototype.setVendor = function(element, property, value) {
    var propertyCap;
    propertyCap = property.charAt(0).toUpperCase() + property.substr(1);
    element.style["webkit" + propertyCap] = value;
    element.style["moz" + propertyCap] = value;
    element.style["ms" + propertyCap] = value;
    element.style["o" + propertyCap] = value;
    return element.style[property] = value;
  };

  return RotateElement;

})(noflo.Component);

exports.getComponent = function() {
  return new RotateElement;
};

});
require.register("noflo-noflo-css/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-css","description":"Cascading Style Sheets components for NoFlo","author":"Henri Bergius <henri.bergius@iki.fi>","repo":"noflo/noflo-css","version":"0.0.1","keywords":[],"dependencies":{"noflo/noflo":"*"},"scripts":["components/MoveElement.js","components/RotateElement.js","index.js"],"json":["component.json"],"noflo":{"components":{"MoveElement":"components/MoveElement.js","RotateElement":"components/RotateElement.js"}}}');
});
require.register("noflo-noflo-interaction/index.js", function(exports, require, module){
/*
 * This file can be used for general library features that are exposed as CommonJS modules
 * that the components then utilize
 */

});
require.register("noflo-noflo-interaction/components/ListenDrag.js", function(exports, require, module){
var ListenDrag, noflo,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

ListenDrag = (function(_super) {
  __extends(ListenDrag, _super);

  ListenDrag.prototype.description = 'Listen to drag events on a DOM element';

  function ListenDrag() {
    this.dragend = __bind(this.dragend, this);
    this.dragmove = __bind(this.dragmove, this);
    this.dragstart = __bind(this.dragstart, this);
    var _this = this;
    this.inPorts = {
      element: new noflo.Port('object')
    };
    this.outPorts = {
      start: new noflo.ArrayPort('object'),
      movex: new noflo.ArrayPort('number'),
      movey: new noflo.ArrayPort('number'),
      end: new noflo.ArrayPort('object')
    };
    this.inPorts.element.on('data', function(element) {
      return _this.subscribe(element);
    });
  }

  ListenDrag.prototype.subscribe = function(element) {
    element.addEventListener('dragstart', this.dragstart, false);
    element.addEventListener('drag', this.dragmove, false);
    return element.addEventListener('dragend', this.dragend, false);
  };

  ListenDrag.prototype.dragstart = function(event) {
    event.preventDefault();
    event.stopPropagation();
    this.outPorts.start.send(event);
    return this.outPorts.start.disconnect();
  };

  ListenDrag.prototype.dragmove = function(event) {
    event.preventDefault();
    event.stopPropagation();
    this.outPorts.movex.send(event.clientX);
    return this.outPorts.movey.send(event.clientY);
  };

  ListenDrag.prototype.dragend = function(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.outPorts.movex.isConnected()) {
      this.outPorts.movex.disconnect();
    }
    if (this.outPorts.movey.isConnected()) {
      this.outPorts.movey.disconnect();
    }
    this.outPorts.end.send(event);
    return this.outPorts.end.disconnect();
  };

  return ListenDrag;

})(noflo.Component);

exports.getComponent = function() {
  return new ListenDrag;
};

});
require.register("noflo-noflo-interaction/components/ListenKeyboard.js", function(exports, require, module){
var ListenKeyboard, noflo,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

ListenKeyboard = (function(_super) {
  __extends(ListenKeyboard, _super);

  function ListenKeyboard() {
    this.keypress = __bind(this.keypress, this);
    var _this = this;
    this.inPorts = {
      element: new noflo.Port('object')
    };
    this.outPorts = {
      keypress: new noflo.Port('integer')
    };
    this.inPorts.element.on('data', function(element) {
      return _this.subscribe(element);
    });
  }

  ListenKeyboard.prototype.subscribe = function(element) {
    return element.addEventListener('keypress', this.keypress, false);
  };

  ListenKeyboard.prototype.keypress = function(event) {
    if (!this.outPorts.keypress.isAttached()) {
      return;
    }
    this.outPorts.keypress.send(event.keyCode);
    return this.outPorts.keypress.disconnect();
  };

  return ListenKeyboard;

})(noflo.Component);

exports.getComponent = function() {
  return new ListenKeyboard;
};

});
require.register("noflo-noflo-interaction/components/ListenMouse.js", function(exports, require, module){
var ListenMouse, noflo,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

ListenMouse = (function(_super) {
  __extends(ListenMouse, _super);

  ListenMouse.prototype.description = 'Listen to mouse events on a DOM element';

  function ListenMouse() {
    this.dblclick = __bind(this.dblclick, this);
    this.click = __bind(this.click, this);
    var _this = this;
    this.inPorts = {
      element: new noflo.Port('object')
    };
    this.outPorts = {
      click: new noflo.ArrayPort('object'),
      dblclick: new noflo.ArrayPort('object')
    };
    this.inPorts.element.on('data', function(element) {
      return _this.subscribe(element);
    });
  }

  ListenMouse.prototype.subscribe = function(element) {
    element.addEventListener('click', this.click, false);
    return element.addEventListener('dblclick', this.dblclick, false);
  };

  ListenMouse.prototype.click = function(event) {
    if (!this.outPorts.click.sockets.length) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.outPorts.click.send(event);
    return this.outPorts.click.disconnect();
  };

  ListenMouse.prototype.dblclick = function(event) {
    if (!this.outPorts.dblclick.sockets.length) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.outPorts.dblclick.send(event);
    return this.outPorts.dblclick.disconnect();
  };

  return ListenMouse;

})(noflo.Component);

exports.getComponent = function() {
  return new ListenMouse;
};

});
require.register("noflo-noflo-interaction/components/ListenScroll.js", function(exports, require, module){
var ListenScroll, noflo,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

ListenScroll = (function(_super) {
  __extends(ListenScroll, _super);

  ListenScroll.prototype.description = 'Listen to scroll events';

  function ListenScroll() {
    this.scroll = __bind(this.scroll, this);
    var _this = this;
    this.inPorts = {
      start: new noflo.Port
    };
    this.outPorts = {
      top: new noflo.Port('number'),
      bottom: new noflo.Port('number'),
      left: new noflo.Port('number'),
      right: new noflo.Port('number')
    };
    this.inPorts.start.on('data', function() {
      return _this.subscribe();
    });
  }

  ListenScroll.prototype.subscribe = function() {
    return window.addEventListener('scroll', this.scroll, false);
  };

  ListenScroll.prototype.scroll = function(event) {
    var bottom, left, right, top;
    top = window.scrollY;
    left = window.scrollX;
    if (this.outPorts.top.isAttached()) {
      this.outPorts.top.send(top);
      this.outPorts.top.disconnect();
    }
    if (this.outPorts.bottom.isAttached()) {
      bottom = top + window.innerHeight;
      this.outPorts.bottom.send(bottom);
      this.outPorts.bottom.disconnect();
    }
    if (this.outPorts.left.isAttached()) {
      this.outPorts.left.send(left);
      this.outPorts.left.disconnect();
    }
    if (this.outPorts.right.isAttached()) {
      right = left + window.innerWidth;
      this.outPorts.right.send(right);
      return this.outPorts.right.disconnect();
    }
  };

  return ListenScroll;

})(noflo.Component);

exports.getComponent = function() {
  return new ListenScroll;
};

});
require.register("noflo-noflo-interaction/components/ListenTouch.js", function(exports, require, module){
var ListenTouch, noflo,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

ListenTouch = (function(_super) {
  __extends(ListenTouch, _super);

  ListenTouch.prototype.description = 'Listen to touch events on a DOM element';

  function ListenTouch() {
    this.touchend = __bind(this.touchend, this);
    this.touchmove = __bind(this.touchmove, this);
    this.touchstart = __bind(this.touchstart, this);
    var _this = this;
    this.inPorts = {
      element: new noflo.Port('object')
    };
    this.outPorts = {
      start: new noflo.ArrayPort('object'),
      movex: new noflo.ArrayPort('number'),
      movey: new noflo.ArrayPort('number'),
      end: new noflo.ArrayPort('object')
    };
    this.inPorts.element.on('data', function(element) {
      return _this.subscribe(element);
    });
  }

  ListenTouch.prototype.subscribe = function(element) {
    element.addEventListener('touchstart', this.touchstart, false);
    element.addEventListener('touchmove', this.touchmove, false);
    return element.addEventListener('touchend', this.touchend, false);
  };

  ListenTouch.prototype.touchstart = function(event) {
    var idx, touch, _i, _len, _ref;
    event.preventDefault();
    event.stopPropagation();
    if (!event.changedTouches) {
      return;
    }
    if (!event.changedTouches.length) {
      return;
    }
    _ref = event.changedTouches;
    for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
      touch = _ref[idx];
      this.outPorts.start.beginGroup(idx);
      this.outPorts.start.send(event);
      this.outPorts.start.endGroup();
    }
    return this.outPorts.start.disconnect();
  };

  ListenTouch.prototype.touchmove = function(event) {
    var idx, touch, _i, _len, _ref, _results;
    event.preventDefault();
    event.stopPropagation();
    if (!event.changedTouches) {
      return;
    }
    if (!event.changedTouches.length) {
      return;
    }
    _ref = event.changedTouches;
    _results = [];
    for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
      touch = _ref[idx];
      this.outPorts.movex.beginGroup(idx);
      this.outPorts.movex.send(touch.pageX);
      this.outPorts.movex.endGroup();
      this.outPorts.movey.beginGroup(idx);
      this.outPorts.movey.send(touch.pageY);
      _results.push(this.outPorts.movey.endGroup());
    }
    return _results;
  };

  ListenTouch.prototype.touchend = function(event) {
    var idx, touch, _i, _len, _ref;
    event.preventDefault();
    event.stopPropagation();
    if (!event.changedTouches) {
      return;
    }
    if (!event.changedTouches.length) {
      return;
    }
    if (this.outPorts.movex.isConnected()) {
      this.outPorts.movex.disconnect();
    }
    if (this.outPorts.movey.isConnected()) {
      this.outPorts.movey.disconnect();
    }
    _ref = event.changedTouches;
    for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
      touch = _ref[idx];
      this.outPorts.end.beginGroup(idx);
      this.outPorts.end.send(event);
      this.outPorts.end.endGroup();
    }
    return this.outPorts.end.disconnect();
  };

  return ListenTouch;

})(noflo.Component);

exports.getComponent = function() {
  return new ListenTouch;
};

});
require.register("noflo-noflo-interaction/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-interaction","description":"User interaction components for NoFlo","author":"Henri Bergius <henri.bergius@iki.fi>","repo":"noflo/noflo-interaction","version":"0.0.1","keywords":[],"dependencies":{"noflo/noflo":"*"},"scripts":["components/ListenDrag.js","components/ListenKeyboard.js","components/ListenMouse.js","components/ListenScroll.js","components/ListenTouch.js","index.js"],"json":["component.json"],"noflo":{"components":{"ListenDrag":"components/ListenDrag.js","ListenKeyboard":"components/ListenKeyboard.js","ListenMouse":"components/ListenMouse.js","ListenScroll":"components/ListenScroll.js","ListenTouch":"components/ListenTouch.js"}}}');
});
require.register("noflo-noflo-physics/index.js", function(exports, require, module){
/*
 * This file can be used for general library features of noflo-physics.
 *
 * The library features can be made available as CommonJS modules that the
 * components in this project utilize.
 */

});
require.register("noflo-noflo-physics/components/Spring.js", function(exports, require, module){
var Spring, noflo, requestAnimFrame,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (typeof process === 'object' && process.title === 'node') {
  noflo = require("noflo");
  requestAnimFrame = process.nextTick;
} else {
  noflo = require('noflo');
  requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
    return setTimeout(callback, 1);
  };
}

Spring = (function(_super) {
  __extends(Spring, _super);

  Spring.prototype.description = 'Animates a directional spring';

  function Spring() {
    this.step = __bind(this.step, this);
    var _this = this;
    this.massPosition = 0;
    this.anchorPosition = 0;
    this.stiffness = 120;
    this.mass = 10;
    this.friction = 3;
    this.speed = 0;
    this.inPorts = {
      anchor: new noflo.Port('number'),
      "in": new noflo.Port('number'),
      stiffness: new noflo.Port('int'),
      mass: new noflo.Port('int'),
      friction: new noflo.Port('int')
    };
    this.outPorts = {
      out: new noflo.Port('number')
    };
    this.inPorts.anchor.on('data', function(anchorPosition) {
      _this.anchorPosition = anchorPosition;
    });
    this.inPorts.stiffness.on('data', function(stiffness) {
      _this.stiffness = stiffness;
    });
    this.inPorts.mass.on('data', function(mass) {
      _this.mass = mass;
    });
    this.inPorts.friction.on('data', function(friction) {
      _this.friction = friction;
    });
    this.inPorts["in"].on('data', function(massPosition) {
      _this.massPosition = massPosition;
      return _this.step();
    });
  }

  Spring.prototype.step = function() {
    var acceleration, dampingForce, distance, previousPosition, springForce, totalForce;
    distance = this.massPosition - this.anchorPosition;
    dampingForce = -this.friction * this.speed;
    springForce = -this.stiffness * distance;
    totalForce = springForce + dampingForce;
    acceleration = totalForce / this.mass;
    this.speed += acceleration;
    previousPosition = this.massPosition;
    this.massPosition += this.speed / 100;
    if (Math.round(this.massPosition) !== Math.round(previousPosition)) {
      this.outPorts.out.send(Math.round(this.massPosition));
    }
    if (Math.round(this.massPosition) === this.anchorPosition && Math.abs(this.speed) < 0.2) {
      return this.outPorts.out.disconnect();
    } else {
      if (this.massPosition === 0) {
        return;
      }
      return requestAnimFrame(this.step);
    }
  };

  return Spring;

})(noflo.Component);

exports.getComponent = function() {
  return new Spring;
};

});
require.register("noflo-noflo-physics/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-physics","description":"Physics components for NoFlo","author":"Henri Bergius <henri.bergius@iki.fi>","repo":"noflo/noflo-physics","version":"0.1.0","keywords":[],"dependencies":{"noflo/noflo":"*"},"scripts":["components/Spring.js","index.js"],"json":["component.json"],"noflo":{"components":{"Spring":"components/Spring.js"}}}');
});
require.register("noflo-noflo-math/index.js", function(exports, require, module){
/*
 * This file can be used for general library features of noflo-math.
 *
 * The library features can be made available as CommonJS modules that the
 * components in this project utilize.
 */

});
require.register("noflo-noflo-math/components/Add.js", function(exports, require, module){
var Add, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Add = (function(_super) {
  __extends(Add, _super);

  function Add() {
    var _this = this;
    this.augend = null;
    this.addend = null;
    this.inPorts = {
      augend: new noflo.Port,
      addend: new noflo.Port
    };
    this.outPorts = {
      sum: new noflo.Port
    };
    this.inPorts.augend.on('data', function(data) {
      _this.augend = data;
      if (_this.addend !== null) {
        return _this.add();
      }
    });
    this.inPorts.addend.on('data', function(data) {
      _this.addend = data;
      if (_this.augend !== null) {
        return _this.add();
      }
    });
  }

  Add.prototype.add = function() {
    this.outPorts.sum.send(this.augend + this.addend);
    return this.outPorts.sum.disconnect();
  };

  return Add;

})(noflo.Component);

exports.getComponent = function() {
  return new Add;
};

});
require.register("noflo-noflo-math/components/Subtract.js", function(exports, require, module){
var Subtract, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Subtract = (function(_super) {
  __extends(Subtract, _super);

  function Subtract() {
    var _this = this;
    this.minuend = null;
    this.subtrahend = null;
    this.inPorts = {
      minuend: new noflo.Port,
      subtrahend: new noflo.Port
    };
    this.outPorts = {
      difference: new noflo.Port
    };
    this.inPorts.minuend.on('data', function(data) {
      _this.minuend = data;
      if (_this.subtrahend !== null) {
        return _this.add();
      }
    });
    this.inPorts.subtrahend.on('data', function(data) {
      _this.subtrahend = data;
      if (_this.minuend !== null) {
        return _this.add();
      }
    });
  }

  Subtract.prototype.add = function() {
    this.outPorts.difference.send(this.minuend - this.subtrahend);
    return this.outPorts.difference.disconnect();
  };

  return Subtract;

})(noflo.Component);

exports.getComponent = function() {
  return new Subtract;
};

});
require.register("noflo-noflo-math/components/Multiply.js", function(exports, require, module){
var Multiply, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Multiply = (function(_super) {
  __extends(Multiply, _super);

  function Multiply() {
    var _this = this;
    this.multiplicand = null;
    this.multiplier = null;
    this.inPorts = {
      multiplicand: new noflo.Port,
      multiplier: new noflo.Port
    };
    this.outPorts = {
      product: new noflo.Port
    };
    this.inPorts.multiplicand.on('data', function(data) {
      _this.multiplicand = data;
      if (_this.multiplier !== null) {
        return _this.add();
      }
    });
    this.inPorts.multiplier.on('data', function(data) {
      _this.multiplier = data;
      if (_this.multiplicand !== null) {
        return _this.add();
      }
    });
  }

  Multiply.prototype.add = function() {
    this.outPorts.product.send(this.multiplicand * this.multiplier);
    return this.outPorts.product.disconnect();
  };

  return Multiply;

})(noflo.Component);

exports.getComponent = function() {
  return new Multiply;
};

});
require.register("noflo-noflo-math/components/Divide.js", function(exports, require, module){
var Divide, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Divide = (function(_super) {
  __extends(Divide, _super);

  function Divide() {
    var _this = this;
    this.dividend = null;
    this.divisor = null;
    this.inPorts = {
      dividend: new noflo.Port,
      divisor: new noflo.Port
    };
    this.outPorts = {
      quotient: new noflo.Port
    };
    this.inPorts.dividend.on('data', function(data) {
      _this.dividend = data;
      if (_this.divisor !== null) {
        return _this.add();
      }
    });
    this.inPorts.divisor.on('data', function(data) {
      _this.divisor = data;
      if (_this.dividend !== null) {
        return _this.add();
      }
    });
  }

  Divide.prototype.add = function() {
    this.outPorts.quotient.send(this.dividend / this.divisor);
    return this.outPorts.quotient.disconnect();
  };

  return Divide;

})(noflo.Component);

exports.getComponent = function() {
  return new Divide;
};

});
require.register("noflo-noflo-math/components/CountSum.js", function(exports, require, module){
var CountSum, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

CountSum = (function(_super) {
  __extends(CountSum, _super);

  function CountSum() {
    var _this = this;
    this.portCounts = {};
    this.inPorts = {
      "in": new noflo.ArrayPort('number')
    };
    this.outPorts = {
      out: new noflo.ArrayPort('number')
    };
    this.inPorts["in"].on('data', function(data, portId) {
      return _this.count(portId, data);
    });
    this.inPorts["in"].on('disconnect', function(socket, portId) {
      var _i, _len, _ref;
      _ref = _this.inPorts["in"].sockets;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        socket = _ref[_i];
        if (socket.isConnected()) {
          return;
        }
      }
      return _this.outPorts.out.disconnect();
    });
  }

  CountSum.prototype.count = function(port, data) {
    var id, socket, sum, _i, _len, _ref;
    sum = 0;
    this.portCounts[port] = data;
    _ref = this.inPorts["in"].sockets;
    for (id = _i = 0, _len = _ref.length; _i < _len; id = ++_i) {
      socket = _ref[id];
      if (typeof this.portCounts[id] === 'undefined') {
        this.portCounts[id] = 0;
      }
      sum += this.portCounts[id];
    }
    return this.outPorts.out.send(sum);
  };

  return CountSum;

})(noflo.Component);

exports.getComponent = function() {
  return new CountSum;
};

});
require.register("noflo-noflo-math/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-math","description":"Mathematical components for NoFlo","author":"Henri Bergius <henri.bergius@iki.fi>","repo":"noflo/noflo-math","version":"0.0.1","keywords":[],"dependencies":{"noflo/noflo":"*"},"scripts":["components/Add.js","components/Subtract.js","components/Multiply.js","components/Divide.js","components/CountSum.js","index.js"],"json":["component.json"],"noflo":{"components":{"Add":"components/Add.js","Subtract":"components/Subtract.js","Multiply":"components/Multiply.js","Divide":"components/Divide.js","CountSum":"components/CountSum.js"}}}');
});
require.register("d4tocchini-noflo-draggabilly/index.js", function(exports, require, module){
/*
 * This file can be used for general library features that are exposed as CommonJS modules
 * that the components then utilize
 */

});
require.register("d4tocchini-noflo-draggabilly/components/Draggabilly.js", function(exports, require, module){
var NoFloDraggabilly, noflo,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

/*
if typeof process is 'object' and process.title is 'node'
  noflo = require "../../lib/NoFlo"
else
  noflo = require '../lib/NoFlo'
*/


NoFloDraggabilly = (function(_super) {
  __extends(NoFloDraggabilly, _super);

  NoFloDraggabilly.prototype.description = 'Make shiz draggable';

  function NoFloDraggabilly() {
    this.dragend = __bind(this.dragend, this);
    this.dragmove = __bind(this.dragmove, this);
    this.dragstart = __bind(this.dragstart, this);
    this.subscribe = __bind(this.subscribe, this);
    var _this = this;
    this.options = {};
    this.inPorts = {
      container: new noflo.Port('object'),
      options: new noflo.Port,
      element: new noflo.Port('object')
    };
    this.outPorts = {
      start: new noflo.ArrayPort('object'),
      movex: new noflo.ArrayPort('number'),
      movey: new noflo.ArrayPort('number'),
      end: new noflo.ArrayPort('object')
    };
    this.inPorts.container.on("data", function(data) {
      return _this.setOptions({
        containment: data
      });
    });
    this.inPorts.options.on("data", function(data) {
      return _this.setOptions(data);
    });
    this.inPorts.element.on('data', function(element) {
      return _this.subscribe(element);
    });
  }

  NoFloDraggabilly.prototype.subscribe = function(element) {
    var draggie;
    draggie = this.draggie = new Draggabilly(element, this.options);
    draggie.on('dragStart', this.dragstart);
    draggie.on('dragMove', this.dragmove);
    return draggie.on('dragEnd', this.dragend);
  };

  NoFloDraggabilly.prototype.setOptions = function(options) {
    var key, value, _results;
    if (typeof options !== "object") {
      throw new Error("Options is not an object");
    }
    _results = [];
    for (key in options) {
      if (!__hasProp.call(options, key)) continue;
      value = options[key];
      _results.push(this.options[key] = value);
    }
    return _results;
  };

  NoFloDraggabilly.prototype.dragstart = function(draggie, event, pointer) {
    this.outPorts.start.send(event);
    this.outPorts.start.disconnect();
    this.outPorts.movex.send(draggie.position.x);
    return this.outPorts.movey.send(draggie.position.y);
  };

  NoFloDraggabilly.prototype.dragmove = function(draggie, event, pointer) {
    this.outPorts.movex.send(draggie.position.x);
    return this.outPorts.movey.send(draggie.position.y);
  };

  NoFloDraggabilly.prototype.dragend = function(draggie, event, pointer) {
    if (this.outPorts.movex.isConnected()) {
      this.outPorts.movex.disconnect();
    }
    if (this.outPorts.movey.isConnected()) {
      this.outPorts.movey.disconnect();
    }
    this.outPorts.end.send(event);
    return this.outPorts.end.disconnect();
  };

  return NoFloDraggabilly;

})(noflo.Component);

exports.getComponent = function() {
  return new NoFloDraggabilly;
};

});
require.register("d4tocchini-noflo-draggabilly/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-draggabilly","description":"Draggabilly components for the NoFlo flow-based programming environment","author":"D4 Tocchini <d4@rituwall.com>","repo":"d4tocchini/noflo-draggabilly","version":"0.0.1","keywords":["fbp","drag","dnd","draggable"],"dependencies":{"noflo/noflo":"*"},"scripts":["components/Draggabilly.js","index.js"],"json":["component.json"],"noflo":{"components":{"Draggabilly":"components/Draggabilly.js"}}}');
});
require.register("dataflow-noflo/src/dataflow-noflo.js", function(exports, require, module){
var Base, Dataflow, DataflowNoflo, Graph, NofloBase, NofloSubgraph, noflo;

Dataflow = require('/meemoo-dataflow').Dataflow;

noflo = require('noflo');

require('./component');

require('./subgraph');

Base = Dataflow.prototype.node('base');

Graph = Dataflow.prototype.module('graph');

NofloBase = Dataflow.prototype.node('noflo-base');

NofloSubgraph = Dataflow.prototype.node('noflo-subgraph');

DataflowNoflo = Dataflow.prototype.plugin("noflo");

DataflowNoflo.initialize = function(dataflow) {
  dataflow.plugins.source.listeners(false);
  return dataflow.plugins.log.listeners(false);
};

DataflowNoflo.aliases = {};

DataflowNoflo.registerGraph = function(graph, dataflow, callback, main) {
  var dataflowGraph;
  if (main == null) {
    main = true;
  }
  if (main) {
    dataflowGraph = dataflow.loadGraph({});
  } else {
    dataflowGraph = new Graph.Model({
      dataflow: dataflow
    });
  }
  dataflowGraph.nofloGraph = graph;
  graph.dataflowGraph = dataflowGraph;
  return DataflowNoflo.loadComponents(graph.baseDir, function() {
    dataflow.plugins.library.update({
      exclude: ["base", "base-resizable", "dataflow-subgraph", "noflo-base", "noflo-subgraph"]
    });
    return DataflowNoflo.loadGraph(graph, dataflow, function() {
      if (callback) {
        return callback(dataflowGraph);
      }
    });
  });
};

DataflowNoflo.registerAlias = function(name) {
  var parts;
  parts = name.split('/');
  if (parts.length === 2 && !DataflowNoflo.aliases[parts[1]]) {
    return DataflowNoflo.aliases[parts[1]] = name;
  }
};

DataflowNoflo.loadComponents = function(baseDir, ready) {
  var cl;
  cl = new noflo.ComponentLoader();
  cl.baseDir = baseDir;
  return cl.listComponents(function(types) {
    var name, readyAfter, _results;
    readyAfter = _.after(Object.keys(types).length, ready);
    _results = [];
    for (name in types) {
      DataflowNoflo.registerAlias(name);
      _results.push(cl.load(name, function(component) {
        DataflowNoflo.registerComponent(name, component);
        return readyAfter();
      }));
    }
    return _results;
  });
};

DataflowNoflo.loadGraph = function(graph, dataflow, callback) {
  var nodesReady;
  graph.dataflowGraph.on("change", function(dfGraph) {
    return dataflow.plugins.source.show(JSON.stringify(graph.toJSON(), null, 2));
  });
  graph.on("addNode", function(node) {
    DataflowNoflo.addNode(node, graph.dataflowGraph, dataflow);
    return dataflow.plugins.log.add("node added: " + node.id);
  });
  graph.on("addEdge", function(edge) {
    DataflowNoflo.addEdge(edge, graph.dataflowGraph, dataflow);
    return dataflow.plugins.log.add("edge added.");
  });
  graph.on("addInitial", function(iip) {
    DataflowNoflo.addInitial(iip, graph.dataflowGraph, dataflow);
    return dataflow.plugins.log.add("IIP added: " + JSON.stringify(iip));
  });
  graph.on("removeNode", function(node) {
    if (node.dataflowNode != null) {
      node.dataflowNode.remove();
    }
    return dataflow.plugins.log.add("node removed: " + node.id);
  });
  graph.on("removeEdge", function(edge) {
    if ((edge.from.node != null) && (edge.to.node != null)) {
      if (edge.dataflowEdge != null) {
        edge.dataflowEdge.remove();
      }
    }
    return dataflow.plugins.log.add("edge removed.");
  });
  dataflow.on("node:add", function(dfGraph, node) {
    if (dfGraph !== graph.dataflowGraph) {
      return;
    }
    if (node.nofloNode == null) {
      node.nofloNode = graph.addNode(node.id + "", node.type, {
        x: node.get("x"),
        y: node.get("y")
      });
    }
    node.on("change:label", function(node, newName) {
      var oldName;
      oldName = node.nofloNode.id;
      return graph.renameNode(oldName, newName);
    });
    node.on("change:x change:y", function() {
      node.nofloNode.metadata.x = node.get('x');
      return node.nofloNode.metadata.y = node.get('y');
    });
    node.on("change:state", function(port, value) {
      var iip, metadata, _i, _len, _ref;
      metadata = {};
      _ref = graph.initializers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        iip = _ref[_i];
        if (!iip) {
          continue;
        }
        if (iip.to.node === node.nofloNode.id && iip.to.port === port) {
          if (iip.from.data === value) {
            return;
          }
          metadata = iip.metadata;
          graph.removeInitial(node.nofloNode.id, port);
        }
      }
      return graph.addInitial(value, node.nofloNode.id, port, metadata);
    });
    return node.on("bang", function(port) {
      var iip, metadata, _i, _len, _ref;
      metadata = {};
      _ref = graph.initializers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        iip = _ref[_i];
        if (!iip) {
          continue;
        }
        if (iip.to.node === node.nofloNode.id && iip.to.port === port) {
          metadata = iip.metadata;
          graph.removeInitial(node.nofloNode.id, port);
        }
      }
      return graph.addInitial(true, node.nofloNode.id, port, metadata);
    });
  });
  dataflow.on("edge:add", function(dfGraph, edge) {
    var error;
    if (dfGraph !== graph.dataflowGraph) {
      return;
    }
    if (edge.nofloEdge == null) {
      try {
        edge.nofloEdge = graph.addEdge(edge.source.parentNode.id, edge.source.id, edge.target.parentNode.id, edge.target.id, {
          route: edge.get('route')
        });
      } catch (_error) {
        error = _error;
      }
    }
    return edge.on('change:route', function() {
      return edge.nofloEdge.metadata.route = edge.get('route');
    });
  });
  dataflow.on("node:remove", function(dfGraph, node) {
    if (dfGraph !== graph.dataflowGraph) {
      return;
    }
    if (node.nofloNode != null) {
      return graph.removeNode(node.nofloNode.id);
    }
  });
  dataflow.on("edge:remove", function(dfGraph, edge) {
    if (dfGraph !== graph.dataflowGraph) {
      return;
    }
    if (edge.nofloEdge != null) {
      edge = edge.nofloEdge;
      return graph.removeEdge(edge.from.node, edge.from.port, edge.to.node, edge.to.port);
    }
  });
  nodesReady = _.after(graph.nodes.length, function() {
    var edge, iip, _i, _j, _len, _len1, _ref, _ref1;
    _ref = graph.edges;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      edge = _ref[_i];
      DataflowNoflo.addEdge(edge, graph.dataflowGraph, dataflow);
    }
    _ref1 = graph.initializers;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      iip = _ref1[_j];
      DataflowNoflo.addInitial(iip, graph.dataflowGraph, dataflow);
    }
    if (callback) {
      return callback(graph.dataflowGraph);
    }
  });
  return _.each(graph.nodes, function(node) {
    return DataflowNoflo.addNode(node, graph.dataflowGraph, dataflow, nodesReady);
  });
};

DataflowNoflo.getComponent = function(name, dataflow) {
  var type;
  type = dataflow.node(name);
  if (!type.Model) {
    if (DataflowNoflo.aliases[node.component]) {
      type = dataflow.node(DataflowNoflo.aliases[node.component]);
    } else {
      throw new Error("Component " + node.component + " not available");
    }
  }
  return type;
};

DataflowNoflo.addNode = function(node, dataflowGraph, dataflow, ready) {
  var dfNode, subgraph, type;
  if (!node) {
    if (ready) {
      ready(null);
    }
    return;
  }
  if (node.dataflowNode == null) {
    type = DataflowNoflo.getComponent(node.component, dataflow);
    dfNode = new type.Model({
      id: node.id,
      label: node.id,
      x: (node.metadata.x != null ? node.metadata.x : 300),
      y: (node.metadata.y != null ? node.metadata.y : 300),
      parentGraph: dataflowGraph
    });
    dfNode.nofloNode = node;
    node.dataflowNode = dfNode;
    if (dfNode.isSubgraph()) {
      subgraph = dfNode.nofloComponent.network.graph;
      DataflowNoflo.registerGraph(subgraph, dataflow, function(dfGraph) {
        dfNode.graph = dfGraph;
        dataflowGraph.nodes.add(dfNode);
        if (ready) {
          return ready(node.dataflowNode);
        }
      }, false);
      return;
    }
    dataflowGraph.nodes.add(dfNode);
  }
  if (ready) {
    return ready(node.dataflowNode);
  }
};

DataflowNoflo.addEdge = function(edge, dataflowGraph, dataflow) {
  var Edge, dfEdge;
  if (!edge) {
    return;
  }
  if (edge.dataflowEdge == null) {
    Edge = dataflow.module('edge');
    if (!edge.metadata) {
      edge.metadata = {};
    }
    dfEdge = new Edge.Model({
      id: edge.from.node + ":" + edge.from.port + "::" + edge.to.node + ":" + edge.to.port,
      parentGraph: dataflowGraph,
      source: {
        node: edge.from.node,
        port: edge.from.port
      },
      target: {
        node: edge.to.node,
        port: edge.to.port
      },
      route: (edge.metadata.route != null ? edge.metadata.route : 0)
    });
    dfEdge.nofloEdge = edge;
    edge.dataflowEdge = dfEdge;
    return dataflowGraph.edges.add(dfEdge);
  }
};

DataflowNoflo.addInitial = function(iip, dataflowGraph) {
  var node, port;
  node = dataflowGraph.nodes.get(iip.to.node);
  if (node) {
    port = node.inputs.get(iip.to.port);
    if (port) {
      return node.setState(iip.to.port, iip.from.data);
    }
  }
};

DataflowNoflo.registerComponent = function(name, component, ready) {
  var base, newType, toPortDefinition;
  toPortDefinition = function(port, name) {
    return {
      id: name,
      type: port.type
    };
  };
  base = NofloBase;
  if (component.isSubgraph()) {
    base = NofloSubgraph;
  }
  newType = Dataflow.prototype.node(name);
  newType.Model = base.Model.extend({
    defaults: function() {
      return _.extend({}, Base.Model.prototype.defaults.call(this), {
        type: name,
        graph: {}
      });
    },
    inputs: _.map(component.inPorts, toPortDefinition),
    outputs: _.map(component.outPorts, toPortDefinition),
    nofloComponent: component
  });
  newType.View = base.View.extend();
  if (ready) {
    return ready();
  }
};

});
require.register("dataflow-noflo/src/component.js", function(exports, require, module){
var Base, Dataflow, NofloBase;

Dataflow = require('/meemoo-dataflow').Dataflow;

Base = Dataflow.prototype.node('base');

NofloBase = Dataflow.prototype.node('noflo-base');

NofloBase.Model = Base.Model.extend({
  defaults: function() {
    var defaults;
    defaults = Base.Model.prototype.defaults.call(this);
    defaults.type = 'noflo-base';
    return defaults;
  },
  initialize: function() {
    return Base.Model.prototype.initialize.call(this);
  },
  isSubgraph: function() {
    return false;
  },
  unload: function() {},
  toJSON: function() {
    var json;
    json = Base.Model.prototype.toJSON.call(this);
    return json;
  },
  inputs: [],
  outputs: []
});

NofloBase.View = Base.View.extend();

});
require.register("dataflow-noflo/src/subgraph.js", function(exports, require, module){
var Dataflow, NofloBase, NofloSubgraph, Subgraph;

Dataflow = require('/meemoo-dataflow').Dataflow;

NofloBase = Dataflow.prototype.node('noflo-base');

Subgraph = Dataflow.prototype.node('dataflow-subgraph');

NofloSubgraph = Dataflow.prototype.node('noflo-subgraph');

NofloSubgraph.Model = Subgraph.Model.extend({
  defaults: function() {
    var defaults, graph;
    defaults = Subgraph.Model.prototype.defaults.call(this);
    defaults.type = "noflo-subgraph";
    graph = {};
    return defaults;
  },
  initialize: function() {
    return Subgraph.Model.prototype.initialize.call(this);
  },
  isSubgraph: function() {
    return true;
  },
  unload: function() {},
  toJSON: function() {
    var json;
    json = Subgraph.Model.prototype.toJSON.call(this);
    return json;
  },
  inputs: [],
  outputs: []
});

NofloSubgraph.View = Subgraph.View.extend({
  initialize: function(options) {
    return Subgraph.View.prototype.initialize.call(this, options);
  }
});

});
require.register("dataflow-noflo/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"dataflow-noflo","description":"bergie/noflo graphs editable with meemoo/dataflow","author":"Forrest Oliphant <forrest@sembiki.com>","repo":"forresto/dataflow-noflo","version":"0.0.1","keywords":["fbp","noflo","graph","visual","dataflow"],"dependencies":{"meemoo/dataflow":"*","noflo/noflo":"*","noflo/noflo-core":"*","noflo/noflo-flow":"*","noflo/noflo-objects":"*","noflo/noflo-strings":"*","noflo/noflo-dom":"*","noflo/noflo-css":"*","noflo/noflo-interaction":"*","noflo/noflo-physics":"*","noflo/noflo-math":"*","d4tocchini/noflo-draggabilly":"*"},"scripts":["src/dataflow-noflo.js","src/component.js","src/subgraph.js"],"main":"src/dataflow-noflo.js","json":["component.json","graphs/Button.json"],"noflo":{"graphs":{"Button":"graphs/Button.json"}}}');
});
require.register("dataflow-noflo/graphs/Button.json", function(exports, require, module){
module.exports = JSON.parse('{"processes":{"GetButton":{"component":"dom/GetElement"},"Listen":{"component":"interaction/ListenMouse"},"GetClicked":{"component":"objects/GetObjectKey"},"GetValue":{"component":"dom/ReadHtml"}},"connections":[{"src":{"process":"GetButton","port":"element"},"tgt":{"process":"Listen","port":"element"}},{"src":{"process":"Listen","port":"click"},"tgt":{"process":"GetClicked","port":"in"}},{"data":"target","tgt":{"process":"GetClicked","port":"key"}},{"src":{"process":"GetClicked","port":"out"},"tgt":{"process":"GetValue","port":"container"}}],"exports":[{"private":"getbutton.selector","public":"selector"},{"private":"getbutton.in","public":"container"},{"private":"getvalue.html","public":"clicked"}]}');
});
require.alias("meemoo-dataflow/build/dataflow.build.js", "dataflow-noflo/deps/dataflow/build/dataflow.build.js");
require.alias("meemoo-dataflow/build/dataflow.build.js", "dataflow-noflo/deps/dataflow/index.js");
require.alias("meemoo-dataflow/build/dataflow.build.js", "dataflow/index.js");
require.alias("meemoo-dataflow/build/dataflow.build.js", "meemoo-dataflow/index.js");

require.alias("noflo-noflo/src/lib/Graph.js", "dataflow-noflo/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "dataflow-noflo/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "dataflow-noflo/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "dataflow-noflo/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "dataflow-noflo/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "dataflow-noflo/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "dataflow-noflo/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "dataflow-noflo/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "dataflow-noflo/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "dataflow-noflo/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "dataflow-noflo/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "dataflow-noflo/deps/noflo/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");

require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");

require.alias("noflo-noflo-core/components/Callback.js", "dataflow-noflo/deps/noflo-core/components/Callback.js");
require.alias("noflo-noflo-core/components/Drop.js", "dataflow-noflo/deps/noflo-core/components/Drop.js");
require.alias("noflo-noflo-core/components/Group.js", "dataflow-noflo/deps/noflo-core/components/Group.js");
require.alias("noflo-noflo-core/components/Kick.js", "dataflow-noflo/deps/noflo-core/components/Kick.js");
require.alias("noflo-noflo-core/components/Merge.js", "dataflow-noflo/deps/noflo-core/components/Merge.js");
require.alias("noflo-noflo-core/components/Output.js", "dataflow-noflo/deps/noflo-core/components/Output.js");
require.alias("noflo-noflo-core/components/Repeat.js", "dataflow-noflo/deps/noflo-core/components/Repeat.js");
require.alias("noflo-noflo-core/components/RepeatAsync.js", "dataflow-noflo/deps/noflo-core/components/RepeatAsync.js");
require.alias("noflo-noflo-core/components/Split.js", "dataflow-noflo/deps/noflo-core/components/Split.js");
require.alias("noflo-noflo-core/components/RunInterval.js", "dataflow-noflo/deps/noflo-core/components/RunInterval.js");
require.alias("noflo-noflo-core/index.js", "dataflow-noflo/deps/noflo-core/index.js");
require.alias("noflo-noflo-core/index.js", "noflo-core/index.js");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-core/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-core/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-core/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-core/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-core/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-core/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-core/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-core/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-core/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-core/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-core/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-core/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");

require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");

require.alias("component-underscore/index.js", "noflo-noflo-core/deps/underscore/index.js");

require.alias("noflo-noflo-flow/components/Gate.js", "dataflow-noflo/deps/noflo-flow/components/Gate.js");
require.alias("noflo-noflo-flow/index.js", "dataflow-noflo/deps/noflo-flow/index.js");
require.alias("noflo-noflo-flow/index.js", "noflo-flow/index.js");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-flow/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-flow/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-flow/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-flow/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-flow/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-flow/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-flow/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-flow/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-flow/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-flow/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-flow/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-flow/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");

require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");

require.alias("noflo-noflo-objects/components/Extend.js", "dataflow-noflo/deps/noflo-objects/components/Extend.js");
require.alias("noflo-noflo-objects/components/MergeObjects.js", "dataflow-noflo/deps/noflo-objects/components/MergeObjects.js");
require.alias("noflo-noflo-objects/components/SplitObject.js", "dataflow-noflo/deps/noflo-objects/components/SplitObject.js");
require.alias("noflo-noflo-objects/components/ReplaceKey.js", "dataflow-noflo/deps/noflo-objects/components/ReplaceKey.js");
require.alias("noflo-noflo-objects/components/Keys.js", "dataflow-noflo/deps/noflo-objects/components/Keys.js");
require.alias("noflo-noflo-objects/components/Values.js", "dataflow-noflo/deps/noflo-objects/components/Values.js");
require.alias("noflo-noflo-objects/components/Join.js", "dataflow-noflo/deps/noflo-objects/components/Join.js");
require.alias("noflo-noflo-objects/components/ExtractProperty.js", "dataflow-noflo/deps/noflo-objects/components/ExtractProperty.js");
require.alias("noflo-noflo-objects/components/InsertProperty.js", "dataflow-noflo/deps/noflo-objects/components/InsertProperty.js");
require.alias("noflo-noflo-objects/components/SliceArray.js", "dataflow-noflo/deps/noflo-objects/components/SliceArray.js");
require.alias("noflo-noflo-objects/components/SplitArray.js", "dataflow-noflo/deps/noflo-objects/components/SplitArray.js");
require.alias("noflo-noflo-objects/components/FilterPropertyValue.js", "dataflow-noflo/deps/noflo-objects/components/FilterPropertyValue.js");
require.alias("noflo-noflo-objects/components/FlattenObject.js", "dataflow-noflo/deps/noflo-objects/components/FlattenObject.js");
require.alias("noflo-noflo-objects/components/MapProperty.js", "dataflow-noflo/deps/noflo-objects/components/MapProperty.js");
require.alias("noflo-noflo-objects/components/RemoveProperty.js", "dataflow-noflo/deps/noflo-objects/components/RemoveProperty.js");
require.alias("noflo-noflo-objects/components/MapPropertyValue.js", "dataflow-noflo/deps/noflo-objects/components/MapPropertyValue.js");
require.alias("noflo-noflo-objects/components/GetObjectKey.js", "dataflow-noflo/deps/noflo-objects/components/GetObjectKey.js");
require.alias("noflo-noflo-objects/components/UniqueArray.js", "dataflow-noflo/deps/noflo-objects/components/UniqueArray.js");
require.alias("noflo-noflo-objects/components/SetProperty.js", "dataflow-noflo/deps/noflo-objects/components/SetProperty.js");
require.alias("noflo-noflo-objects/components/SimplifyObject.js", "dataflow-noflo/deps/noflo-objects/components/SimplifyObject.js");
require.alias("noflo-noflo-objects/components/DuplicateProperty.js", "dataflow-noflo/deps/noflo-objects/components/DuplicateProperty.js");
require.alias("noflo-noflo-objects/components/CreateObject.js", "dataflow-noflo/deps/noflo-objects/components/CreateObject.js");
require.alias("noflo-noflo-objects/components/CreateDate.js", "dataflow-noflo/deps/noflo-objects/components/CreateDate.js");
require.alias("noflo-noflo-objects/components/SetPropertyValue.js", "dataflow-noflo/deps/noflo-objects/components/SetPropertyValue.js");
require.alias("noflo-noflo-objects/components/CallMethod.js", "dataflow-noflo/deps/noflo-objects/components/CallMethod.js");
require.alias("noflo-noflo-objects/index.js", "dataflow-noflo/deps/noflo-objects/index.js");
require.alias("noflo-noflo-objects/index.js", "noflo-objects/index.js");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-objects/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-objects/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-objects/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-objects/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-objects/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-objects/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-objects/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-objects/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-objects/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-objects/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-objects/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-objects/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");

require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");

require.alias("component-underscore/index.js", "noflo-noflo-objects/deps/underscore/index.js");

require.alias("noflo-noflo-strings/components/Filter.js", "dataflow-noflo/deps/noflo-strings/components/Filter.js");
require.alias("noflo-noflo-strings/components/SendString.js", "dataflow-noflo/deps/noflo-strings/components/SendString.js");
require.alias("noflo-noflo-strings/components/StringTemplate.js", "dataflow-noflo/deps/noflo-strings/components/StringTemplate.js");
require.alias("noflo-noflo-strings/components/Replace.js", "dataflow-noflo/deps/noflo-strings/components/Replace.js");
require.alias("noflo-noflo-strings/index.js", "dataflow-noflo/deps/noflo-strings/index.js");
require.alias("noflo-noflo-strings/index.js", "noflo-strings/index.js");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-strings/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-strings/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-strings/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-strings/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-strings/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-strings/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-strings/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-strings/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-strings/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-strings/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-strings/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-strings/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");

require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");

require.alias("component-underscore/index.js", "noflo-noflo-strings/deps/underscore/index.js");

require.alias("noflo-noflo-dom/components/AddClass.js", "dataflow-noflo/deps/noflo-dom/components/AddClass.js");
require.alias("noflo-noflo-dom/components/AppendChild.js", "dataflow-noflo/deps/noflo-dom/components/AppendChild.js");
require.alias("noflo-noflo-dom/components/CreateElement.js", "dataflow-noflo/deps/noflo-dom/components/CreateElement.js");
require.alias("noflo-noflo-dom/components/CreateFragment.js", "dataflow-noflo/deps/noflo-dom/components/CreateFragment.js");
require.alias("noflo-noflo-dom/components/GetAttribute.js", "dataflow-noflo/deps/noflo-dom/components/GetAttribute.js");
require.alias("noflo-noflo-dom/components/GetElement.js", "dataflow-noflo/deps/noflo-dom/components/GetElement.js");
require.alias("noflo-noflo-dom/components/ReadHtml.js", "dataflow-noflo/deps/noflo-dom/components/ReadHtml.js");
require.alias("noflo-noflo-dom/components/WriteHtml.js", "dataflow-noflo/deps/noflo-dom/components/WriteHtml.js");
require.alias("noflo-noflo-dom/components/RemoveClass.js", "dataflow-noflo/deps/noflo-dom/components/RemoveClass.js");
require.alias("noflo-noflo-dom/index.js", "dataflow-noflo/deps/noflo-dom/index.js");
require.alias("noflo-noflo-dom/index.js", "noflo-dom/index.js");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-dom/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-dom/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-dom/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-dom/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-dom/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-dom/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-dom/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-dom/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-dom/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-dom/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-dom/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-dom/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");

require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");

require.alias("noflo-noflo-css/components/MoveElement.js", "dataflow-noflo/deps/noflo-css/components/MoveElement.js");
require.alias("noflo-noflo-css/components/RotateElement.js", "dataflow-noflo/deps/noflo-css/components/RotateElement.js");
require.alias("noflo-noflo-css/index.js", "dataflow-noflo/deps/noflo-css/index.js");
require.alias("noflo-noflo-css/index.js", "noflo-css/index.js");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-css/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-css/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-css/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-css/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-css/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-css/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-css/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-css/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-css/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-css/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-css/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-css/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");

require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");

require.alias("noflo-noflo-interaction/components/ListenDrag.js", "dataflow-noflo/deps/noflo-interaction/components/ListenDrag.js");
require.alias("noflo-noflo-interaction/components/ListenKeyboard.js", "dataflow-noflo/deps/noflo-interaction/components/ListenKeyboard.js");
require.alias("noflo-noflo-interaction/components/ListenMouse.js", "dataflow-noflo/deps/noflo-interaction/components/ListenMouse.js");
require.alias("noflo-noflo-interaction/components/ListenScroll.js", "dataflow-noflo/deps/noflo-interaction/components/ListenScroll.js");
require.alias("noflo-noflo-interaction/components/ListenTouch.js", "dataflow-noflo/deps/noflo-interaction/components/ListenTouch.js");
require.alias("noflo-noflo-interaction/index.js", "dataflow-noflo/deps/noflo-interaction/index.js");
require.alias("noflo-noflo-interaction/index.js", "noflo-interaction/index.js");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-interaction/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-interaction/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-interaction/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-interaction/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-interaction/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-interaction/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-interaction/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-interaction/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-interaction/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-interaction/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-interaction/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-interaction/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");

require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");

require.alias("noflo-noflo-physics/components/Spring.js", "dataflow-noflo/deps/noflo-physics/components/Spring.js");
require.alias("noflo-noflo-physics/index.js", "dataflow-noflo/deps/noflo-physics/index.js");
require.alias("noflo-noflo-physics/index.js", "noflo-physics/index.js");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-physics/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-physics/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-physics/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-physics/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-physics/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-physics/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-physics/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-physics/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-physics/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-physics/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-physics/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-physics/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");

require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");

require.alias("noflo-noflo-math/components/Add.js", "dataflow-noflo/deps/noflo-math/components/Add.js");
require.alias("noflo-noflo-math/components/Subtract.js", "dataflow-noflo/deps/noflo-math/components/Subtract.js");
require.alias("noflo-noflo-math/components/Multiply.js", "dataflow-noflo/deps/noflo-math/components/Multiply.js");
require.alias("noflo-noflo-math/components/Divide.js", "dataflow-noflo/deps/noflo-math/components/Divide.js");
require.alias("noflo-noflo-math/components/CountSum.js", "dataflow-noflo/deps/noflo-math/components/CountSum.js");
require.alias("noflo-noflo-math/index.js", "dataflow-noflo/deps/noflo-math/index.js");
require.alias("noflo-noflo-math/index.js", "noflo-math/index.js");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-math/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-math/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-math/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-math/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-math/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-math/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-math/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-math/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-math/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-math/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-math/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-math/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");

require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");

require.alias("d4tocchini-noflo-draggabilly/components/Draggabilly.js", "dataflow-noflo/deps/noflo-draggabilly/components/Draggabilly.js");
require.alias("d4tocchini-noflo-draggabilly/index.js", "dataflow-noflo/deps/noflo-draggabilly/index.js");
require.alias("d4tocchini-noflo-draggabilly/index.js", "noflo-draggabilly/index.js");
require.alias("noflo-noflo/src/lib/Graph.js", "d4tocchini-noflo-draggabilly/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "d4tocchini-noflo-draggabilly/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "d4tocchini-noflo-draggabilly/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "d4tocchini-noflo-draggabilly/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "d4tocchini-noflo-draggabilly/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "d4tocchini-noflo-draggabilly/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "d4tocchini-noflo-draggabilly/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "d4tocchini-noflo-draggabilly/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "d4tocchini-noflo-draggabilly/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "d4tocchini-noflo-draggabilly/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "d4tocchini-noflo-draggabilly/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "d4tocchini-noflo-draggabilly/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");

require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");

require.alias("dataflow-noflo/src/dataflow-noflo.js", "dataflow-noflo/index.js");


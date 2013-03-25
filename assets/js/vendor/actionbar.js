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
      overflow: null
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
      actions: null
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
        this.$control.append(Backbone.$('<i class="control-up icon-chevron-left"></i>'));
      }
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

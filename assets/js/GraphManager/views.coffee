#= require ../vendor/actionbar

window.noflo = {} unless window.noflo
window.noflo.GraphManager = {} unless window.noflo.GraphManager

views = window.noflo.GraphManager.views = {}

class views.Project extends Backbone.View
  app: null
  template: '#Project'
  tagName: 'div'
  className: 'container'
  actionBar: null

  initialize: (options) ->
    @app = options?.app
    @listenTo @model, 'change', @render
    @listenTo @model.get('graphs'), 'reset', @render
    @prepareActionBar()
    @

  prepareActionBar: ->
    @actionBar = new ActionBar
      control:
        icon: 'noflo'
        label: @model.get 'name'

  render: ->
    jQuery('body').removeClass 'grapheditor'
    template = jQuery(@template).html()

    projectData = @model.toJSON()
    projectData.description = '' unless projectData.description
    projectData.graphCount = @model.get('graphs').length
    projectData.nodeCount = @model.get('graphs').reduce (nodes, graph) ->
      nodes += graph.get 'nodeCount'
    , 0
    projectData.totalComponents = @model.get('components').length
    projectData.componentCount = @model.get('components').where({ project: @model.get('name') }).length
    projectData.externalComponents = projectData.totalComponents - projectData.componentCount

    @$el.html _.template template, projectData

    @renderGraphs()
    @renderComponents()
    @actionBar.show()
    @

  renderGraphs: ->
    view = new views.GraphList
      el: jQuery '.graphs', @el
      collection: @model.get 'graphs'
    view.render()

  renderComponents: ->
    view = new views.ComponentList
      el: jQuery '.components', @el
      collection: @model.get 'components'
      project: @model
    view.render()

class views.GraphList extends Backbone.View
  views: {}

  initialize: (options) ->
    @app = options.app
    @collection = options.collection
    @listenTo @collection, 'add', @addGraph
    @listenTo @collection, 'remove', @removeGraph
    @listenTo @collection, 'reset', @render

  render: ->
    @$el.empty()
    @collection.each @addGraph, @

  addGraph: (graph) ->
    view = new views.GraphListItem
      model: graph
      app: @app
    @views[graph.cid] = view
    @$el.append view.render().el

  removeGraph: (graph) ->
    return unless @views[graph.cid]
    @views[graph.cid].$el.remove()
    delete @views[graph.cid]

class views.GraphListItem extends Backbone.View
  app: null
  template: '#GraphListItem'
  tagName: 'li'
  className: 'span3'

  events:
    'click': 'editClicked'

  initialize: (options) ->
    @app = options?.app

  editClicked: ->
    @app.navigate "#graph/#{@model.id}", true

  render: ->
    template = jQuery(@template).html()

    graphData = @model.toJSON()
    graphData.name = "graph #{@model.id}" unless graphData.name

    @$el.html _.template template, graphData
    @

class views.ComponentList extends Backbone.View
  views: {}

  initialize: (options) ->
    @app = options.app
    @collection = options.collection
    @project = options.project
    @listenTo @collection, 'add', @addComponent
    @listenTo @collection, 'remove', @removeComponent
    @listenTo @collection, 'reset', @render

  render: ->
    @$el.empty()
    @collection.each @addComponent, @

  addComponent: (component) ->
    return unless component.get('project') is @project.get('name')
    view = new views.ComponentListItem
      model: component
      app: @app
    @views[component.cid] = view
    @$el.append view.render().el

  removeComponent: (component) ->
    return unless @views[component.cid]
    @views[component.cid].$el.remove()
    delete @views[component.cid]

class views.ComponentListItem extends Backbone.View
  app: null
  template: '#ComponentListItem'
  tagName: 'li'
  className: 'span3'

  events:
    'click': 'editClicked'

  initialize: (options) ->
    @app = options?.app

  editClicked: ->
    @app.navigate "#component/#{@model.id}", true

  render: ->
    template = jQuery(@template).html()

    graphData = @model.toJSON()
    graphData.name = "graph #{@model.id}" unless graphData.name

    @$el.html _.template template, graphData
    @

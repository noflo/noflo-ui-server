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
    _.extend projectData, @countStats()

    @$el.html _.template template, projectData

    @renderGraphs()
    @renderComponents()
    @actionBar.show()
    @

  countStats: ->
    stats =
      graphCount: @model.get('graphs').length
      nodeCount: @model.get('graphs').reduce (nodes, graph) ->
        nodes += graph.get 'nodeCount'
      , 0
      totalComponents: @model.get('components').where(
        subgraph: false
      ).length
      componentCount: @model.get('components').where(
        project: @model.get('name')
        subgraph: false
      ).length

    stats.externalComponents = stats.totalComponents - stats.componentCount
    stats

  renderGraphs: ->
    view = new views.GraphList
      el: jQuery '.graphs', @el
      collection: @model.get 'graphs'
      app: @app
    view.render()

  renderComponents: ->
    view = new views.ComponentList
      el: jQuery '.components', @el
      collection: @model.get 'components'
      project: @model
      app: @app
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
    view.drawCanvas()

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

  drawCanvas: ->
    @model.get('nodes').fetch
      success: =>
        canvas = jQuery('canvas', this.el).get 0
        scale = 0.10
        context = canvas.getContext '2d'
        context.fillStyle = "33B5E5"
        @model.get('nodes').each (node) ->
          top = 0
          left = 0
          if node.has 'display'
            top = node.get('display').y * scale
            left = node.get('display').x * scale
          context.fillRect top, left, 8, 4

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
    return if component.get('subgraph')
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

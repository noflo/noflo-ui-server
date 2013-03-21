#= require ../vendor/actionbar

window.noflo = {} unless window.noflo
window.noflo.GraphManager = {} unless window.noflo.GraphManager

views = window.noflo.GraphManager.views = {}

class views.GraphList extends Backbone.View
  app: null
  template: '#GraphList'
  tagName: 'div'
  className: 'container'
  actionBar: null

  initialize: (options) ->
    @app = options?.app
    @collection = options?.collection
    @listenTo @model, 'change', @render
    @listenTo @collection, 'reset add remove', @renderItems
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

    @$el.html _.template template, projectData
    @renderItems()
    @actionBar.show()
    @

  renderItems: ->
    @collection.each @renderItem, @

  renderItem: (graph) ->
    container = jQuery '.graphs', @el
    view = new views.GraphListItem
      model: graph
      app: @app
    container.append view.render().el

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


window.noflo = {} unless window.noflo
window.noflo.GraphManager = {} unless window.noflo.GraphManager

views = window.noflo.GraphManager.views = {}

class views.GraphList extends Backbone.View
  app: null
  template: '#GraphList'
  tagName: 'div'
  className: 'container'

  initialize: (options) ->
    @app = options?.app
    @collection = options?.collection
    _.bindAll @, 'renderItems'
    @collection.bind 'reset add remove', @renderItems
    @

  render: ->
    template = jQuery(@template).html()
    @$el.html template
    @renderItems()
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
  className: 'span4'

  events:
    'click button.edit': 'editClicked'

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


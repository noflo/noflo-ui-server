#= require views

views = window.noflo.GraphManager.views

class window.noflo.GraphManager.Router extends Backbone.Router
  graphs: null
  root: null

  routes:
    '': 'index'

  initialize: (options) ->
    @graphs = options.graphs
    @root = options.root

  index: ->
    graphsView = new views.GraphList
      app: @
      collection: @graphs
    @root.html graphsView.render().el

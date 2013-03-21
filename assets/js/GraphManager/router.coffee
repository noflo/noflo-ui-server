#= require views

views = window.noflo.GraphManager.views

class window.noflo.GraphManager.Router extends Backbone.Router
  project: null
  root: null

  routes:
    '': 'index'

  initialize: (options) ->
    @project = options.project
    @root = options.root

  index: ->
    graphsView = new views.GraphList
      app: @
      model: @project
      collection: @project.get 'graphs'
    @root.html graphsView.render().el

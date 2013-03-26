#= require views

views = window.noflo.GraphManager.views

class window.noflo.GraphManager.Router extends Backbone.Router
  project: null
  root: null
  reset: ->

  routes:
    '': 'index'

  initialize: (options) ->
    @project = options.project
    @root = options.root
    @reset = options.reset

  index: ->
    @reset()
    show = _.after 2, =>
      graphsView = new views.Project
        app: @
        model: @project
      @root.html graphsView.render().el
    @project.get('graphs').fetch success: show
    @project.get('components').fetch success: show

#= require views

views = window.noflo.GraphManager.views

class window.noflo.GraphManager.Router extends Backbone.Router
  project: null
  root: null
  actionBar: null
  contextBar: null

  routes:
    '': 'index'

  initialize: ({@project, @root, @actionBar, @contextBar}) ->

  index: ->
    show = _.after 2, =>
      view = new views.Project
        model: @project
        router: @
        actionBar: @actionBar
        contextBar: @contextBar
      @root.html view.render().el
    @project.get('graphs').fetch success: show
    @project.get('components').fetch success: show

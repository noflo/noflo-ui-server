#= require vendor/jquery
#= require vendor/underscore
#= require vendor/backbone
#= require vendor/bootstrap
#= require models
#= require GraphManager/router
#= require GraphEditor/router
#= require CodeEditor/router

window.noflo = {} unless window.noflo

jQuery(document).ready ->
  setup =
    root: jQuery '#noflo'
    actionBar: new ActionBar
      control:
        label: ''
        icon: 'noflo'
    contextBar: new ContextBar

  projects = new window.noflo.models.Projects
  projects.fetch
    success: ->
      setup.project = projects.at 0

      # Configure modules
      manager = new window.noflo.GraphManager.Router setup
      graphEditor = new window.noflo.GraphEditor.Router setup
      codeEditor = new window.noflo.CodeEditor.Router setup

      # Start routing
      do Backbone.history.start

      # Display ActionBar
      setup.actionBar.show()

    error: ->
      message = 'Failed to fetch projects'
      setup.root.html "<div>#{message}</div>"

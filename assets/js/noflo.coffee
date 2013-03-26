#= require vendor/jquery
#= require vendor/underscore
#= require vendor/backbone
#= require vendor/bootstrap
#= require models
#= require GraphManager/router
#= require GraphEditor/router

window.noflo = {} unless window.noflo

jQuery(document).ready ->
  rootElement = jQuery '#noflo'

  reset = ->
    # Clear toolbars when route changes
    jQuery('.actionbar').remove()
    jQuery('.contextbar').remove()

  projects = new window.noflo.models.Projects
  projects.fetch
    success: ->
      project = projects.at 0
      manager = new window.noflo.GraphManager.Router
        project: project
        root: rootElement
        reset: reset
      editor = new window.noflo.GraphEditor.Router
        project: project
        root: rootElement
        reset: reset
      do Backbone.history.start
    error: ->
      jQuery('#noflo').empty().append jQuery('<div>Failed to fetch projects</div>')

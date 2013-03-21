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
  projects = new window.noflo.models.Projects
  projects.fetch
    success: ->
      project = projects.at 0
      graphs = project.get 'graphs'
      graphs.fetch
        success: ->
          manager = new window.noflo.GraphManager.Router
            project: project
            graphs: graphs
            root: rootElement
          editor = new window.noflo.GraphEditor.Router
            project: project
            graphs: graphs
            root: rootElement
          do Backbone.history.start
        error: ->
          jQuery('#noflo').empty().append jQuery('<div>Failed to fetch graphs</div>')
    error: ->
      jQuery('#noflo').empty().append jQuery('<div>Failed to fetch projects</div>')

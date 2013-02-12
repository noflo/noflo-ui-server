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

  graphs = new window.noflo.models.Graphs
  graphs.fetch
    success: ->
      manager = new window.noflo.GraphManager.Router
        graphs: graphs
        root: rootElement
      editor = new window.noflo.GraphEditor.Router
        graphs: graphs
        root: rootElement
      do Backbone.history.start
    error: ->
      jQuery('#noflo').empty().append jQuery('<div>Failed to fetch networks</div>')

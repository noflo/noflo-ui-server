#= require vendor/jquery
#= require vendor/jquery-ui
#= require vendor/jquery.ui.touch-punch
#= require vendor/jsplumb
#= require vendor/underscore
#= require vendor/backbone
#= require vendor/bootstrap
#= require models
#= require views
#= require router

jQuery(document).ready ->
  jsPlumb.setRenderMode jsPlumb.CANVAS

  networks = new window.noflo.models.Networks
  networks.fetch
    success: ->
      app = new window.noflo.Router
        networks: networks
      do Backbone.history.start
    error: ->
      jQuery('#noflo').empty().append jQuery('<div>Failed to fetch networks</div>')

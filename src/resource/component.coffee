{_} = require 'underscore'

prepareComponent = (component, instance, callback) ->
  unless instance.isReady()
    console.log "WAIT #{component}"
    instance.once 'ready', ->
      console.log "READY #{component}"
      prepareComponent component, instance, callback
    return

  clean =
    name: component
    description: instance.description
  clean.inPorts = _.keys instance.inPorts if instance.inPorts
  clean.outPorts = _.keys instance.outPorts if instance.outPorts
  callback clean

exports.index = (req, res) ->
  req.network.loader.listComponents (components) ->
    clean = []
    todo = _.keys(components).length
    _.each components, (path, component) ->
      req.network.loader.load component, (instance) ->
        prepareComponent component, instance, (cleaned) ->
          clean.push cleaned
          todo--
          res.send clean if todo is 0

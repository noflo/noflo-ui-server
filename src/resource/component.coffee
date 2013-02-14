fs = require 'fs'
{_} = require 'underscore'

prepareComponent = (component, instance, callback) ->
  unless instance.isReady()
    instance.once 'ready', ->
      prepareComponent component, instance, callback
    return

  clean =
    id: component
    name: component
    description: instance.description
  clean.inPorts = _.keys instance.inPorts if instance.inPorts
  clean.outPorts = _.keys instance.outPorts if instance.outPorts
  callback null, clean

exports.index = (req, res) ->
  req.componentLoader.listComponents (components) ->
    clean = []
    sendComponents = _.after _.keys(components).length, ->
      res.send clean
    _.each components, (path, component) ->
      req.componentLoader.load component, (instance) ->
        prepareComponent component, instance, (err, cleaned) ->
          clean.push cleaned
          sendComponents()

exports.load = (req, id, callback) ->
  req.componentLoader.listComponents (components) ->
    return callback 'not found', null unless components[id]
    req.componentLoader.load id, (instance) ->
      prepareComponent id, instance, callback

exports.show = (req, res) ->
  req.componentLoader.listComponents (components) ->
    return res.send 404 unless components[req.component.id]
    fs.readFile components[req.component.id], 'utf-8', (err, code) ->
      return res.send 500 if err
      req.component.code = code
      res.send req.component

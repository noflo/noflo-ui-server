noflo = require 'noflo'
{_} = require 'underscore'

prepareNode = (node, loader, callback) ->
  loader.load node.component, (instance) ->
    unless instance.isReady()
      instance.once 'ready', ->
        cleanNode node, instance, callback
      return
    cleanNode node, instance, callback

cleanNode = (node, instance, callback) ->
  node.inPorts = []
  node.outPorts = []
  for name, port of instance.inPorts
    node.inPorts.push preparePort port, name
  for name, port of instance.outPorts
    node.outPorts.push preparePort port, name

  # TODO: Use stringex to handle all necessary replacements
  node.cleanId = node.id.replace ' ', '_'
  callback null, node

preparePort = (port, name) ->
  cleanPort =
    name: name
    type: "single"
  if port instanceof noflo.ArrayPort
    cleanPort.type = "array"
  cleanPort

exports.load = (req, id, callback) ->
  for node in req.graph.nodes
    continue unless node.id is id
    prepareNode node, req.componentLoader, callback
  
exports.index = (req, res) ->
  nodes = []
  todo = req.graph.nodes.length
  return res.send nodes if todo.length is 0
  _.each req.graph.nodes, (node) ->
    prepareNode node, req.componentLoader, (err, clean) ->
      todo--
      nodes.push clean
      return if todo
      res.send nodes

exports.create = (req, res) ->
  unless req.body.component
    return res.send "Missing component definition", 422
  req.body.id = req.body.component unless req.body.id

  node = req.graph.addNode req.body.id, req.body.component, req.body.display
  prepareNode node, req.componentLoader, (err, clean) ->
    res.send clean

exports.show = (req, res) ->
  prepareNode req.node, req.componentLoader, (err, clean) ->
    res.send clean

exports.update = (req, res) ->
  unless req.body.display
    return res.send "Missing display settings", 422
  req.node.display = req.body.display
  prepareNode req.node, req.componentLoader, (err, clean) ->
    res.send clean

exports.destroy = (req, res) ->
  req.graph.removeNode req.node.id
  prepareNode req.node, req.componentLoader, (err, clean) ->
    res.send clean

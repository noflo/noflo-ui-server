noflo = require 'noflo'

prepareNode = (node, network) ->
  process = network.getNode node.id

  node.subgraph = process.component.isSubgraph()

  node.inPorts = []
  node.outPorts = []
  for name, port of process.component.inPorts
    node.inPorts.push preparePort port, name
  for name, port of process.component.outPorts
    node.outPorts.push preparePort port, name

  # TODO: Use stringex to handle all necessary replacements
  node.cleanId = node.id.replace ' ', '_'
  node

preparePort = (port, name) ->
  cleanPort =
    name: name
    type: "single"
  if port instanceof noflo.ArrayPort
    cleanPort.type = "array"
  cleanPort

exports.load = (req, id, callback) ->
  for node in req.network.graph.nodes
    return callback null, node if node.id is id
  return callback 'not found', null
  
exports.index = (req, res) ->
  nodes = []
  nodes.push prepareNode node, req.network for node in req.network.graph.nodes
  res.send nodes

exports.create = (req, res) ->
  unless req.body.component
    return res.send "Missing component definition", 422
  req.body.id = req.body.component unless req.body.id

  req.network.graph.addNode req.body.id, req.body.component, req.body.display
  res.header 'Location', "/network/#{req.network.id}/node/#{req.body.id}"
  res.send null, 201

exports.show = (req, res) ->
  res.send prepareNode req.node, req.network

exports.update = (req, res) ->
  unless req.body.display
    return res.send "Missing display settings", 422
  req.node.display = req.body.display
  res.send prepareNode req.node, req.network

exports.destroy = (req, res) ->
  req.network.graph.removeNode req.node.id
  res.send prepareNode req.node, req.network

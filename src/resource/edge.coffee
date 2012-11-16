getEdges = (network) ->
  network.graph.edges.concat network.graph.initializers

prepareEdge = (edge, index) ->
  cleanEdge =
    id: index + 1
    to: edge.to
    from: edge.from
  cleanEdge.to.cleanNode = edge.to.node.replace " ", "_"
  if edge.from.node
    cleanEdge.from.cleanNode = edge.from.node.replace " ", "_"
  cleanEdge

exports.load = (req, id, callback) ->
  for edge, index in getEdges req.network
    continue unless index is parseInt id
    edge.id = index
    return callback null, edge
  return callback 'not found', null
  
exports.index = (req, res) ->
  edges = []
  edges.push prepareEdge edge, index for edge, index in getEdges req.network
  res.send edges

exports.create = (req, res) ->
  unless req.body.id and req.body.component
    return res.send "Missing ID or component definition", 422

  req.network.graph.addEdge req.body.id, req.body.component, req.body.display
  res.header 'Location', "/network/#{req.network.id}/edge/#{req.body.id}"
  res.send null, 201

exports.show = (req, res) ->
  res.send prepareEdge req.edge, req.edge.id

exports.update = (req, res) ->
  unless req.body.display
    return res.send "Missing display settings", 422
  req.edge.display = req.body.display
  res.send prepareEdge req.edge

exports.destroy = (req, res) ->
  req.network.graph.removeEdge req.edge.id
  res.send prepareEdge req.edge

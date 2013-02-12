getEdges = (graph) ->
  graph.edges.concat graph.initializers

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
  for edge, index in getEdges req.graph
    continue unless index + 1 is parseInt id
    edge.id = index
    return callback null, edge
  return callback 'not found', null
  
exports.index = (req, res) ->
  edges = []
  edges.push prepareEdge edge, index for edge, index in getEdges req.graph
  res.send edges

exports.create = (req, res) ->
  edge = req.graph.addEdge req.body.from.node, req.body.from.port, req.body.to.node, req.body.to.port
  res.send prepareEdge edge, req.graph.edges.length - 1

exports.show = (req, res) ->
  res.send prepareEdge req.edge, req.edge.id

exports.update = (req, res) ->
  unless req.body.display
    return res.send "Missing display settings", 422
  req.edge.display = req.body.display
  res.send prepareEdge req.edge

exports.destroy = (req, res) ->
  req.graph.removeEdge req.edge.to.node, req.edge.to.port
  res.send prepareEdge req.edge

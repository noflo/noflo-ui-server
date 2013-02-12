prepareGraph = (graph) ->
  clean = graph.toJSON()
  clean.id = graph.id
  clean.name = graph.id
  clean

exports.load = (req, id, callback) ->
  for graph in req.graphs
    continue unless graph.id is id
    return callback null, graph
  return callback 'not found', null
  
exports.index = (req, res) ->
  clean = []
  for graph in req.graphs
    clean.push prepareGraph graph
  res.send clean

exports.create = (req, res) ->
  res.send 404

exports.show = (req, res) ->
  res.send prepareGraph req.graph

exports.update = (req, res) ->
  res.send 404

exports.destroy = (req, res) ->
  res.send 404

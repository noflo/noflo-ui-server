prepareNetwork = (network, id) ->
  clean =
    id: id
    name: network.graph.name
    started: network.startupDate
  clean

exports.load = (req, id, callback) ->
  for network, netId in req.networks
    continue unless netId is parseInt id
    network.id = netId
    return callback null, network
  return callback 'not found', null
  
exports.index = (req, res) ->
  networks = []
  networks.push prepareNetwork network, id for network, id in req.networks
  res.send networks

exports.create = (req, res) ->
  res.send 404

exports.show = (req, res) ->
  res.send prepareNetwork req.network, req.network.id

exports.update = (req, res) ->
  res.send 404

exports.destroy = (req, res) ->
  res.send 404

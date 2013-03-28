noflo = require 'noflo'
{_} = require 'underscore'

prepareGraph = (graph, callback) ->
  clean = graph.toJSON()

  project = 'noflo'
  graphName = graph.id
  nameParts = graphName.split '/'
  if nameParts.length is 2
    project = nameParts[0]
    graphName = nameParts[1]

  clean.id = graph.id
  clean.name = graphName
  clean.project = project
  clean.nodeCount = graph.nodes.length
  clean

exports.load = (req, id, callback) ->
  req.componentLoader.listComponents (components) ->
    return callback 'not found', null unless components[id]
    unless req.componentLoader.isGraph components[id]
      return callback 'not a graph', null

    noflo.graph.loadFile components[id], (graph) ->
      graph.id = id
      callback null, graph

exports.index = (req, res) ->
  req.componentLoader.listComponents (components) ->
    graphs = {}
    clean = []
    for name, gPath of components
      continue unless req.componentLoader.isGraph gPath
      graphs[name] = gPath

    done = _.after _.keys(graphs).length, ->
      res.send clean

    _.each graphs, (gPath, name) ->
      noflo.graph.loadFile gPath, (graph) ->
        graph.id = name
        clean.push prepareGraph graph
        done()

exports.create = (req, res) ->
  res.send 404

exports.show = (req, res) ->
  res.send prepareGraph req.graph

noflo = require 'noflo'
{_} = require 'underscore'
fs = require 'fs'
path = require 'path'

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
  unless req.body.name
    return res.send "Missing graph name", 422

  graphDir = "#{req.componentLoader.baseDir}/graphs"
  sourceFileNoExt = "#{graphDir}/#{req.body.name}"
  sourceFile = "#{sourceFileNoExt}.json"
  localSourceFile = "./graphs/#{req.body.name}.json"
  fs.exists sourceFile, (exists) ->
    return res.send "Graph already exists", 422 if exists

    graph = new noflo.Graph
    graph.save sourceFileNoExt, ->

      req.componentLoader.registerGraph req.project.name,
        req.body.name, localSourceFile, (err) ->
          return res.send err, 500 if err
          res.send
            id: "#{req.body.project}/#{req.body.name}"
            name: req.body.name
            project: req.body.project
            nodeCount: 0

exports.show = (req, res) ->
  res.send req.graph.toJSON()

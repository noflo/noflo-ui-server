express = require 'express'
assets = require 'connect-assets'
resource = require 'express-resource'
noflo = require 'noflo'
path = require 'path'

exports.createServer = (projectDir, callback) ->
  app = express()

  app.set 'view engine', 'jade'

  #app.use express.logger()
  app.use express.bodyParser()

  componentLoader = new noflo.ComponentLoader projectDir

  # Expose networks to resources
  app.graphs = []
  app.use (req, res, next) ->
    req.graphs = app.graphs
    req.componentLoader = componentLoader
    next()

  # Asset pipeline for CoffeeScript and other files
  app.use assets
    src: "#{__dirname}/../assets"
  app.use '/img', express.static "#{__dirname}/../assets/img"

  app.get '/', (req, res) ->
    res.render 'index', {}, (err, html) ->
      console.log err if err
      res.send html

  graphs = app.resource 'graph', require './resource/graph'
  nodes = app.resource 'node', require './resource/node'
  graphs.add nodes
  edges = app.resource 'edge', require './resource/edge'
  graphs.add edges
  components = app.resource 'component', require './resource/component'
  graphs.add components

  # Add saving capability
  graphs.map 'post', 'commit', (req, res) ->
    dir = path.dirname req.graph.fileName
    name = path.basename req.graph.fileName, path.extname req.graph.fileName
    req.graph.save "#{dir}/#{name}", (file) ->
      res.end '200'

  componentLoader.listComponents (components) ->
    callback null, app

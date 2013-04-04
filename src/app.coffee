express = require 'express'
assets = require 'connect-assets'
resource = require 'express-resource'
noflo = require 'noflo'
path = require 'path'
fs = require 'fs'
tester = require './test'

exports.createServer = (projectData, callback) ->
  app = express()

  app.set 'view engine', 'jade'

  app.use express.logger()
  app.use express.bodyParser()

  componentLoader = new noflo.ComponentLoader projectData.localDir

  templateFile = path.resolve __dirname, '../templates/SyncComponent.coffee'
  componentTemplate = fs.readFileSync templateFile, 'utf-8'

  # Expose networks to resources
  app.use (req, res, next) ->
    req.componentLoader = componentLoader
    req.project = projectData
    req.componentTemplate = componentTemplate
    next()

  # Asset pipeline for CoffeeScript and other files
  app.use assets
    src: "#{__dirname}/../assets"
  app.use '/img', express.static "#{__dirname}/../assets/img"

  app.get '/', (req, res) ->
    res.render 'index', {}, (err, html) ->
      console.log err if err
      res.send html

  projects = app.resource 'project', require './resource/project'
  components = app.resource 'component', require './resource/component'
  projects.add components
  graphs = app.resource 'graph', require './resource/graph'
  projects.add graphs
  nodes = app.resource 'node', require './resource/node'
  graphs.add nodes
  edges = app.resource 'edge', require './resource/edge'
  graphs.add edges

  # Add saving capability
  graphs.map 'post', 'commit', (req, res) ->
    dir = path.dirname req.graph.fileName
    name = path.basename req.graph.fileName, path.extname req.graph.fileName
    req.graph.save "#{dir}/#{name}", (file) ->
      res.end '200'

  # Ability to run tests
  components.map 'get', 'test', (req, res) ->
    tester.getPath req.componentLoader, req.component.id, (testPath) ->
      return res.send 404 unless testPath
      tester.runTests req.componentLoader, testPath, (results) ->
        res.send results

  componentLoader.listComponents (components) ->
    callback null, app

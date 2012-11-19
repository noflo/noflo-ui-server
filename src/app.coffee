express = require 'express'
assets = require 'connect-assets'
resource = require 'express-resource'

exports.createServer = (callback) ->
  app = express()

  app.set 'view engine', 'jade'

  #app.use express.logger()
  app.use express.bodyParser()

  # Expose networks to resources
  app.networks = []
  app.use (req, res, next) ->
    req.networks = app.networks
    next()

  # Asset pipeline for CoffeeScript and other files
  app.use assets
    src: "#{__dirname}/../assets"

  app.get '/', (req, res) ->
    res.render 'index', {}, (err, html) ->
      console.log err if err
      res.send html


  networks = app.resource 'network', require './resource/network'
  nodes = app.resource 'node', require './resource/node'
  networks.add nodes
  edges = app.resource 'edge', require './resource/edge'
  networks.add edges
  components = app.resource 'component', require './resource/component'
  networks.add components

  callback app

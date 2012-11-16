express = require 'express'
assets = require 'connect-assets'

exports.createServer = (callback) ->
  app = express()

  app.set 'view engine', 'jade'

  #app.use express.logger()
  app.use express.bodyParser()

  # Asset pipeline for CoffeeScript and other files
  app.use assets
    src: "#{__dirname}/../assets"

  app.get '/', (req, res) ->
    res.render 'index'
      body: "Hello, world!"
    , (err, html) ->
      console.log err if err
      res.send html

  app.networks = []
  routes = require './routes'
  routes.registerRoutes app

  callback app

#!/usr/bin/env coffee
noflo = require 'noflo'
app = require './src/app'
app.createServer (server) ->
  noflo.loadFile '/Users/bergie/Projects/the-grid/noflo-dataimporter/graphs/DataImporter.fbp', (network) ->
    server.networks.push network
    server.listen 3000

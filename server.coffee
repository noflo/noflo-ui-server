#!/usr/bin/env coffee
noflo = require 'noflo'
app = require './src/app'
app.createServer (server) ->
  noflo.loadFile '/home/bergie/Projects/noflo-yaml/examples/frontmatter.fbp', (network) ->
    server.networks.push network
    server.listen 3000

window.noflo = {} unless window.noflo
window.noflo.models = models = {}

class models.Network extends Backbone.Model
  defaults:
    nodes: null

  url: -> "/network/#{@id}"

  initialize: (attributes) ->
    attributes ?= {}
    attributes.nodes ?= []
    attributes.edges ?= []

  set: (attributes) ->
    if attributes.nodes
      attributes.nodes = new models.Nodes attributes.nodes,
        network: @
    if attributes.edges
      attributes.edges = new models.Edges attributes.edges,
        network: @
    Backbone.Model::set.call @, attributes

class models.Networks extends Backbone.Collection
  model: models.Network

  url: "/network"

class models.Node extends Backbone.Model
  defaults:
    component: ""
    inPorts: null
    outPorts: null
    display:
      x: null
      y: null

  initialize: (attributes) ->
    attributes ?= {}
    attributes.inPorts ?= []
    attributes.outPorts ?= []

  set: (attributes) ->
    if attributes.inPorts
      attributes.inPorts = new models.NodePorts attributes.inPorts,
        node: @
    if attributes.outPorts
      attributes.outPorts = new models.NodePorts attributes.outPorts,
        node: @
    Backbone.Model::set.call @, attributes

  url: -> "#{@collection.url()}/#{@id}"

class models.Nodes extends Backbone.Collection
  model: models.Node
  network: null

  initialize: (models, options) ->
    @network = options?.network

  url: -> "/network/#{@network.id}/node"

class models.Port extends Backbone.Model
  node: null

  defaults:
    type: ""
    name: ""
    data: null

class models.NodePorts extends Backbone.Collection
  model: models.Port
  node: null

  initialize: (models, options) ->
    @node = options?.node

class models.Edge extends Backbone.Model
  defaults:
    data: null
    from: null
    to: null

  url: -> "#{@collection.url()}/#{@id}"

class models.Edges extends Backbone.Collection
  model: models.Edge
  network: null

  initialize: (models, options) ->
    @network = options?.network

  url: -> "/network/#{@network.id}/edge"

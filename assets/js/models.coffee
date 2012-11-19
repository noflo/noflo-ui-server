window.noflo = {} unless window.noflo
window.noflo.models = models = {}

class models.Network extends Backbone.Model
  defaults:
    nodes: null

  url: -> "/network/#{@id}"

  initialize: (attributes) ->
    attributes ?= {}
    this.set 'nodes', new models.Nodes attributes.nodes,
      network: @
    this.set 'edges', new models.Edges attributes.edges,
      network: @
    this.set 'components', new models.Components attributes.components,
      network: @

class models.Networks extends Backbone.Collection
  model: models.Network

  url: "/network"

class models.Initial extends Backbone.Model

class models.Component extends Backbone.Model

class models.Components extends Backbone.Collection
  model: models.Component
  network: null

  initialize: (models, options) ->
    @network = options?.network

  url: -> "/network/#{@network.id}/component"

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

  url: ->
    return @collection.url() unless @id
    "#{@collection.url()}/#{@id}"

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

  url: ->
    return @collection.url() unless @id
    "#{@collection.url()}/#{@id}"

class models.Edges extends Backbone.Collection
  model: models.Edge
  network: null

  initialize: (models, options) ->
    @network = options?.network

  url: -> "/network/#{@network.id}/edge"

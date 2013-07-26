window.noflo = {} unless window.noflo
window.noflo.models = models = {}

class models.Project extends Backbone.Model
  url: -> "/project/#{@id}"

  initialize: (attributes) ->
    attributes ?= {}
    this.set 'components', new models.Components attributes.components,
      project: @
    this.set 'graphs', new models.Graphs attributes.graphs,
      project: @

class models.Projects extends Backbone.Collection
  model: models.Project
  url: '/project'

class models.Graph extends Backbone.Model
  defaults:
    nodes: null

  initialize: (attributes) ->
    this.set 'source', attributes
    attributes ?= {}
    this.set 'nodes', new models.Nodes attributes.nodes,
      graph: @
    this.set 'edges', new models.Edges attributes.edges,
      graph: @

  url: ->
    return @collection.url() unless @id
    "#{@collection.url()}/#{encodeURIComponent(@id)}"

class models.Graphs extends Backbone.Collection
  model: models.Graph
  project: null

  initialize: (models, options) ->
    @project = options?.project

  url: -> "/project/#{@project.id}/graph"

class models.Initial extends Backbone.Model

class models.Component extends Backbone.Model
  defaults:
    test: ''
    code: ''
    doc: ''
  url: ->
    return @collection.url() unless @id
    "#{@collection.url()}/#{encodeURIComponent(@id)}"

class models.Components extends Backbone.Collection
  model: models.Component
  project: null

  initialize: (models, options) ->
    @project = options?.project

  url: -> "/project/#{@project.id}/component"

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
  graph: null

  initialize: (models, options) ->
    @graph = options?.graph

  url: -> "#{@graph.url()}/node"

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
  graph: null

  initialize: (models, options) ->
    @graph = options?.graph

  url: -> "#{@graph.url()}/edge"

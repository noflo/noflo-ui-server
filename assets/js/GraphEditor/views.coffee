window.noflo = {} unless window.noflo
window.noflo.GraphEditor = {} unless window.noflo.GraphEditor

views = window.noflo.GraphEditor.views = {}

class views.Graph extends Backbone.View
  editor: null
  editorView: null
  template: '#Graph'
  router: null

  initialize: (options) ->
    @router = options.router

  render: ->
    template = jQuery(@template).html()
    graphData = @model.toJSON()
    graphData.name = "graph #{@model.id}" unless graphData.name
    @$el.html _.template template, graphData
    @

  initializeEditor: ->
    @editorView = new views.GraphEditor
      model: @model
      app: @router
    container = jQuery '.editor', @el
    container.html @editorView.render().el
    @editorView.activate()

class views.GraphEditor extends Backbone.View
  nodeViews: null
  edgeViews: null
  className: 'graph'
  popoverTemplate: '#NetworkPopover'

  events:
    'click button.addnode': 'addNode'
    'click': 'graphClicked'

  initialize: (options) ->
    @nodeViews = {}
    @edgeViews = []
    @app = options?.app
    @popover = null

    _.bindAll @, 'renderNodes', 'renderEdges', 'renderEdge'
    @model.get('nodes').bind 'reset', @renderNodes
    @model.get('edges').bind 'edges', @renderEdges
    @model.get('edges').bind 'add', @renderEdge

  removePopover: ->
    return unless @popover
    @popover.popover 'destroy'
    @popover.remove()
    @popover = null

  getPopover: (top, left) ->
    target = jQuery '<div></div>'
    target.css
      position: 'absolute'
      top: top
      left: left
    @$el.append target

    target.popover
      placement: 'bottom'
      html: true
      title: 'Select what to add'
      content: _.template jQuery(@popoverTemplate).html(), {}
    target.popover 'show'
    @popover = target

  graphClicked: (event) ->
    do @removePopover
    return unless event.target is @el
    y = event.pageY - @$el.offset().top
    x = event.pageX - @$el.offset().left
    @getPopover y, x

  addNode: ->
    x = @popover.css('top').replace 'px', ''
    y = @popover.css('left').replace 'px', ''
    @app.navigate "#network/#{@model.id}/add/#{x}/#{y}", true

  render: ->
    @$el.empty()

    @renderNodes()
    @renderEdges()
    # TODO: Render legends

    @

  renderNodes: ->
    @model.get('nodes').each @renderNode, @

  renderEdges: ->
    @model.get('edges').each (edge) ->
      @renderEdge edge
    , @

  activate: ->
    @initializePlumb()
    _.each @nodeViews, (view) ->
      view.activate()
    _.each @edgeViews, (view) ->
      view.activate()
    @bindPlumb()

  initializePlumb: ->
    # We need this for DnD
    document.onselectstart = -> false

    jsPlumb.Defaults.Connector = "StateMachine"
    jsPlumb.Defaults.PaintStyle =
      strokeStyle: "#33B5E5"
      outlineWidth: 1
      outlineColor: '#000000'
      lineWidth: 2
    jsPlumb.Defaults.DragOptions =
      cursor: "pointer"
      zIndex: 2000
    jsPlumb.Defaults.ConnectionOverlays = [
    ]
    jsPlumb.setRenderMode jsPlumb.SVG

  bindPlumb: ->
    jsPlumb.bind 'jsPlumbConnection', (info) =>
      newEdge =
        connection: info.connection
      for nodeId, nodeView of @nodeViews
        for port, portView of nodeView.outPorts
          continue unless portView.endPoint is info.sourceEndpoint
          newEdge.from =
            node: nodeId
            port: port
        for port, portView of nodeView.inPorts
          continue unless portView.endPoint is info.targetEndpoint
          newEdge.to =
            node: nodeId
            port: port
      return unless newEdge.to and newEdge.from
      @model.get('edges').create newEdge

    jsPlumb.bind 'jsPlumbConnectionDetached', (info) =>
      for edgeView in @edgeViews
        continue unless edgeView.connection is info.connection
        edgeView.model.destroy()

  renderNode: (node) ->
    view = new views.Node
      model: node
      networkView: @
    @$el.append view.render().el
    @nodeViews[node.id] = view

  renderEdge: (edge) ->
    view = new views.Edge
      model: edge
      networkView: @
    view.render()
    @edgeViews.push view

class views.AddNode extends Backbone.View
  tagName: 'ul'
  className: 'thumbnails'

  initialize: (options) ->
    @app = options?.app
    @collection = options?.collection
    @display = options?.display

  render: ->
    @$el.empty()
    @collection.each @renderComponent, @
    @

  renderComponent: (component) ->
    view = new views.AddNodeComponent
      model: component
      app: @app
      network: @model
      display: @display
    @$el.append view.render().el

class views.AddNodeComponent extends Backbone.View
  template: '#AddNodeComponent'
  tagName: 'li'
  className: 'span4'

  events:
    'click button.use': 'useClicked'

  initialize: (options) ->
    @app = options?.app
    @network = options?.network
    @display = options?.display

  useClicked: ->
    @network.get('nodes').create
      component: @model.get 'name'
      display: @display
    @app.navigate "#network/#{@network.id}", true

  render: ->
    template = jQuery(@template).html()
    @$el.html _.template template, @model.toJSON()
    @

class views.Node extends Backbone.View
  inAnchors: ["LeftMiddle", "TopLeft", "BottomLeft", "TopCenter"]
  outAnchors: ["RightMiddle", "BottomRight", "TopRight", "BottomCenter"]
  inPorts: null
  outPorts: null
  template: '#Node'
  tagName: 'div'
  className: 'process'

  initialize: (options) ->
    @inPorts = {}
    @outPorts = {}

  render: ->
    @$el.attr 'id', @model.get 'cleanId'

    @$el.addClass 'subgraph' if @model.get 'subgraph'

    if @model.has 'display'
      @$el.css
        top: @model.get('display').x
        left: @model.get('display').y

    template = jQuery(@template).html()

    templateData = @model.toJSON()
    templateData.id = templateData.cleanId unless templateData.id

    @$el.html _.template template, templateData

    @model.get('inPorts').each @renderInport, @
    @model.get('outPorts').each @renderOutport, @
    @

  renderInport: (port, index) ->
    view = new views.Port
      model: port
      inPort: true
      nodeView: @
      anchor: @inAnchors[index]
    view.render()
    @inPorts[port.get('name')] = view

  renderOutport: (port, index) ->
    view = new views.Port
      model: port
      inPort: false
      nodeView: @
      anchor: @outAnchors[index]
    view.render()
    @outPorts[port.get('name')] = view

  activate: ->
    @makeDraggable()
    _.each @inPorts, (view) ->
      view.activate()
    _.each @outPorts, (view) ->
      view.activate()

  saveModel: ->
    @model.save()

class views.Initial extends Backbone.View
  tagName: 'div'
  className: 'initial'

  render: ->
    @$el.html @model.get 'data'
    @renderOutport()
    @

  renderOutport: ->
    view = new views.Port
      model: new window.noflo.models.Port
      inPort: false
      nodeView: @
      anchor: "BottomCenter"
    view.render()
    @outEndpoint = view

  activate: ->
    @makeDraggable()
    @outEndpoint.activate()

  saveModel: ->

class views.Port extends Backbone.View
  endPoint: null
  inPort: false
  anchor: "LeftMiddle"

  portDefaults:
    endpoint: [
      'Dot'
      radius: 6
    ]
    paintStyle:
      fillStyle: '#ffffff'

  initialize: (options) ->
    @endPoint = null
    @nodeView = options?.nodeView
    @inPort = options?.inPort
    @anchor = options?.anchor

  render: -> @

  activate: ->
    portOptions =
      isSource: true
      isTarget: false
      maxConnections: 1
      anchor: @anchor
      overlays: [
        [
          "Label"
            location: [2.5,-0.5]
            label: @model.get('name')
        ]
      ]
    if @inPort
      portOptions.isSource = false
      portOptions.isTarget = true
      portOptions.overlays[0][1].location = [-1.5, -0.5]
    if @model.get('type') is 'array'
      portOptions.endpoint = [
        'Rectangle'
        readius: 6
      ]
      portOptions.maxConnections = -1
    @endPoint = jsPlumb.addEndpoint @nodeView.el, portOptions, @portDefaults

class views.Edge extends Backbone.View
  networkView: null
  connection: null

  initialize: (options) ->
    @connection = null
    @networkView = options?.networkView
    if @model.has 'connection'
      @connection = @model.get 'connection'
      @model.unset 'connection'

  render: ->
    @

  activate: ->
    return if @connection
    sourceDef = @model.get 'from'
    targetDef = @model.get 'to'

    if sourceDef.node
      source = @networkView.nodeViews[sourceDef.node].outPorts[sourceDef.port].endPoint
    else
      return
    target = @networkView.nodeViews[targetDef.node].inPorts[targetDef.port].endPoint
    @connection = jsPlumb.connect
      source: source
      target: target

views.DraggableMixin =
  makeDraggable: ->
    jsPlumb.draggable @el,
      stop: (event, data) => @dragStop data
    @

  dragStop: (data) ->
    @model.set
      display:
        x: data.offset.top
        y: data.offset.left
    @saveModel()

_.extend views.Node::, views.DraggableMixin
_.extend views.Initial::, views.DraggableMixin

#= require ../vendor/jquery-ui
#= require ../vendor/jquery.ui.touch-punch
#= require ../vendor/hammer.min
#= require ../vendor/dataflow-noflo

window.noflo = {} unless window.noflo
window.noflo.GraphEditor = {} unless window.noflo.GraphEditor

views = window.noflo.GraphEditor.views = {}

class views.Graph extends Backbone.View
  editor: null
  editorView: null
  template: '#Graph'
  router: null
  actionBar: null
  contextBar: null
  openNode: ->

  initialize: ({@router, @graphs, @actionBar, @contextBar, @openNode}) ->
    @prepareActionBar()

  prepareActionBar: ->
    control = @actionBar.get 'control'
    control.set 'label', @model.get 'name'
    control.set 'up', @handleUp

    actions = @actionBar.get 'actions'
    actions.reset [
      id: 'save'
      label: 'Save'
      icon: 'cloud-upload'
      action: @save
    ]
    @actionBar.hide()

  save: =>
    jQuery.post "#{@model.url()}/commit"

  handleUp: =>
    @router.navigate '', true

  render: ->
    jQuery('body').addClass 'grapheditor'
    template = jQuery(@template).html()
    graphData = @model.toJSON()
    graphData.name = "graph #{@model.id}" unless graphData.name
    @$el.html _.template template, graphData
    @

  initializeEditor: ->
    Dataflow = require('/meemoo-dataflow').Dataflow
    require('/dataflow-noflo')
    dataflow = new Dataflow
      appendTo: '.editor'
    NofloBase = Dataflow::node 'noflo-base'
    dataflow.plugins.noflo.loadComponents = (baseDir, ready) =>
      components = @router.project.get 'components'
      components.fetch
        success: ->
          components.each (component) ->
            parts = component.id.split '/'
            if parts.length is 2 and !dataflow.plugins.noflo.aliases[parts[1]]
              dataflow.plugins.noflo.aliases[parts[1]] = component.id
            newComponent = Dataflow::node component.id
            newComponent.Model = NofloBase.Model.extend
              defaults: ->
                defaults = NofloBase.Model::defaults.call this
                defaults.type = component.id
                defaults
              inputs: component.get('inPorts').map (port) ->
                id: port
                type: 'all'
              outputs: component.get('outPorts').map (port) ->
                id: port
                type: 'all'
            newComponent.View = NofloBase.View.extend()
          do ready

    noflo = require('noflo')
    noflo.graph.loadJSON this.model.get('source'), (g) ->
      window.graph = g
      dataflow.plugins.noflo.registerGraph g, dataflow

class views.AddGraph extends Backbone.View
  template: '#AddGraph'
  actionBar: null

  events:
    'click #save': 'save'
    'form submit': 'save'

  initialize: ({@router, @project, @actionBar}) ->
    @prepareActionBar()

  prepareActionBar: ->
    control = @actionBar.get 'control'
    control.set 'label', 'New graph'
    control.set 'up', @handleUp

    actions = @actionBar.get 'actions'
    actions.reset()

  handleUp: =>
    @router.navigate '', true

  save: (event) ->
    event.preventDefault()
    name = jQuery('input#name', @el).val()
    project = @project.get 'name'
    @project.get('graphs').create
      name: name
      project: project
    ,
      wait: true
      success: =>
        @router.navigate "#graph/#{project}/#{name}", true
      error: (e) -> alert e

  render: ->
    template = jQuery(@template).html()
    @$el.html _.template template,
      project: @project.get 'name'
    @

class views.GraphEditor extends Backbone.View
  nodeViews: null
  edgeViews: null
  jsPlumb: null
  className: 'graph'

  events:
    'click': 'graphClicked'

  initialize: ({@app}) ->
    @nodeViews = {}
    @edgeViews = []
    @app = options?.app
    @popover = null

    @listenTo @model.get('nodes'), 'reset', @renderNodes
    @listenTo @model.get('edges'), 'reset', @renderEdges

  render: ->
    @$el.empty()
    fragment = document.createDocumentFragment()
    @renderNodes fragment
    @renderEdges fragment
    # TODO: Render legends
    @$el.append fragment
    @

  renderNodes: (container) ->
    @model.get('nodes').each (node) ->
      @renderNode node, container
    , @

  renderEdges: (container) ->
    @model.get('edges').each (edge) ->
      @renderEdge edge, container
    , @

  renderNode: (node, container) ->
    view = new views.GraphNode
      model: node
      networkView: @
      openNode: @openNode
    if container
      container.appendChild view.render().el
    else
      @$el.append view.render().el

    @nodeViews[node.id] = view

  renderEdge: (edge) ->
    view = new views.GraphEdge
      model: edge
      networkView: @
    view.render()
    @edgeViews.push view

  activate: ->
    @initializePlumb()
    _.each @nodeViews, (view) ->
      view.activate @jsPlumb
    _.each @edgeViews, (view) ->
      view.activate @jsPlumb
    @bindPlumb()

  initializePlumb: ->
    # We need this for DnD
    document.onselectstart = -> false

    # FIXME: This global shouldn't be necessary
    jsPlumb.Defaults.PaintStyle =
      strokeStyle: "#33B5E5"
      outlineWidth: 1
      outlineColor: '#000000'
      lineWidth: 2
    jsPlumb.Defaults.Container = @$el

    @jsPlumb = jsPlumb.getInstance
      Connector: "StateMachine"
      PaintStyle:
        strokeStyle: "#33B5E5"
        outlineWidth: 1
        outlineColor: '#000000'
        lineWidth: 2
      DragOptions:
        cursor: "pointer"
        zIndex: 2000
    @jsPlumb.setRenderMode jsPlumb.SVG

  bindPlumb: ->
    @jsPlumb.bind 'jsPlumbConnection', (info) =>
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

    @jsPlumb.bind 'jsPlumbConnectionDetached', (info) =>
      for edgeView in @edgeViews
        continue unless edgeView.connection is info.connection
        edgeView.model.destroy()

class views.GraphNode extends Backbone.View
  inPorts: null
  outPorts: null
  template: '#GraphNode'
  tagName: 'div'
  className: 'process'
  jsPlumb: null

  events:
    'click': 'clicked'

  initialize: (options) ->
    @inPorts = {}
    @outPorts = {}
    @openNode = options.openNode

  clicked: (event) ->
    event.stopPropagation()
    return if @beingDragged
    @openNode @model

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
    templateData.component = '' if templateData.component is templateData.id

    @$el.html _.template template, templateData

    @$inPorts = jQuery '.inPorts', @el
    @$outPorts = jQuery '.outPorts', @el

    inContainer = document.createDocumentFragment()
    @renderInports inContainer
    @$inPorts.append inContainer
    outContainer = document.createDocumentFragment()
    @renderOutports outContainer
    @$outPorts.append outContainer
    @

  renderInports: (container) ->
    @model.get('inPorts').each (port) ->
      @renderInport port, container
    , @

  renderOutports: (container) ->
    @model.get('outPorts').each (port) ->
      @renderOutport port, container
    , @

  renderInport: (port, container) ->
    view = new views.GraphPort
      model: port
      inPort: true
      anchor: 'LeftMiddle'
      nodeView: @
    view.render()

    if container
      container.appendChild view.el
    else
      @$inPorts.append view.el

    @inPorts[port.get('name')] = view

  renderOutport: (port, container) ->
    view = new views.GraphPort
      model: port
      inPort: false
      anchor: 'RightMiddle'
      nodeView: @
    view.render()

    if container
      container.appendChild view.el
    else
      @$inPorts.append view.el

    @outPorts[port.get('name')] = view

  activate: (@jsPlumb) ->
    @makeDraggable @jsPlumb
    _.each @inPorts, (view) ->
      view.activate @jsPlumb
    _.each @outPorts, (view) ->
      view.activate @jsPlumb

  saveModel: ->
    @model.save()

class views.GraphPort extends Backbone.View
  endPoint: null
  inPort: false
  anchor: "LeftMiddle"
  jsPlumb: null
  tagName: 'li'

  portDefaults:
    endpoint: [
      'Dot'
      radius: 10
    ]
    paintStyle:
      fillStyle: '#ffffff'

  initialize: ({@inPort, @anchor}) ->
    @endPoint = null

  render: ->
    @$el.html @model.get 'name'
    @

  activate: (@jsPlumb) ->
    portOptions =
      isSource: true
      isTarget: false
      maxConnections: 1
      anchor: @anchor
    if @inPort
      portOptions.isSource = false
      portOptions.isTarget = true
    if @model.get('type') is 'array'
      portOptions.endpoint = [
        'Rectangle'
        readius: 6
      ]
      portOptions.maxConnections = -1
    @endPoint = @jsPlumb.addEndpoint @el, portOptions, @portDefaults

class views.GraphEdge extends Backbone.View
  networkView: null
  connection: null
  jsPlumb: null

  initialize: (options) ->
    @connection = null
    @networkView = options?.networkView
    if @model.has 'connection'
      @connection = @model.get 'connection'
      @model.unset 'connection'

  render: ->
    @

  activate: (@jsPlumb) ->
    return if @connection
    sourceDef = @model.get 'from'
    targetDef = @model.get 'to'

    if sourceDef.node
      outPorts = @networkView.nodeViews[sourceDef.node].outPorts
      source = outPorts[sourceDef.port].endPoint
    else
      return
    inPorts = @networkView.nodeViews[targetDef.node].inPorts
    target = inPorts[targetDef.port].endPoint
    @connection = @jsPlumb.connect
      source: source
      target: target

views.DraggableMixin =
  beingDragged: false

  makeDraggable: (@jsPlumb) ->
    @jsPlumb.draggable @el,
      start: (event, data) => @dragStart event, data
      stop: (event, data) => @dragStop event, data
    @

  dragStart: (event, data) ->
    @beingDragged = true

  dragStop: (event, data) ->
    @model.set
      display:
        x: data.offset.top
        y: data.offset.left
    @saveModel()

    setTimeout =>
      @beingDragged = false
    , 1

_.extend views.GraphNode::, views.DraggableMixin

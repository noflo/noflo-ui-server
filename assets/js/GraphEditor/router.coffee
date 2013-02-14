#= require ../vendor/jquery-ui
#= require ../vendor/jquery.ui.touch-punch
#= require ../vendor/jsplumb
#= require ../vendor/codemirror
#= require ../vendor/codemirror-coffeescript
#= require views

class window.noflo.GraphEditor.Router extends Backbone.Router
  graphs: null
  root: null
  panel: null
  editor: null

  routes:
    'graph/:network': 'graph'
    'graph/:network/node/:id': 'node'
    'graph/:network/component/:id': 'component'

  initialize: (options) ->
    @graphs = options.graphs
    @root = options.root
    @panel = jQuery '.panel', 'body'
    jsPlumb.setRenderMode jsPlumb.CANVAS

    Backbone.history.on 'route', =>
      @panel.hide()

  prepareGraph: (graph, callback) ->
    done = _.after 3, -> callback graph
    graph.get('nodes').fetch success: done
    graph.get('edges').fetch success: done
    graph.fetch success: done

  graph: (id) ->
    return if @editor and @editor.model.id is id

    graph = @graphs.get id
    return @navigate '', true unless graph

    view = new window.noflo.GraphEditor.views.Graph
      model: graph
      graphs: @graphs
      router: @
      openNode: (node) =>
        @navigate "#graph/#{id}/node/#{node.id}", true
      closeNode: =>
        @navigate "#graph/#{id}", true
    @root.html view.render().el

    # Fetch full graph information and activate view
    @prepareGraph graph, -> view.initializeEditor()

    @editor = view

  node: (graphId, nodeId) ->
    graph = @graphs.get graphId
    return @navigate '', true unless graph

    if @editor is null or @editor.model.id isnt graphId
      # Render the graph editor
      @graph graphId

    node = graph.get('nodes').get nodeId
    unless node
      @prepareGraph graph, => @node graphId, nodeId
      return
    view = new window.noflo.GraphEditor.views.Node
      model: node
      onRemove: =>
        @navigate "#graph/#{graphId}", true
      onEdit: =>
        @navigate "#graph/#{graphId}/component/#{node.get('component')}", true
    node.fetch
      success: =>
        @panel.html view.render().el
        @panel.show()

  component: (graphId, componentId) ->
    graph = @graphs.get graphId
    return @navigate '', true unless graph

    if @editor is null or @editor.model.id isnt graphId
      # Render the graph editor
      @graph graphId

    components = graph.get 'components'
    components.fetch
      success: =>
        component = components.get componentId
        return @navigate '', true unless component
        component.fetch
          success: =>
            view = new window.noflo.GraphEditor.views.Component
              model: component
            @panel.html view.render().el
            @panel.show()
            view.initializeEditor()

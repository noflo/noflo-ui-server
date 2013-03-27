#= require views

class window.noflo.GraphEditor.Router extends Backbone.Router
  project: null
  graphs: null
  root: null
  panel: null
  editor: null
  reset: ->

  routes:
    'graph/:network': 'graph'
    'graph/:network/node/:id': 'node'

  initialize: (options) ->
    @project = options.project
    @root = options.root
    @reset = options.reset

  prepareGraph: (graph, callback) ->
    done = _.after 3, -> callback graph
    graph.get('nodes').fetch success: done
    graph.get('edges').fetch success: done
    graph.fetch success: done

  graph: (id) ->
    @reset()
    if @project.get('graphs').length is 0
      @project.get('graphs').fetch
        success: =>
          @graph id
      return

    graph = @project.get('graphs').get id
    return @navigate '', true unless graph

    view = new window.noflo.GraphEditor.views.Graph
      model: graph
      graphs: @project.get 'graphs'
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
    @reset()
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

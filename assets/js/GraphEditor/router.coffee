#= require views

class window.noflo.GraphEditor.Router extends Backbone.Router
  project: null
  root: null
  actionBar: null
  contextBar: null

  routes:
    'graph/:package/:network': 'graph'

  initialize: ({@project, @root, @actionBar, @contextBar}) ->

  prepareGraph: (graph, callback) ->
    done = _.after 3, -> callback graph
    graph.get('nodes').fetch success: done, reset: true
    graph.get('edges').fetch success: done, reset: true
    graph.fetch success: done

  graph: (projectId, id) ->
    if @project.get('graphs').length is 0
      @project.get('graphs').fetch
        success: =>
          @graph projectId, id
      return

    graph = @project.get('graphs').get "#{projectId}/#{id}"
    return @navigate '', true unless graph

    view = new window.noflo.GraphEditor.views.Graph
      model: graph
      router: @
      graphs: @project.get 'graphs'
      actionBar: @actionBar
      contextBar: @contextBar
      openNode: (node) =>
        @navigate "#graph/#{id}/node/#{node.id}", true
    @root.html view.render().el

    # Fetch full graph information and activate view
    @prepareGraph graph, -> view.initializeEditor()

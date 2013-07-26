#= require views

class window.noflo.GraphEditor.Router extends Backbone.Router
  project: null
  root: null
  actionBar: null
  contextBar: null

  routes:
    'graph/new': 'addGraph'
    'graph/:package/:network': 'graph'

  initialize: ({@project, @root, @actionBar, @contextBar}) ->

  addGraph: ->
    view = new window.noflo.GraphEditor.views.AddGraph
      router: @
      project: @project
      actionBar: @actionBar
      contextBar: @contextBar
    @root.html view.render().el

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
    view.initializeEditor()

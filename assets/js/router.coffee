window.noflo = {} unless window.noflo

class window.noflo.Router extends Backbone.Router
  networks: null

  routes:
    '':         'index'
    'network/:network': 'network'
    'network/:network/add': 'addNode'
    'network/:network/add/:x/:y': 'addNodePositioned'

  initialize: (options) ->
    @networks = options.networks
    @rootElement = jQuery '#noflo'

  index: ->
    networksView = new window.noflo.views.NetworkList
      app: @
      collection: @networks
    @rootElement.html networksView.render().el

  network: (id) ->
    network = @networks.get id

    display = =>
      # The view will handle rendering necessary subviews for nodes, edges, etc
      networkView = new window.noflo.views.Network
        model: network
        app: @
      @rootElement.html networkView.render().el

      # Activate the graph editor after insertion
      networkView.activate()

    todo = 3
    network.get('nodes').fetch
      success: ->
        todo--
        do display if todo is 0
    network.get('edges').fetch
      success: ->
        todo--
        do display if todo is 0
    network.fetch
      success: ->
        todo--
        do display if todo is 0

  addNode: (id, display) ->
    network = @networks.get id
    network.get('components').fetch
      success: =>
        view = new window.noflo.views.AddNode
          collection: network.get 'components'
          app: @
          model: network
          display: display
        @rootElement.html view.render().el

  addNodePositioned: (id, x, y) ->
    @addNode id,
      x: parseInt x
      y: parseInt y

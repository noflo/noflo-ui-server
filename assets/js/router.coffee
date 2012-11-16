window.noflo = {} unless window.noflo

class window.noflo.Router extends Backbone.Router
  networks: null

  routes:
    '':         'index'
    'network/:network': 'network'

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
    network.fetch
      success: =>
        # The view will handle rendering necessary subviews for nodes, edges, etc
        networkView = new window.noflo.views.Network
          model: network
        @rootElement.html networkView.render().el

        # Activate the graph editor after insertion
        networkView.activate()

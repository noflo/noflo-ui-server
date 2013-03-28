#= require ../vendor/codemirror
#= require ../vendor/codemirror-coffeescript
#= require views

class window.noflo.CodeEditor.Router extends Backbone.Router
  project: null
  root: null
  reset: ->

  routes:
    'component/new': 'addComponent'
    'component/:name': 'coreComponent'
    'component/:name/edit': 'coreComponentEdit'
    'component/:package/:name': 'component'
    'component/:package/:name/:edit': 'componentEdit'

  initialize: ({@project, @root, @reset}) ->

  addComponent: ->
    @reset()
    view = new window.noflo.CodeEditor.views.AddComponent
      router: @
      project: @project
    @root.html view.render().el

  prepareComponent: (componentId, callback) ->
    components = @project.get 'components'
    component = components.get componentId
    return callback component if component
    components.fetch
      success: ->
        callback components.get componentId
      error: ->
        callback null

  coreComponent: (componentId) ->
    @component null, componentId

  component: (packageId, componentId) ->
    @reset()

    componentId = "#{packageId}/#{componentId}" if packageId
    @prepareComponent componentId, (component) =>
      return @navigate '', true unless component
      component.fetch
        success: =>
          view = new window.noflo.CodeEditor.views.Component
            model: component
            router: @
          @root.html view.render().el
        error: =>
          @navigate '', true

  coreComponentEdit: (componentId) ->
    @componentEdit null, componentId

  componentEdit: (packageId, componentId) ->
    @reset()

    componentId = "#{packageId}/#{componentId}" if packageId
    @prepareComponent componentId, (component) =>
      return @navigate '', true unless component
      component.fetch
        success: =>
          view = new window.noflo.CodeEditor.views.EditComponent
            model: component
            router: @
          @root.html view.render().el
          view.initializeEditors()
        error: =>
          @navigate '', true

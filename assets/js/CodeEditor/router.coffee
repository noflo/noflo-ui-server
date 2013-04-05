#= require ../vendor/codemirror
#= require ../vendor/codemirror-coffeescript
#= require views

class window.noflo.CodeEditor.Router extends Backbone.Router
  project: null
  root: null
  actionBar: null
  contextBar: null

  routes:
    'component/new': 'addComponent'
    'component/:name': 'coreComponent'
    'component/:name/edit': 'coreComponentEdit'
    'component/:package/:name': 'component'
    'component/:package/:name/:edit': 'componentEdit'

  initialize: ({@project, @root, @actionBar, @contextBar}) ->

  addComponent: ->
    if @project.get('components').length is 0
      @project.get('components').fetch
        success: =>
          @addComponent packageId, componentId

    view = new window.noflo.CodeEditor.views.AddComponent
      router: @
      project: @project
      actionBar: @actionBar
      contextBar: @contextBar
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
    if @project.get('components').length is 0
      @project.get('components').fetch
        success: =>
          @component packageId, componentId

    componentId = "#{packageId}/#{componentId}" if packageId
    @prepareComponent componentId, (component) =>
      return @navigate '', true unless component
      component.fetch
        success: =>
          view = new window.noflo.CodeEditor.views.Component
            model: component
            router: @
            project: @project
            actionBar: @actionBar
            contextBar: @contextBar
          @root.html view.render().el
        error: =>
          @navigate '', true

  coreComponentEdit: (componentId) ->
    @componentEdit null, componentId

  componentEdit: (packageId, componentId) ->
    componentId = "#{packageId}/#{componentId}" if packageId
    @prepareComponent componentId, (component) =>
      return @navigate '', true unless component
      component.fetch
        success: =>
          view = new window.noflo.CodeEditor.views.EditComponent
            model: component
            router: @
            project: @project
            actionBar: @actionBar
            contextBar: @contextBar
          @root.html view.render().el
          view.initializeEditors()
        error: =>
          @navigate '', true

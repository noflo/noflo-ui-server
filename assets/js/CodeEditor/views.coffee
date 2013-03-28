window.noflo = {} unless window.noflo
window.noflo.CodeEditor = {} unless window.noflo.CodeEditor

views = window.noflo.CodeEditor.views = {}

class views.Component extends Backbone.View
  template: '#Component'
  actionBar: null

  initialize: (options) ->
    @router = options.router
    @prepareActionBar()

  prepareActionBar: ->
    @actionBar = new ActionBar
      control:
        label: @model.get 'name'
        icon: 'noflo'
        up: @handleUp
      actions: [
        id: 'edit'
        label: 'Edit'
        icon: 'edit'
        action: @handleEdit
      ]
    , @

  handleUp: ->
    @router.navigate '', true

  handleEdit: ->
    @router.navigate "#component/#{@model.id}/edit", true

  render: ->
    template = jQuery(@template).html()
    componentData = @model.toJSON()
    componentData.name = @model.id unless componentData.name
    @$el.html _.template template, componentData
    @actionBar.show()
    @

class views.AddComponent extends Backbone.View
  template: '#AddComponent'
  actionBar: null

  events:
    'click #save': 'save'
    'form submit': 'save'

  initialize: ({@router, @project}) ->
    @prepareActionBar()

  prepareActionBar: ->
    @actionBar = new ActionBar
      control:
        label: 'New component'
        icon: 'noflo'
        up: @handleUp
    , @

  handleUp: ->
    @router.navigate '', true

  save: (event) ->
    event.preventDefault()
    name = jQuery('input#name', @el).val()
    project = @project.get 'name'
    @project.get('components').create
      name: name
      project: project
    , success: =>
        @router.navigate "#component/#{project}/#{name}/edit", true
      error: (e) -> alert e

  render: ->
    template = jQuery(@template).html()
    @$el.html _.template template,
      project: @project.get 'name'
    @actionBar.show()
    @

class views.EditComponent extends Backbone.View
  template: '#EditComponent'
  codeEditor: null
  testEditor: null
  actionBar: null

  initialize: ({@router}) ->
    @prepareActionBar()

  prepareActionBar: ->
    @actionBar = new ActionBar
      control:
        label: @model.get 'name'
        icon: 'noflo'
        up: @handleUp
      actions: [
        id: 'save'
        label: 'Save'
        icon: 'cloud-upload'
        action: @save
      ]
    , @

  handleUp: ->
    @router.navigate "#component/#{@model.id}", true

  save: ->
    @model.save
      success: =>
        @handleUp()

  render: ->
    template = jQuery(@template).html()
    componentData = @model.toJSON()
    componentData.name = @model.id unless componentData.name
    @$el.html _.template template, componentData
    @actionBar.show()
    @

  initializeEditors: ->
    code = jQuery('textarea.code', @el).get 0
    @codeEditor = CodeMirror.fromTextArea code,
      theme: 'lesser-dark'
    @codeEditor.on 'change', =>
      @model.set 'code', @codeEditor.getValue()
    test = jQuery('textarea.test', @el).get 0
    @testEditor = CodeMirror.fromTextArea test,
      theme: 'lesser-dark'
    @testEditor.on 'change', =>
      @model.set 'test', @testEditor.getValue()

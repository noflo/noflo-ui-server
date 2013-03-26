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

class views.EditComponent extends Backbone.View
  template: '#EditComponent'
  codeEditor: null
  testEditor: null
  actionBar: null

  initialize: (options) ->
    @router = options.router
    @prepareActionBar()

  prepareActionBar: ->
    @actionBar = new ActionBar
      control:
        label: @model.get 'name'
        icon: 'noflo'
        up: this.handleUp
      actions: [
        id: 'save'
        label: 'Save'
        icon: 'cloud-upload'
      ]
    , @

  handleUp: ->
    @router.navigate "#component/#{@model.id}", true

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
    test = jQuery('textarea.test', @el).get 0
    @testEditor = CodeMirror.fromTextArea test,
      theme: 'lesser-dark'

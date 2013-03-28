fs = require 'fs'
path = require 'path'
{_} = require 'underscore'
docco = require 'docco'
marked = require 'marked'
{highlight} = require 'highlight.js'

prepareComponent = (component, instance, callback) ->
  unless instance.isReady()
    instance.once 'ready', ->
      prepareComponent component, instance, callback
    return

  project = 'noflo'
  componentName = component
  nameParts = component.split '/'
  if nameParts.length is 2
    project = nameParts[0]
    componentName = nameParts[1]

  clean =
    id: component
    name: componentName
    project: project
    description: instance.description
    subgraph: instance.isSubgraph()
  clean.inPorts = _.keys instance.inPorts if instance.inPorts
  clean.outPorts = _.keys instance.outPorts if instance.outPorts
  callback null, clean

getSourcePath = (req, component, callback) ->
  req.componentLoader.listComponents (components) ->
    callback components[component]

getTestPath = (req, component, callback) ->
  getSourcePath req, component, (sourceFile) ->
    return callback null unless sourceFile
    callback path.resolve sourceFile, "../../test/#{path.basename(sourceFile)}"

readSources = (req, component, callback) ->
  getSourcePath req, component, (sourceFile) ->
    source = ''
    tests = ''
    done = _.after 2, ->
      callback
        source: source
        tests: tests
    fs.readFile sourceFile, 'utf-8', (err, contents) ->
      source = contents if contents
      done()

    getTestPath req, component, (testFile) ->
      # Check if we have tests for the component
      fs.exists testFile, (exists) ->
        return done() unless exists
        fs.readFile testFile, 'utf-8', (err, contents) ->
          tests = contents if contents
          done()

documentComponent = (req, component, sourceCode, callback) ->
  getSourcePath req, component, (sourceFile) ->
    chunks = docco.parse sourceFile, sourceCode
    html = ''
    for chunk in chunks
      code = highlight('coffeescript', chunk.codeText).value
      code = code.replace(/\s+$/, '')
      chunk.codeHtml = "<div class='highlight'><pre>#{code}</pre></div>"
      chunk.docsHtml = marked(chunk.docsText)
      html += "<section>"
      html += chunk.docsHtml
      html += chunk.codeHtml
      html += "</section>"
    callback html

exports.load = (req, id, callback) ->
  req.componentLoader.listComponents (components) ->
    return callback 'not found', null unless components[id]
    req.componentLoader.load id, (instance) ->
      prepareComponent id, instance, callback

exports.index = (req, res) ->
  req.componentLoader.listComponents (components) ->
    clean = []
    sendComponents = _.after _.keys(components).length, ->
      res.send clean
    _.each components, (path, component) ->
      req.componentLoader.load component, (instance) ->
        prepareComponent component, instance, (err, cleaned) ->
          clean.push cleaned
          sendComponents()

exports.create = (req, res) ->
  unless req.body.name
    return res.send "Missing component name", 422

  componentDir = "#{req.componentLoader.baseDir}/components"
  sourceFile = "#{componentDir}/#{req.body.name}.coffee"
  localSourceFile = "./components/#{req.body.name}.coffee"
  fs.exists sourceFile, (exists) ->
    return res.send "Component already exists", 422 if exists
    fs.writeFile sourceFile, req.componentTemplate, (err) ->
      return res.send err, 500 if err

      req.componentLoader.registerComponent req.project.name, req.body.name, localSourceFile,
        (err) ->
          return res.send err, 500 if err
          res.send
            id: "#{req.body.project}/#{req.body.name}"
            name: req.body.name
            project: req.body.project
            description: ''
            subgraph: false

exports.update = (req, res) ->
  unless req.body.code
    return res.send "Missing component source code", 422

  done = _.after 2, ->
    exports.show req, res

  getSourcePath req, req.component.id, (sourceFile) ->
    fs.writeFile sourceFile, req.body.code, (err) ->
      return res.send err if err

      # Ensure Node.js loads the new version
      delete require.cache[sourceFile] if require.cache[sourceFile]

      done()

  return done() unless req.body.test
  getTestPath req, req.component.id, (testFile) ->
    fs.writeFile testFile, req.body.test, (err) ->

      # Ensure Node.js loads the new version
      delete require.cache[testFile] if require.cache[testFile]

      done()

exports.show = (req, res) ->
  readSources req, req.component.id, (sources) ->
    req.component.code = sources.source
    req.component.test = sources.tests
    documentComponent req, req.component.id, sources.source, (docs) ->
      req.component.doc = docs
      res.send req.component

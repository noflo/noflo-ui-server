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

documentComponent = (sourceFile, sourceCode) ->
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
  html

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

exports.load = (req, id, callback) ->
  req.componentLoader.listComponents (components) ->
    return callback 'not found', null unless components[id]
    req.componentLoader.load id, (instance) ->
      prepareComponent id, instance, callback

readSources = (sourceFile, callback) ->
  source = ''
  tests = ''
  done = _.after 2, ->
    callback
      source: source
      tests: tests
  fs.readFile sourceFile, 'utf-8', (err, contents) ->
    source = contents if contents
    done()

  # Check if we have tests for the component
  testFile = path.resolve sourceFile, "../../test/#{path.basename(sourceFile)}"
  console.log testFile
  fs.exists testFile, (exists) ->
    return done() unless exists
    fs.readFile testFile, 'utf-8', (err, contents) ->
      tests = contents if contents
      done()

exports.show = (req, res) ->
  req.componentLoader.listComponents (components) ->
    sourceFile = components[req.component.id]
    return res.send 404 unless sourceFile
    readSources sourceFile, (sources) ->
      req.component.code = sources.source
      req.component.test = sources.tests
      req.component.doc = documentComponent components[req.component.id], sources.source
      res.send req.component

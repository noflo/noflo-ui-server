path = require 'path'
fs = require 'fs'
noflo = require 'noflo'
{_} = require 'underscore'

exports.readPackage = (projectDir, callback) ->
  projectFile = path.resolve projectDir, './package.json'
  fs.readFile projectFile, 'utf-8', (err, file) ->
    return callback err if err
    try
      projectData = JSON.parse file
      callback null, projectData
    catch e
      return callback e

exports.readProject = (projectDir, callback) ->
  exports.readPackage projectDir, (err, projectData) ->
    return callback err if err
    unless projectData.noflo
      return callback new Error 'No NoFlo definitions found for project'

    projectData.localDir = projectDir

    callback null, projectData

exports.readGraphs = (projectDir, callback) ->
  exports.readProject projectDir, (err, projectData) ->
    return callback err if err
    exports.getGraphs projectData, callback

exports.getGraphs = (projectData, callback) ->
  unless projectData.noflo.graphs
    return callback null, []
  graphs = []
  returnGraphs = _.after _.keys(projectData.noflo.graphs).length, ->
    callback null, graphs
  todo = _.keys(projectData.noflo.graphs).length
  _.each projectData.noflo.graphs, (graphPath, graphName) ->
    localPath = path.resolve projectData.localDir, graphPath
    noflo.graph.loadFile localPath, (graph) ->
      graph.id = graphName
      graph.fileName = localPath
      graph.baseDir = projectData.localDir
      graphs.push graph
      do returnGraphs

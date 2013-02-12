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

exports.getGraphs = (projectDir, callback) ->
  exports.readPackage projectDir, (err, projectData) ->
    return callback err if err
    unless projectData.noflo
      callback new Error 'No NoFlo definitions found for project'
    unless projectData.noflo.graphs
      callback null, {}
    
    graphs = []
    todo = _.keys(projectData.noflo.graphs).length
    _.each projectData.noflo.graphs, (graphPath, graphName) ->
      localPath = path.resolve projectDir, graphPath
      noflo.graph.loadFile localPath, (graph) ->
        todo--
        graph.id = graphName
        graph.fileName = localPath
        graph.baseDir = projectDir
        graphs.push graph
        return if todo
        callback null, graphs

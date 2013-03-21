prepareProject = (projectData) ->
  clean =
    id: projectData.name
    name: projectData.name.replace 'noflo-', ''
    description: projectData.description
  clean

exports.load = (req, id, callback) ->
  unless id is req.project.name
    return callback 'not found', null
  callback null, req.project

exports.index = (req, res) ->
  clean = []
  clean.push prepareProject req.project
  res.send clean

exports.show = (req, res) ->
  res.send prepareProject req.project

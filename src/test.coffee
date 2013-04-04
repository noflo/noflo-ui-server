path = require 'path'
fs = require 'fs'

exports.runTests = (loader, fileName, callback) ->
  # Ensure the test is not cached
  delete require.cache[fileName] if require.cache[fileName]

  # Set NoFlo baseDir
  process.env.NOFLO_TEST_BASEDIR = loader.baseDir

  # Load the tests
  tests = require fileName

  vows = []
  reporter =
    report: (data) ->
      return unless data.length
      return unless data[0] is 'vow'
      vows.push data[1]

  for test, suite of tests
    suite.run
      reporter: reporter
    , (results) ->
      results.vows = vows
      callback results

exports.getPath = (loader, component, callback) ->
  loader.listComponents (components) ->
    return callback null unless components[component]
    sourceFile = components[component]
    baseName = path.basename sourceFile
    testFile = path.resolve sourceFile, "../../test/#{baseName}"
    fs.exists testFile, (exists) ->
      return callback null unless exists
      callback testFile

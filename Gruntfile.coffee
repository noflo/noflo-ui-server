module.exports = ->
  # Project configuration
  @initConfig
    pkg: @file.readJSON 'package.json'

    exec:
      nuke_main:
        command: 'rm -rf ./components/*/'
      main_install:
        command: './node_modules/.bin/component install'
      main_build:
        command: './node_modules/.bin/component build -u component-json,component-coffee -o assets/browser -n noflo-ui -c'
      preview_deps:
        command: 'npm install'
        stdout: false
        stderr: false
        cwd: 'components/noflo-noflo-ui/preview'
      preview_install:
        command: './node_modules/.bin/component install'
        cwd: 'components/noflo-noflo-ui/preview'
      preview_build:
        command: './node_modules/.bin/component build -u component-json,component-coffee -o ../../../assets/preview/browser -n noflo-ui-preview -c'
        cwd: 'components/noflo-noflo-ui/preview'
      copy_index:
        command: 'cp -R assets/browser/noflo-noflo-ui/* assets/'

  # Grunt plugins used for building
  @loadNpmTasks 'grunt-exec'

  # Our local tasks
  @registerTask 'build', ['exec']
  @registerTask 'default', ['build']

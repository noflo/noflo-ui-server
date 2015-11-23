module.exports = ->
  # Project configuration
  @initConfig
    pkg: @file.readJSON 'package.json'

    clean:
      nuke_main:
        src: ['components']
    
    exec:
      main_install:
        command: 'node ./node_modules/component/bin/component install'
      main_build:
        command: 'node ./node_modules/component/bin/component build -u component-json,component-coffee -o assets/browser -n noflo-ui -c'
      preview_deps:
        command: 'npm install'
        stdout: false
        stderr: false
        cwd: 'components/noflo-noflo-ui/preview'
      preview_install:
        command: 'node ./node_modules/component/bin/component install'
        cwd: 'components/noflo-noflo-ui/preview'
      preview_build:
        command: 'node ./node_modules/component/bin/component build -u component-json,component-coffee -o ../../../assets/preview/browser -n noflo-ui-preview -c'
        cwd: 'components/noflo-noflo-ui/preview'

    copy:
      copy_index:
        files: [
          cwd: 'assets/browser/noflo-noflo-ui/'
          src: ['**']
          dest: 'assets/'
          expand: true
        ]

  # Grunt plugins used for building
  @loadNpmTasks 'grunt-exec'
  @loadNpmTasks 'grunt-contrib-clean'
  @loadNpmTasks 'grunt-contrib-copy'

  # Our local tasks
  @registerTask 'build', ['clean', 'exec', 'copy']
  @registerTask 'default', ['build']

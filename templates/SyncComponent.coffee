noflo = require 'noflo'

class Component extends noflo.Component
  constructor: ->
    @inPorts =
      in: new noflo.Port 'all'
    @outPorts =
      out: new noflo.Port 'all'

    @inPorts.in.on 'data', (data) =>
      @outPorts.out.send data
    @inPorts.in.on 'disconnect', =>
      @outPorts.out.disconnect()

exports.getComponent = -> new Component

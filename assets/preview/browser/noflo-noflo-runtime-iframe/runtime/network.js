(function (context) {
  var noflo = context.require('noflo');
  var Base = context.require('noflo-noflo-runtime-base');

  var Iframe = function (options) {
    if (!options) {
      options = {};
    }

    if (options.catchExceptions) {
      context.onerror = function (err) {
        this.send('network', 'error', {
          message: err.toString()
        }, {
          href: context.parent.location.href
        });
        return true;
      }.bind(this);
    }

    this.prototype.constructor.apply(this, arguments);
    this.receive = this.prototype.receive;
  };
  Iframe.prototype = Base;
  Iframe.prototype.send = function (protocol, topic, payload, ctx) {
    if (payload instanceof Error) {
      payload = {
        message: payload.toString()
      };
    }
    context.parent.postMessage({
      protocol: protocol,
      command: topic,
      payload: payload
    }, ctx.href);
  };
  var runtime = new Iframe({
    catchExceptions: true
  });

  context.addEventListener('message', function (message) {
    if (message.origin !== context.parent.location.origin) {
      return;
    }
    if (!message.data.protocol) {
      return;
    }
    if (!message.data.command) {
      return;
    }
    runtime.receive(message.data.protocol, message.data.command, message.data.payload, {
      href: context.parent.location.href
    });
  });

})(window);

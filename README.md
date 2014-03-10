**Deprecation notice:** noflo-ui-server is no longer necessary for running the [NoFlo UI](https://github.com/noflo/noflo-ui). Instead, run the UI from any HTTP server, or just access the hosted version at <noflojs.org/noflo-ui/>. To run NoFlo graphs on Node.js you need to install, configure, and run [noflo-nodejs](https://github.com/noflo/noflo-nodejs).

NoFlo Development Environment Server [![Build Status](https://travis-ci.org/noflo/noflo-ui-server.png?branch=master)](https://travis-ci.org/noflo/noflo-ui-server)
====================================

A Node.js server process for serving the [NoFlo UI](https://github.com/noflo/noflo-ui) and providing a WebSocket interface for running NoFlo graphs on the Node.js instance.

## Installation

The NoFlo UI Server has not yet been published via NPM. In the meanwhile, grab this git repository and run:

    $ npm install

You also need to build the browser-side files with:

    $ grunt build

(install Grunt via `npm install -g grunt-cli` if you don't have it yet)

## Running

This application provides the user interface for editing an existing NoFlo project. To start it, you need to point the process to the directory where your project is on the filesystem:

    $./bin/noflo-ui /some/path/to/project

By default, NoFlo UI runs at port *3569*. To run it under some other port, use the *-p* option.

NoFlo Development Environment Server [![Build Status](https://travis-ci.org/noflo/noflo-ui-server.png?branch=master)](https://travis-ci.org/noflo/noflo-ui-server)
====================================

A Node.js server process for serving the [NoFlo UI](https://github.com/noflo/noflo-ui) and providing a WebSocket interface for running NoFlo graphs on the Node.js instance.

## Installation

The NoFlo UI Server has not yet been published via NPM. In the meanwhile, grab this git repository and run:

    $ npm install

## Running

This application provides the user interface for editing an existing NoFlo project. To start it, you need to point the process to the directory where your project is on the filesystem:

    $./bin/noflo-ui /some/path/to/project

By default, NoFlo UI runs at port *3569*. To run it under some other port, use the *-p* option.

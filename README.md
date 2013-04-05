NoFlo User Interface
====================

This repository provides the web-based user interface for the [NoFlo](http://noflojs.org). NoFlo runs on Node.js and enables you to write and run [flow-based programs](http://en.wikipedia.org/wiki/Flow-based_programming) on the platform.

Currently noflo-ui enables you to visualize existing NoFlo graphs on a web user interface. The long-term plan is to make it possible to create now NoFlo graphs with the same tool, as well as to monitor and modify running NoFlo networks.

![NoFlo UI](https://pbs.twimg.com/media/A76BXMbCIAA-VMI.png:medium)

Having a proper user interface is NoFlo's [issue number 1](https://github.com/bergie/noflo/issues/1). You can follow the plans and progress also there. The current implementation is based on the [jsPlumb](http://jsplumb.org/) library, but I'm also following the progress on the [dataflow editor](http://meemoo.org/dataflow/).

## Installation

The NoFlo UI has not yet been published via NPM. In the meanwhile, grab this git repository and run:

    $ npm install

## Running

This application provides the user interface for editing an existing NoFlo project. To start it, you need to point the process to the directory where your project is on the filesystem:

    $./bin/noflo-ui /some/path/to/project

By default, NoFlo UI runs at port *3569*. To run it under some other port, use the *-p* option.

## Visual language

Flow-based programs are essentially flowcharts that you can run. You can write them in [the domain-specific FBP language](https://github.com/bergie/noflo/blob/master/examples/linecount/count.fbp), or generate [JSON](https://github.com/bergie/noflo/blob/master/examples/linecount/count.json) from external tools. But really, the best way to work with them is to do it visually.

Because of this, we need to define some visual concepts to show the various features of typical flow-based programs. Here are the current ideas:

* Boxes represent individual processes in the network
* Double-bordered boxes represent processes that are actually subgraphs instead of code
* Round connectors in the edges of the boxes represent regular input or output ports
* Square connectors represent arrayports, and can have multiple connections
* Input ports are on the left-hand side of a box
* Output ports are on the right-hand side of a box
* Arrows or lines between ports show the connections between them

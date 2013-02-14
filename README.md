# MultiNodes

Running many logical nodes in different machines, to build a distributed node cluster. Each logical node can host application objects, and interchange messages.

## Description

In some of my projects, I need to run object applications that interchange message with other running processes.
Instead of having each process open its own TCP/IP port and connecting to the other processes that host the
same object application, I want to have an utility to manage such cases. MultiNodes does:

- Start a logical node in a worker process.
- Expose the logical node to other nodes in the node set.
- Connect to other logical nodes.
- Declare and exposes the local services/applications.
- Exchange messages (simple JavaScript objects serializable to JSON) between distributed services/applications.

See a logical node as an object running in a machine, using Node.js.

See a service/application as an object that sends and receives messages.

Related projects that need this functionality:

- [SimpleStorm](https://github.com/ajlopez/SimpleStorm) Simple Storm-like distributed application implementation.
- [AjFabriqNode](https://github.com/ajlopez/AjFabriqNode) A Distributed Application Framework for NodeJs.

Example: [SimpleStorm](https://github.com/ajlopez/SimpleStorm) can run local topologies, 
like the original [Storm Java project](http://storm-project.net/).
But it can run distributed topologies, too. Each task in those
topologies can emit message to the other tasks, that can be local or remote. Instead of managing 
the connection and discovery of the other remote machines running topologies by itself, SimpleStorm could rely on
MultiNode to manage the distributed logical nodes.

## Installation

Via npm on Node:

```
npm install multinodes
```

## Usage

Reference in your program:

```js
var multinodes = require('multinodes');
```

Create a node:
```js
var node = multinodes.createNode();
```
It creates a node with a random name.

```js
var node = multinodes.createNode(name);
```
It creates a node with the given name.

```js
var node = multinodes.createNode(port[, host]);
// a server starts listen on port
node.start(function(msg) {
	// For each connected client
	// it will receive the description of remote node
});
```

Register an application with a description:
```js
node.registerApplication(name, application, description);
```
`application` should be an object with a `process(msg)` function to receive messages. `description` is an optional
object that has application-dependent information.

Get node description:
```js
var description = node.getDescription();
```
It includes the node name, the registered applications, and the names of the known remote nodes.

Connect a node to a published server node:
```js
node.connect(port, host, function(msg) {
	// It receives the remote node description msg
    // with its name, known nodes and application descriptions
});
```
See [network test](https://github.com/ajlopez/MultiNodes/blob/master/test/network.js).

Send a message to a node:
```js
node.process(msg);
```
Examples:
```js
// Send a message to an application, to be processed as app.process(msg)
node.process({ application: 'webcrawler', message: { link: 'http://ajlopez.wordpress.com' }});
// Send a call to an application, to be processed as app.[action](args...)
node.process({ application: 'webcrawler', action: 'methodname', args: [1, 2] });
```
Usually, instead of `node.process` you can use the following methods:

Send a message to app.process(msg)
```js
node.tellToApplication(appname, msg);
```

Call a method (action) in application as app.[action](args...). 
```js
node.callApplication(appname, actionname, args);
```
`args` is an array.

Stops a node:
```js
node.stop();
```

## Development

```
git clone git://github.com/ajlopez/MultiNodes.git
cd MultiNodes
npm install
npm test
```

## Samples

TBD

## To do

- Samples
- Improve README.md

## Versions

- 0.0.1: Published.
- 0.0.2: Under development, in master.

## Contribution

Feel free to [file issues](https://github.com/ajlopez/MultiNodes) and submit
[pull requests](https://github.com/ajlopez/MultiNodes/pulls) — contributions are
welcome.

If you submit a pull request, please be sure to add or update corresponding
test cases, and ensure that `npm test` continues to pass.


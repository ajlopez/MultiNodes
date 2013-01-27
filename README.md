# MultiNodes

Running many logical nodes in different machines, to build a distributed node cluster. Each logical node can host services, and interchange messages.

## Description

In some of my projects, I need to run services/applications that interchange message with other running processes.
Instead of having each process open its own TCP/IP port and connecting to the other processes that host the
same service/application, I want to have an utility to manage such cases. MultiNodes does:

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
topologies can emit message to the other tasks, that can be local or remote. Instead of managing by itself
the connection and discovery of the other remote machines running topologies, SimpleStorm could rely on
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
Register a service with a description:
```js
node.registerService(name, service, description);
```
`service` should have a `process(msg)` function to receive messages.

Get node description:
```js
var description = node.getDescription();
```
It includes the registered services, the published server (if any), and the known remote nodes.

Publish a node as a server:
```js
node.listen(port, host, function(client, msg) {
	// It receives each connected client and its description msg
});
```

Connect a node to a published server node:
```js
node.connect(port, host, function(server, msg) {
	// It receives the server and its description msg
});
```

Send a message to a service:
```js
node.process({ service: name, message: message });
```

Stops a node:
```js
node.stop();
```

See [network test](https://github.com/ajlopez/MultiNodes/blob/master/test/network.js).

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

## Contribution

Feel free to [file issues](https://github.com/ajlopez/MultiNodes) and submit
[pull requests](https://github.com/ajlopez/MultiNodes/pulls) — contributions are
welcome.

If you submit a pull request, please be sure to add or update corresponding
test cases, and ensure that `npm test` continues to pass.


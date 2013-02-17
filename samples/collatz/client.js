
var multinodes = require('../..');

var port = parseInt(process.argv[2]);
var serverport = parseInt(process.argv[3]);

var node = multinodes.createNode(port);
node.require = function (name) {
    return require(name);
}

node.start();
node.connect(serverport);

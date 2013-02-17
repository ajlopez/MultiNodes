
var multinodes = require('../..'),
    collatz = require('./collatz');

var port = parseInt(process.argv[2]);

var node = multinodes.createNode(port);
collatz.createApplication('collatz', node);
node.start(function(desc) {
    console.log('new node', desc.name);
    node.runInNode(desc.name, function (nodename) {
        console.log('running in client');
        var description = this.getDescription();
        if (description.applications['collatz'])
            return;
        console.log('registering application');
        var collatz = this.require('./collatz');
        collatz.createApplication('collatz', this);
        this.processInNode(nodename, this.getDescription());
    }, [node.name]);
});

setTimeout(function () {
    for (var k = 1; k <= 1000; k++)
        node.tellToApplication('collatz', [k]);
}, 10000);
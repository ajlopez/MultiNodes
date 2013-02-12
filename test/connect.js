
var mnode = require('..');

exports['Connect to Node'] = function (test) {
    var nmsg = 0;
    var node = mnode.createNode();
    var node2 = mnode.createNode();
    
    node.connect(node2);
    
    var description = node.getDescription();
    
    test.equal(description.name, node.name);
    test.equal(description.nodes.length, 1);
    test.equal(description.nodes[0], node2.name);
    
    var description2 = node2.getDescription();
    
    test.equal(description2.name, node2.name);
    test.equal(description2.nodes.length, 1);
    test.equal(description2.nodes[0], node.name);
    
    test.done();
};

exports['Connect and Get Nodes'] = function (test) {
    var nmsg = 0;
    var node = mnode.createNode();
    var node2 = mnode.createNode();
    
    node.connect(node2);
    
    var nodes = node.getNodes();
    
    test.ok(nodes);
    test.equal(Object.keys(nodes).length, 1);
    
    var desc = node2.getDescription();
    
    var nodeinfo = nodes[desc.name];
    
    test.ok(nodeinfo);
    test.equal(nodeinfo.name, desc.name);
    test.ok(nodeinfo.info);
    
    test.done();
};

exports['Get Nodes with Application'] = function (test) {
    var nmsg = 0;
    var node = mnode.createNode();
    var node2 = mnode.createNode();
    var node3 = mnode.createNode();

    node2.registerApplication('application1');
    node3.registerApplication('application2');

    var desc = node2.getDescription();

    node2.connect(node);
    node3.connect(node);

    var nodes = node.getNodes('application1');

    test.ok(nodes);
    test.equal(nodes.length, 1);

    var nodeinfo = nodes[0];

    test.ok(nodeinfo);
    test.equal(nodeinfo.id, desc.id);
    test.ok(nodeinfo.info);
    test.deepEqual(nodeinfo.info, desc);

    test.done();
};

exports['Get Nodes with Application and Filter'] = function (test) {
    var nmsg = 0;
    var node = mnode.createNode();
    var node2 = mnode.createNode();
    var node3 = mnode.createNode();
    
    node2.registerApplication('application1', { }, { counter: 10 });
    node3.registerApplication('application1', { }, { counter: 20 });
    
    var desc = node2.getDescription();
    
    node2.connect(node);
    node3.connect(node);
    
    var nodes = node.getNodes('application1', function (desc) { return desc.counter == 10; });
    
    test.ok(nodes);
    test.equal(nodes.length, 1);
    
    var nodeinfo = nodes[0];
    
    test.ok(nodeinfo);
    test.equal(nodeinfo.name, desc.name);
    test.ok(nodeinfo.info);
    test.deepEqual(nodeinfo.info, desc);
    
    test.done();
};

exports['Send Message to Connected Node'] = function (test) {
    var nmsg = 0;

    var node = mnode.createNode();
    var node2 = mnode.createNode();
    
    var result = { sum: 0, total: 3 };
    
    node.registerApplication('application1', new Application(test, 1, result));
    node2.registerApplication('application2', new Application(test, 2, result));
        
    node2.connect(node);
    
    node.process({ application: 'application2', message: 2 });
    node2.process({ application: 'application1', message: 1 });
};

function Application(test, message, result) {
    this.process = function (msg) {
        test.ok(msg);
        test.equal(msg, message);
        result.sum += msg;
        
        if (result.sum == result.total)
            test.done();
    };
}

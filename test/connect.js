
var mnode = require('..');

exports['Connect to Node'] = function (test) {
    var nmsg = 0;
    var node = mnode.createNode();
    var description = node.getDescription();
    var node2 = mnode.createNode();
    var description2 = node2.getDescription();
    
    node.on('data', function (msg) {
        test.equal(msg.id, description2.id);
        nmsg++;
        
        if (nmsg == 2)
            test.done();
    });
    
    node2.on('data', function (msg) {
        test.equal(msg.id, description.id);
        nmsg++;
        
        if (nmsg == 2)
            test.done();
    });
    
    node.connect(node2);
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
    
    var nodeinfo = nodes[desc.id];
    
    test.ok(nodeinfo);
    test.equal(nodeinfo.id, desc.id);
    test.ok(nodeinfo.info);
    
    test.done();
};

exports['Get Nodes with Service'] = function (test) {
    var nmsg = 0;
    var node = mnode.createNode();
    var node2 = mnode.createNode();
    var node3 = mnode.createNode();
    
    node2.registerService('service1');
    node3.registerService('service2');

    var desc = node2.getDescription();
    
    node2.connect(node);
    node3.connect(node);
    
    var nodes = node.getNodes('service1');
    
    test.ok(nodes);
    test.equal(nodes.length, 1);

    var nodeinfo = nodes[0];
    
    test.ok(nodeinfo);
    test.equal(nodeinfo.id, desc.id);
    test.ok(nodeinfo.info);
    test.deepEqual(nodeinfo.info, desc);
    
    test.done();
};

exports['Get Nodes with Service and Filter'] = function (test) {
    var nmsg = 0;
    var node = mnode.createNode();
    var node2 = mnode.createNode();
    var node3 = mnode.createNode();
    
    node2.registerService('service1', { }, { counter: 10 });
    node3.registerService('service1', { }, { counter: 20 });
    
    var desc = node2.getDescription();
    
    node2.connect(node);
    node3.connect(node);
    
    var nodes = node.getNodes('service1', function (desc) { return desc.counter == 10; });
    
    test.ok(nodes);
    test.equal(nodes.length, 1);
    
    var nodeinfo = nodes[0];
    
    test.ok(nodeinfo);
    test.equal(nodeinfo.id, desc.id);
    test.ok(nodeinfo.info);
    test.deepEqual(nodeinfo.info, desc);
    
    test.done();
};

exports['Send Message to Connected Node'] = function (test) {
    var nmsg = 0;

    var node = mnode.createNode();
    var node2 = mnode.createNode();
    
    var result = { sum: 0, total: 3 };
    
    node.registerService('service1', new Service(test, 1, result));
    node2.registerService('service2', new Service(test, 2, result));
        
    node2.connect(node);
    
    node.process({ service: 'service2', message: 2 });
    node2.process({ service: 'service1', message: 1 });
};

function Service(test, message, result) {
    this.process = function (msg) {
        test.ok(msg);
        test.equal(msg, message);
        result.sum += msg;
        
        if (result.sum == result.total)
            test.done();
    };
}

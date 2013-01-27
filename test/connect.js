
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
    
    node2.registerService('service1', {});
    node3.registerService('service3', {});
    
    node2.connect(node);
    node3.connect(node);
    
    var nodes = node.getNodes('service1');
    
    test.ok(nodes);
    test.equal(Object.keys(nodes).length, 1);
    
    var desc = node2.getDescription();
    
    var nodeinfo = nodes[desc.id];
    
    test.ok(nodeinfo);
    test.equal(nodeinfo.id, desc.id);
    test.ok(nodeinfo.info);
    test.deepEqual(nodeinfo.info, desc);
    
    test.done();
};

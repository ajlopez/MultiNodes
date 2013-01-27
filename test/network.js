
var mnode = require('..');

exports['Send Message to Connected Node'] = function (test) {
    test.expect(13);
    
    var nmsg = 0;

    var node = mnode.createNode();
    var node2 = mnode.createNode();
    
    var result = { sum: 0, total: 3 };
    
    node.registerService('service1', new Service(test, 1, result, done));
    node2.registerService('service2', new Service(test, 2, result, done));
    
    node.listen(3000, function (client, msg) {
        test.equal(msg.id, node2.getDescription().id);
        test.ok(msg.services);
        test.ok(msg.services.service2);

        node.process({ service: 'service2', message: 2 });
    });
    
    node2.connect(3000, function (server, msg) {
        test.equal(msg.id, node.getDescription().id);
        test.ok(msg.services);
        test.ok(msg.services.service1);
        
        test.ok(msg.server);
        test.equal(msg.server.host, 'localhost');
        test.equal(msg.server.port, 3000);

        node2.process({ service: 'service1', message: 1 });
    });
        
    function done() {
        test.done();
        node.stop();
        node2.stop();
    }
};

exports['Send Message to Connected Nodes'] = function (test) {
    test.expect(25);
    
    var nmsg = 0;

    var node = mnode.createNode();
    var node2 = mnode.createNode();
    var node3 = mnode.createNode();
    
    var result = { sum: 0, total: 6 };
    
    node.registerService('service1', new Service(test, 1, result, done));
    node2.registerService('service2', new Service(test, 2, result, done));
    node3.registerService('service3', new Service(test, 3, result, done));
    
    var processed = 0;
    
    node.listen(3000, function (client, msg) {
        if (processed) {
            test.equal(msg.id, node3.getDescription().id);
            test.ok(msg.services);
            test.ok(msg.services.service3);
        }
        else {
            test.equal(msg.id, node2.getDescription().id);
            test.ok(msg.services);
            test.ok(msg.services.service2);
        }

        if (processed)
            return;
            
        node.process({ service: 'service2', message: 2 });
        processed++;
    });
    
    node2.listen(3001, function (client, msg) {
        test.equal(msg.id, node3.getDescription().id);
        test.ok(msg.services);
        test.ok(msg.services.service3);
        
        node.process({ service: 'service3', message: 3 });
    });
    
    node2.connect(3000, function (server, msg) {
        test.equal(msg.id, node.getDescription().id);
        test.ok(msg.services);
        test.ok(msg.services.service1);
        
        test.ok(msg.server);
        test.equal(msg.server.host, 'localhost');
        test.equal(msg.server.port, 3000);

        node2.process({ service: 'service1', message: 1 });
        
        node3.connect(3000, function (server, msg) {
            test.equal(msg.id, node.getDescription().id);
            test.ok(msg.services);
            test.ok(msg.services.service1);
            test.ok(msg.nodes);
        });
    });
        
    function done() {
        test.done();
        node.stop();
        node2.stop();
        node3.stop();
    }
};

function Service(test, message, result, done) {
    this.process = function (msg) {
        test.ok(msg);
        test.equal(msg, message);
        result.sum += msg;
        
        if (result.sum == result.total)
            done();
    };
}


var mnode = require('..');

exports['Send Message to Remote Node'] = function (test) {
    test.expect(11);
    
    var nmsg = 0;

    var node = mnode.createNode(3000);

    test.equal(node.name, 'localhost:3000');
    
    var node2 = mnode.createNode();
    
    var result = { sum: 0, total: 3 };
    
    node.registerApplication('application1', new Application(test, 1, result, done));
    node2.registerApplication('application2', new Application(test, 2, result, done));
    
    node.start(function (client, msg) {
        test.equal(msg.name, node2.getDescription().name);
        test.ok(msg.applications);
        test.ok(msg.applications.application2);

        node.process({ application: 'application2', message: 2 });
    });
    
    node2.connect(3000, function (server, msg) {
        test.equal(msg.name, node.name);
        test.ok(msg.applications);
        test.ok(msg.applications.application1);
        
        node2.process({ application: 'application1', message: 1 });
    });
        
    function done() {
        test.done();
        node.stop();
        node2.stop();
    }
};

exports['Call Application in Remote Node'] = function (test) {
    test.expect(3);
    
    var nmsg = 0;

    var node = mnode.createNode(3000);

    test.equal(node.name, 'localhost:3000');
    
    var node2 = mnode.createNode();
    
    var result = { sum: 0, total: 3 };
    
    node.registerApplication('application1', new Application(test, 1, result, done));
    node2.registerApplication('application2', new Application(test, 2, result, done));
    
    node.start();
    
    node2.connect(3000, function (server, msg) {
        node2.callApplication('application1', 'method', [1]);
    });
        
    function done() {
        test.done();
        node.stop();
        node2.stop();
    }
};

exports['Send Message to Remote Nodes'] = function (test) {
    test.expect(22);
    
    var nmsg = 0;

    var node = mnode.createNode(3000);
    var node2 = mnode.createNode(3001);
    var node3 = mnode.createNode();
    
    var result = { sum: 0, total: 6 };
    
    node.registerApplication('application1', new Application(test, 1, result, done));
    node2.registerApplication('application2', new Application(test, 2, result, done));
    node3.registerApplication('application3', new Application(test, 3, result, done));
    
    var processed = 0;
    
    node.start(function (client, msg) {
        if (processed) {
            test.equal(msg.name, node3.name);
            test.ok(msg.applications);
            test.ok(msg.applications.application3);
        }
        else {
            test.equal(msg.name, node2.name);
            test.ok(msg.applications);
            test.ok(msg.applications.application2);
        }

        if (processed)
            return;
            
        node.process({ application: 'application2', message: 2 });
        processed++;
    });
    
    node2.start(function (client, msg) {
        test.equal(msg.id, node3.getDescription().id);
        test.ok(msg.applications);
        test.ok(msg.applications.application3);
        
        node.process({ application: 'application3', message: 3 });
    });
    
    node2.connect(3000, function (server, msg) {
        test.equal(msg.name, node.name);
        test.ok(msg.applications);
        test.ok(msg.applications.application1);
        
        node2.process({ application: 'application1', message: 1 });
        
        node3.connect(3000, function (server, msg) {
            test.equal(msg.name, node.name);
            test.ok(msg.applications);
            test.ok(msg.applications.application1);
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

function Application(test, message, result, done) {
    this.method = function (arg) {
        test.ok(arg);
        test.equal(arg, message);
        done();
    };
    
    this.process = function (msg) {
        test.ok(msg);
        test.equal(msg, message);
        result.sum += msg;
        
        if (result.sum == result.total)
            done();
    };
}

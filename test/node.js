
var mnode = require('..');

exports['Create Node'] = function (test) {
    var node = mnode.createNode();
    test.ok(node);
    test.ok(node.name);
    test.done();
};

exports['Create Node and Get Empty Description'] = function (test) {
    var node = mnode.createNode();
    var description = node.getDescription();
    
    test.ok(description);
    test.ok(description.name);
    test.ok(description.applications);
    test.ok(description.nodes);
    test.equal(Object.keys(description.applications).length, 0);
    test.equal(description.nodes.length, 0);
    
    test.done();
};

exports['Register Application'] = function (test) {
    var node = mnode.createNode();
    var myapplication = { };
    node.registerApplication('myapplication', myapplication);

    var description = node.getDescription();
    
    test.ok(description);
    test.ok(description.name);
    test.ok(description.applications);
    test.equal(Object.keys(description.applications).length, 1);
    test.ok(description.applications.myapplication);
    
    var appdesc = description.applications.myapplication;
    
    test.equal(appdesc.name, 'myapplication');
    test.ok(!appdesc.description);
    
    test.done();
};

exports['Register Application with Description'] = function (test) {
    var node = mnode.createNode();
    var myapplication = { };
    node.registerApplication('myapplication', myapplication, { counter: 10 });

    var description = node.getDescription();
    
    test.ok(description);
    test.ok(description.name);
    test.ok(description.applications);
    test.equal(Object.keys(description.applications).length, 1);
    test.ok(description.applications.myapplication);
    
    var appdesc = description.applications.myapplication;
    
    test.equal(appdesc.name, 'myapplication');
    test.ok(appdesc.description);
    test.equal(typeof appdesc.description, 'object');
    test.equal(Object.keys(appdesc.description).length, 1);
    test.equal(appdesc.description.counter, 10);
    
    test.done();
};

exports['Call Application Method'] = function (test) {
    var node = mnode.createNode();
    node.registerApplication('myapplication', new Application(test, 'foo'));

    node.callApplication('myapplication', 'method', ['foo']);
};

exports['Tell to Application'] = function (test) {
    var node = mnode.createNode();
    node.registerApplication('myapplication', new Application(test, 'foo'));

    node.tellToApplication('myapplication', 'foo');
};

exports['Run in Local Node'] = function (test) {
    var node = mnode.createNode();
    node.runInNode(function () {
        test.ok(this);
        test.equal(this, node);
        test.done();
    });
};

exports['Run in Local Application'] = function (test) {
    var node = mnode.createNode();
    node.registerApplication('myapplication', new Application(test, 'foo'));
    node.runInApplication('myapplication', function (msg) {
        this.method(msg);
    }, ['foo']);
};

exports['Run in Local Node using Node Name'] = function (test) {
    var node = mnode.createNode();
    node.runInNode(node.name, function () {
        test.ok(this);
        test.equal(this, node);
        test.done();
    });
};

exports['Run in Local Application using Node Name'] = function (test) {
    var node = mnode.createNode();
    node.registerApplication('myapplication', new Application(test, 'foo'));
    node.runInApplication(node.name, 'myapplication', function (msg) {
        this.method(msg);
    }, ['foo']);
};

exports['Run in Connected Local Node'] = function (test) {
    var node = mnode.createNode();
    var node2 = mnode.createNode();
    node2.connect(node);
    node2.runInNode(node.name, function (msg) {
        test.ok(msg);
        test.equal(msg, 'foo');
        test.ok(this);
        test.equal(this, node);
        test.done();
    }, ['foo']);
};

exports['Run in Application in Connected Local Node'] = function (test) {
    var node = mnode.createNode();
    node.registerApplication('myapplication', new Application(test, 'foo'));
    var node2 = mnode.createNode();
    node2.connect(node);
    node2.runInApplication(node.name, 'myapplication', function (msg) {
        this.method(msg);
    }, ['foo']);
};

exports['Run in Connected Remote Node'] = function (test) {
    test.expect(2);
    
    var node = mnode.createNode(3000);
    node.start();
    
    node.done = function (msg) {
        test.ok(msg);
        test.equal(msg, 'foo');
        node.stop();
        node2.stop();
        test.done();
    };
    
    var node2 = mnode.createNode();
    node2.connect(3000, function (msg) {
        node2.runInNode(node.name, function (msg) {
            this.done(msg);
        }, ['foo']);
    });
};

exports['Run in Application in Connected Remote Node'] = function (test) {
    test.expect(2);

    var node = mnode.createNode(3000);
    var app = new Application(test, 'foo');

    app.done = function () {
        node.stop();
        node2.stop();
    };

    node.registerApplication('myapplication', app);
    node.start();

    var node2 = mnode.createNode();

    node2.connect(3000, function (msg) {
        node2.runInApplication(node.name, 'myapplication', function (msg) {
            this.method(msg);
            this.done();
        }, ['foo']);
    });
};

function Application(test, expected) {
    this.method = function (arg) {
        test.ok(arg);
        test.equal(arg, expected);
        test.done();
    }

    this.process = function (msg) {
        test.ok(msg);
        test.equal(msg, expected);
        test.done();
    }
}

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
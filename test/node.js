
var mnode = require('..');

exports['Create Node'] = function (test) {
    var node = mnode.createNode();
    test.ok(node);
    test.done();
};

exports['Create Node and Get Empty Description'] = function (test) {
    var node = mnode.createNode();
    var description = node.getDescription();
    
    test.ok(description);
    test.ok(description.id);
    test.ok(description.services);
    test.ok(Array.isArray(description.services));
    test.equal(Object.keys(description.services).length, 0);
    
    test.done();
};

exports['Register Service'] = function (test) {
    var node = mnode.createNode();
    var myservice = { };
    node.registerService('myservice', myservice);

    var description = node.getDescription();
    
    test.ok(description);
    test.ok(description.id);
    test.ok(description.services);
    test.ok(Array.isArray(description.services));
    test.equal(Object.keys(description.services).length, 1);
    test.ok(description.services['myservice']);
    
    var servdesc = description.services['myservice'];
    
    test.equal(servdesc.name, 'myservice');
    test.equal(servdesc.service, myservice);    
    test.ok(servdesc.description);
    test.equal(typeof servdesc.description, 'object');
    test.equal(Object.keys(servdesc.description).length, 0);
    
    test.done();
};

exports['Register Service with Explicit Description'] = function (test) {
    var node = mnode.createNode();
    var myservice = { };
    node.registerService('myservice', myservice, { counter: 10 });

    var description = node.getDescription();
    
    test.ok(description);
    test.ok(description.id);
    test.ok(description.services);
    test.ok(Array.isArray(description.services));
    test.equal(Object.keys(description.services).length, 1);
    test.ok(description.services['myservice']);
    
    var servdesc = description.services['myservice'];
    
    test.equal(servdesc.name, 'myservice');
    test.equal(servdesc.service, myservice);    
    test.ok(servdesc.description);
    test.equal(typeof servdesc.description, 'object');
    test.equal(Object.keys(servdesc.description).length, 1);
    test.equal(servdesc.description.counter, 10);
    
    test.done();
};

exports['Register Service with Get Description'] = function (test) {
    var node = mnode.createNode();
    var myservice = {
        getDescription: function () {
            return { counter: 10 };
        }
    };

    node.registerService('myservice', myservice);

    var description = node.getDescription();
    
    test.ok(description);
    test.ok(description.id);
    test.ok(description.services);
    test.ok(Array.isArray(description.services));
    test.equal(Object.keys(description.services).length, 1);
    test.ok(description.services['myservice']);
    
    var servdesc = description.services['myservice'];
    
    test.equal(servdesc.name, 'myservice');
    test.equal(servdesc.service, myservice);    
    test.ok(servdesc.description);
    test.equal(typeof servdesc.description, 'object');
    test.equal(Object.keys(servdesc.description).length, 1);
    test.equal(servdesc.description.counter, 10);
    
    test.done();
};

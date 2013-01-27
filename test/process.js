
var mnode = require('..');

exports['Process Message for Service'] = function (test) {
    var node = mnode.createNode();
    node.registerService('service', new Service(test, 3));
    node.process({ service: 'service', message: 3 });
};

function Service(test, message) {
    this.process = function (msg) {
        test.ok(msg);
        test.equal(msg, message);
        test.done();
    };
}

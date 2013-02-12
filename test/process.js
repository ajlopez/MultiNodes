
var mnode = require('..');

exports['Process Message for Service'] = function (test) {
    var node = mnode.createNode();
    node.registerApplication('application', new Application(test, 3));
    node.process({ application: 'application', message: 3 });
};

function Application(test, message) {
    this.process = function (msg) {
        test.ok(msg);
        test.equal(msg, message);
        test.done();
    };
}


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

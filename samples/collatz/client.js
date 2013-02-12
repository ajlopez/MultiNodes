
var multinodes = require('../..');

var port = parseInt(process.argv[2]);
var serverport = parseInt(process.argv[3]);

function Collatz(node) {
    this.process = function (msg) {
        if (msg[0] === 1) {
            console.dir(msg);
            return;
		}
        
        var val = msg[0];
        
        if (val % 2)
            msg.unshift(val * 3 + 1);
        else
            msg.unshift(val / 2);
            
        if (Math.random() < 0.5) {
            node.tellToApplication('collatz', msg);
            return;
        }
        
        var nodes = node.getApplicationNodes('collatz');
        
        if (nodes && nodes.length) {
            try {
                nodes[Math.floor(Math.random() * nodes.length)].node.tellToApplication('collatz', msg);
                return;
            }
            catch (err) {}
        }
        
        node.tellToApplication('collatz', msg);
	};
}

var node = multinodes.createNode(port);

node.registerApplication('collatz', new Collatz(node));

node.start();
node.connect(serverport);

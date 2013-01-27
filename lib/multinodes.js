
var uuid = require('node-uuid'),
    util = require('util'),
    simplemessages = require('simplemessages'),
    events = require('events');
    
function RemoteNode(stream) {
    this.process = function (msg) {
        stream.write(msg);
    };
    
    this.remote = true;
    
    this.end = function () {
        stream.end();
    };
}

function Node() {
	events.EventEmitter.call(this);

    var id = uuid.v4();
    var services = {};
    var nodes = {};

    var self = this;

    this.getDescription = function () {
        return {
            id: id,
            services: services,
            server: local
        };
    };
    
    this.registerService = function (name, service, description) {
        if (!description) {
            if (service && service.getDescription)
                description = service.getDescription();
            else
                description = { };
        }
    
        services[name] = { name: name, service: service, description: description };
    };
    
    this.process = function (msg) {
        this.emit('data', msg);
        
        if (msg.service) {
            var serviceinfo = services[msg.service];

            if (serviceinfo) {
                serviceinfo.service.process(msg.message);
                return;
            }
            else {
                var ns = this.getNodes(msg.service);
                if (ns.length) {
                    var position = Math.floor(Math.random() * ns.length);
                    ns[position].node.process(msg);
                    return;
                }
            }
            
            return;
        }
    };
    
    this.registerNode = function (node, description) {
        var id = description.id;
        if (!nodes[id])
            nodes[id] = { id: id };
        nodes[id].info = description;
        nodes[id].node = node;
        this.emit('data', description);
    };
    
    this.connect = function (port, host, fn) {
        if (typeof port === 'object') {
            var node = port;
            node.registerNode(this, this.getDescription());
            this.registerNode(node, node.getDescription());
            return;
        }
        
        if (typeof host === 'function' && !fn) {
            fn = host;
            host = undefined;
        }
        
        var client = simplemessages.createClient(port, host, function () {
            client.write(self.getDescription());
            
            client.on('data', function (msg) {
                if (msg.id) {
                    var node = new RemoteNode(client);
                    self.registerNode(node, msg);

                    if (fn)
                        fn(client, msg);
            
                    return;
                }
                
                self.process(msg);
            });
        });        
    };
    
    this.getNodes = function (name, fn) {
        if (!name && !fn)
            return nodes;
            
        var result = [];
        
        for (var n in nodes) {
            var node = nodes[n];
            if (!name || node.info.services && node.info.services[name])
                if (!fn || fn(node.info.services[name].description))
                    result.push(node);
        };

        return result;
    };
    
    var clients = [];
    
    function addClient(client) {
        clients.push(client);
    }
    
    function removeClient(client) {
        var position = clients.indexOf(client);
        
        delete clients[position];
    }
    
    var server;
    var local;

    this.listen = function (port, host, fn) {
        if (typeof host === 'function' && !fn) {
            fn = host;
            host = undefined;
        }
        
        local = { port: port, host: host || 'localhost' };
        
        server = simplemessages.createServer(function (client) {
            client.write(self.getDescription());
            addClient(client);
            
            client.on('data', function (msg) {
                if (msg.id) {
                    var node = new RemoteNode(client);
                    self.registerNode(node, msg);
                    
                    if (fn)
                        fn(client, msg);
                    
                    return;
                }
                
                self.process(msg);
            });
            
            client.on('error', function () { removeClient(client); });
            client.on('close', function () { removeClient(client); });
        });
        
        server.listen(port, host);
    }
    
    this.stop = function () {
        if (server)
            server.close();
            
        for (var n in clients) {
            var client = clients[n];

            client.end();
        }
    }
}

util.inherits(Node, events.EventEmitter);

exports.createNode = function () {
	return new Node();
};



var uuid = require('node-uuid'),
    util = require('util'),
    events = require('events');

function Node() {
	events.EventEmitter.call(this);

    var id = uuid.v4();
    var services = [];
    var nodes = [];
    
    this.getDescription = function () {
        return {
            id: id,
            services: services
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
            serviceinfo.service.process(msg.message);
            return;
        }
        else if (msg.id) {
            if (!nodes[msg.id])
                nodes[msg.id] = { id: msg.id };
                
            nodes[msg.id].info = msg;
        }
    };
    
    this.connect = function (node) {
        node.process(this.getDescription());
        this.process(node.getDescription());
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
}

util.inherits(Node, events.EventEmitter);

exports.createNode = function () {
	return new Node();
};


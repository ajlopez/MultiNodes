
var uuid = require('node-uuid');

function Node() {
    var id = uuid.v4();
    var services = [];
    
    this.getDescription = function () {
        return {
            id: id,
            services: services
        };
    };
    
    this.registerService = function (name, service, description) {
        if (!description) {
            if (service.getDescription)
                description = service.getDescription();
            else
                description = { };
        }
    
        services[name] = { name: name, service: service, description: description };
    };
}

exports.createNode = function () {
	return new Node();
};


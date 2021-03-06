
var util = require('util'),
    simplemessages = require('simplemessages'),
    simplefunc = require('simplefunc');
    
// http://stackoverflow.com/questions/307179/what-is-javascripts-max-int-whats-the-highest-integer-value-a-number-can-go-t
var MAX_INTEGER = Math.pow(2, 53)
    
function RemoteNode(name, stream) {
    this.name = name;

    this.process = function (msg) {
        stream.write(msg);
    };
    
    this.remote = true;
    
    this.end = function () {
        stream.end();
    };

    this.callApplication = function (appname, action, args) {
        this.process({ application: appname, action: action, args: args });
    }
    
    this.tellToApplication = function (appname, msg) {
        this.process({ application: appname, message: msg });
    }
    
    this.runInNode = function (fn, args) {
        this.process({ fn: simplefunc.encode(fn), args: args });
    }
    
    this.runInApplication = function (appname, fn, args) {
        this.process({ application: appname, fn: simplefunc.encode(fn), args: args });
    }
}

function Node(port, host) {
    var name;
    
    if (!port)
        name = 'node' + Math.floor(MAX_INTEGER * Math.random());
    else if (typeof port === 'string') {
        name = port;
        port = undefined;
        host = undefined;
    }
    else
        name = (host || 'localhost') + ':' + port;

    this.name = name;
    var applications = {};
    var nodes = {};

    var self = this;

    this.getDescription = function () {
        return {
            name: this.name,
            applications: getApplicationDescriptions(),
            nodes: getNodeNames()
        };
    };
    
    this.registerApplication = function (name, application, description) {
        applications[name] = { name: name, application: application, description: description };
    };
    
    function getApplicationDescriptions() {
        var result = {};
        
        for (var n in applications) {
            var application = applications[n];
            result[n] = { name: application.name, description: application.description };
        }
        
        return result;
    }
    
    function getNodeNames() {
        var result = [];
        
        for (var n in nodes)
            result.push(n);
        
        return result;
    }
    
    this.processInNode = function (nodename, msg) {
        nodes[nodename].node.process(msg);
    };
    
    this.process = function (msg, client) {
        if (msg.name) {
            var node = new RemoteNode(msg.name, client);
            this.registerNode(msg.name, node, msg);
            name = msg.name;
            return;
        }
        
        if (msg.application) {
            var applicationinfo = applications[msg.application];

            if (applicationinfo) {
                var application = applicationinfo.application;
                
                if (msg.fn) {
                    var fn = simplefunc.decode(msg.fn);
                    fn.apply(application, msg.args);
                    return;
                }
                if (msg.message) {
                    application.process(msg.message);
                    return;
                }
                if (msg.action) {
                    application[msg.action].apply(application, msg.args);
                    return;
                }
            }
            else {
                var ns = this.getApplicationNodes(msg.application);
                if (ns.length) {
                    var position = Math.floor(Math.random() * ns.length);
                    ns[position].node.process(msg);
                    return;
                }
            }
            
            return;
        }
        
        if (msg.fn) {
            var fn = simplefunc.decode(msg.fn);
            fn.apply(this, msg.args);
        }
    };
    
    this.registerNode = function (name, node, description) {
        if (!nodes[name])
            nodes[name] = { name: name };

        nodes[name].info = description;
        nodes[name].node = node;

        for (var n in description.nodes) {
            var nodename = description.nodes[n];
            if (nodes[nodename] || nodename === this.name)
                continue;
            var position = nodename.indexOf(':');
            
            if (position > 0) {
                var host = nodename.substring(0, position);
                var port = parseInt(nodename.substring(position + 1));
                this.connect(port, host);
            }
        }
    };
    
    this.unregisterNode = function (name) {
        if (name)
            delete nodes[name];
    };

    this.runInNode = function (name, fn, args) {
        if (typeof name === 'function') {
            args = fn;
            fn = name;
            name = undefined;
        }
        
        if (!name || name === this.name)
            fn.apply(this, args);
        else
            nodes[name].node.runInNode(fn, args);
    };
    
    this.runInApplication = function (nodename, appname, fn, args) {
        if (typeof appname === 'function') {
            args = fn;
            fn = appname;
            appname = nodename;
            nodename = undefined;
        }
        
        if (!nodename || nodename == this.name)
            fn.apply(applications[appname].application, args);
        else
            nodes[nodename].node.runInApplication(appname, fn, args);
    };
    
    this.connect = function (port, host, fn) {
        if (typeof port === 'object') {
            var node = port;
            node.registerNode(this.name, this, this.getDescription());
            this.registerNode(node.name, node, node.getDescription());
            return;
        }
        
        if (typeof host === 'function' && !fn) {
            fn = host;
            host = undefined;
        }
        
        var client = simplemessages.createClient(port, host, function () {
            client.write(self.getDescription());
            addClient(client);
            
            var name;
            
            client.on('data', function (msg) {
                self.process(msg, client);
                
                if (msg.name && fn)
                    fn(msg);
            });

            client.on('error', function (err) { removeClient(client); self.unregisterNode(name); });
            client.on('end', function () { removeClient(client); self.unregisterNode(name); });
            client.on('close', function () { removeClient(client); self.unregisterNode(name); });
        });        
    };
    
    this.getApplicationNodes = function (appname, fn) {
        var result = [];
        
        for (var n in nodes) {
            var node = nodes[n];
            if (node.info.applications && node.info.applications[appname])
                if (!fn || fn(node.info.applications[appname].description))
                    result.push({ name: n, node: node.node, description: node.info.applications[appname].description });
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

    this.start = function (fn) {
        server = simplemessages.createServer(function (client) {
            client.write(self.getDescription());
            addClient(client);
            
            var name;
            
            client.on('data', function (msg) {
                self.process(msg, client);
                
                if (fn && msg.name)
                    fn(msg);
            });
            
            client.on('error', function (err) { removeClient(client); self.unregisterNode(name); });
            client.on('end', function () { removeClient(client); self.unregisterNode(name); });
            client.on('close', function () { removeClient(client); self.unregisterNode(name); });
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
    
    this.callApplication = function (appname, action, args) {
        this.process({ application: appname, action: action, args: args });
    }
    
    this.tellToApplication = function (appname, msg) {
        this.process({ application: appname, message: msg });
    }
}

exports.createNode = function (port, host) {
	return new Node(port, host);
};


if (typeof Object.create !== 'function') {

	Object.create = function (o) {
		var F = function () {};
		F.prototype = o;
		return new F();
	};	
}

Function.prototype.method = function (name, func) {
	this.prototype[name] = func;
	return this;
};

/* Publisher */
var publisher = {

	subscribers: {
		any : []
	},
	
	subscribe : function (fn, type) {
		type = type || 'any';
		if (typeof this.subscribers[type] === "undefined") {
			this.subscribers[type] = [];
		}
		this.subscribers[type].push(fn);
	},
	
	unsubscribe : function (fn, type) {
		this.visitSubscribers('unsubscribe', fn, type);
	},
	
	publish : function (pubblication, type) {
		this.visitSubscribers('publish', pubblication, type);
	},
	
	visitSubscribers : function (action, arg, type) {
		var pubtype = type || 'any';
		var subscribers = this.subscribers[pubtype];
		var i;
		var max = subscribers.length;
		
		for (i = 0; i < max; i++) {
			if (action === 'publish') {
				subscribers[i](arg);
			} else {
				if (subscribers[i] === arg) {
					subscribers.splice(i, 1);
				}
			}
		}
		
	}
};

function makePublisher(o) {
	var i;
	for (i in publisher) {
		if (publisher.hasOwnProperty(i) && typeof publisher[i] === "function") {
			o[i] = publisher[i];
		}
	}
	o.subscribers = {any : []};
}
/*********************/
/* Collision Manager */
/*********************/

//A classic collision manager, which uses 'collidable' objects as inputs
// and check their bounding boxes.
// Events are fired on collision, returning the objects which collided

var CollisionEvent = {
	obj1 : null,
	obj2 : null
};

var Collidable = {
	x : 0,
	y : 0,
	width : 0,
	height : 0
};

function makeCollidable(o) {
	var i;
	for (i in Collidable) {
		if (Collidable.hasOwnProperty(i) && typeof Collidable[i] === "function") {
			o[i] = Collidable[i];
		}
	}
}

var CollisionManager = (function () {

	var my = {};
	my.prototype = new gameComponent();
	
	makePublisher(my);
	
	var events = [];
	var collidables = [];
	
	my.method('init', function () {});
	
	my.method('update', function () {
		
		for (var i = 0; i < collidables.length; i++) {
			for (var j = 1; j < collidables.length; j++) {
				
				if (collidables[i] !== collidables[j]) {
					res = boundingBoxCollide(collidables[i],collidables[j])
					if (res != null) {
						events.push(res);
					}
				}
			}
		}
		
		// risolve overlapping (?)
		// we don't fire as soon as the collision is detected, but we wait to collect all collisions
		// this allows us to implement a more complex collision solver in the future
		
		// fire events to listeners
		l = events.length-1;
		for (var i = l; i >= 0; l--) {
			publish(events[i]);
			events.splice(i,1);
		}
		
	});
	
	my.method('reset', function () {
		l = events.length-1;
		for (var i = l; i >= 0; l--) {
			events.splice(i,1);
		}
		l = collidables.length-1;
		for (var i = l; i >= 0; l--) {
			collidables.splice(i, 1);
		}
	});
	
	my.method('dispose', function () {
		reset();
	});
	
	my.method('addCollidable', function (c) {
		collidables.push(c);
	});
	
	my.method('removeCollidable', function (c) {
		for (i = 0; i < collidables.length; i++) {
			if (collidables[i] === c) {
				collidables.splice(i, 1);
				break;
			}
		}
	});
	
	return my;

} ());

var boundingBoxCollide = function (object1, object2) {
	var left1 = object1.x;
	var left2 = object2.x;
	var right1 = object1.x + object1.width;
	var right2 = object2.x + object2.width;
	var top1 = object1.y;
	var top2 = object2.y;
	var bottom1 = object1.y + object1.height;
	var bottom2 = object2.y + object2.height;
	
	if (bottom1 < top2)
		return null;
	if (top1 > bottom2)
		return null;
	if (right1 < left2)
		return null;
	if (left1 > right2)
		return null;
		
	return ({
		obj1 : object1,
		obj2 : object2
	});
};

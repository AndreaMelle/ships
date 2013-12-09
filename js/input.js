
var InputManager = function () {
	var keyEvents = [];
};

makePublisher(InputManager);

InputManager.method('init', function () {
	
	document.onkeydown = function (e) {
		e = e ? e : window.event;
		
		keyEvents.push({
			keyCode : e.keyCode,
			pressed : true 
		});
	};
	
	document.onkeyup = function (e) {
		e = e ? e : window.event;
		keyEvents.push({
			keyCode : e.keyCode,
			pressed : false 
		});
	};
	
});

InputManager.method('update', function () {
	var keyEventsLength = keyEvents.length - 1;
	
	for (var keyEventsCtr = keyEventsLength; keyEventsCtr >= 0; keyEventsCtr--) {
		keyEvent = particles[keyEventsCtr];
		this.publish({
			keyCode : keyEvent.keyCode,
			pressed : keyEvent.pressed
		});
	
		keyEvents.splice(keyEventsCtr,1);
		keyEvents = null;
	}
});

InputManager.method('dispose', function () {
	document.onkeydown = null;
	document.onkeyup = null;
});
		
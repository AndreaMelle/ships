/* consoleLog singleton */
var ConsoleLog = (function () {

	var my = {}
	
	my.log = function (message) {
		if(typeof(console) !== 'undefined' && console != null) {
			console.log(message);
		}
	};
	
	return my;

}());

/* FrameRateCounter singleton */
var FrameRateManager = (function () {
	
	var my = {};
	
	var lastFrameCount = 0;
	var dateTemp = new Date();
	var frameLast = dateTemp.getTime();
	delete dateTemp;
	var frameCtr = 0;
	
	const FRAME_RATE = 40;
	var intervalTime = 1000 / FRAME_RATE;
	
	my.frameRate = FRAME_RATE;
	my.intervalTime = intervalTime;
	
	my.countFrames = function () {
		var dateTemp = new Date();
		frameCtr++;
		
		if (dateTemp.getTime() >= frameLast + 1000) {
			ConsoleLog.log("frame event");
			lastFrameCount = frameCtr;
			frameLast = dateTemp.getTime();
			frameCtr = 0;
		}
		
		delete dateTemp;
	};
	
	return my;
	
}());

/* Graphics context singleton */

var Context = (function () {

	var my = {};
	
	var _canvas;
	var context = null;
	var isInit = false;
	var xMin = 0;
	var xMax = 400;
	var yMin = 0;
	var yMax = 400;
	
	my.xMin = function () {
		return xMin;
	};
	
	my.xMax = function () {
		return xMax;
	};
	
	my.yMin = function () {
		return yMin;
	};
	
	my.yMax = function () {
		return yMax;
	};
	
	my.init = function () {
		_canvas = document.getElementById('canvas');
		if (!_canvas || !_canvas.getContext) {
			console.log('No canvas found.');
			return null;
		}
	
		context = _canvas.getContext("2d");
	
		if (!context) {
			console.log('No context found.');
			return null;
		}
		
		isInit = true;
		return context;
	};
	
	my.get = function () {
		if (isInit) {
			return context;
		} else {
			return null;
		}
	};
	
	return my;

}());

/* Base game object */
var gameComponent = function () {
	this.toDispose = false;
};

gameComponent.method('init', function () {});
gameComponent.method('update', function () {});
gameComponent.method('draw', function (context) {});
gameComponent.method('reset', function () {});
gameComponent.method('dispose', function () {});
gameComponent.method('setToDispose', function (value) {
	this.toDispose = value;
});
gameComponent.method('getToDispose', function (value) {
	return this.toDispose;
});





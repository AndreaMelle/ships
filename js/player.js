var Player = function () {
	this.extraShipAtEach = 10000;
	this.width = 20;
	this.height = 20;
	this.thrustAcceleration = 0.05;
	this.maxVelocity = 5;
	this.rotationalVelocity = 5; // not used anymore??
	this.missileFrameDelay = 5;
	this.halfWidth = this.width / 2;
	this.halfHeight = this.height / 2;
};

Player.prototype = new gameComponent();

Player.method('init', function () {
	this.score = 0;
	this.lives = 3;
	this.extraShipsEarned = 0;
	this.isDead = false;
	CollisionManager.subscribe(this.onCollision);
	this.reset();
});

Player.method('reset', function () {
	this.x = 0.5 * Context.xMax();
	this.y = 0.5 * Context.yMax();
	this.rotation = 270;
	this.scale = 1;
	this.facingX = 0;
	this.facingY = 0;
	this.movingX = 0;
	this.movingY = 0;
	this.alpha = -0.01;
	this.thrust = 0; //0 = static, 1 = thrust
	this.isHit = false;
	this.missileFrameCount = 0;
	var missiles = [];
});

Player.method('dispose', function () {
	this.reset();
	CollisionManager.unsubscribe(this.onCollision);
});

Player.method('update', function () {

	this.checkForExtraShip();

	this.missileFrameCount++;
	this.x += this.movingX;
	this.y += this.movingY;
	
	if (this.x > Context.xMax()) {
		this.x =- this.width;
	} else if (this.x < -this.width) {
		this.x = Context.xMax();
	}
	
	if (this.y > Context.yMax()) {
		this.y =- this.height;
	} else if (this.y < -this.height) {
		this.y = Context.yMax();
	}
	
	var temp = null;
	var l = missiles.length - 1;
	for (var i = l; i >= 0; i--) {
		temp = missiles[i];
		temp.update();
		if (temp.getToDispose()) {
			missiles.splice(i,1);
			temp.dispose();
			temp = null;
		}
	}
});

Player.method('draw', function (context) {
	var angleInRadians = this.rotation * Math.PI / 180;
	context.save();
	context.setTransform(1,0,0,1,0,0);
	context.translate(this.x + this.halfWidth, this.y + this.halfHeight);
	context.rotate(angleInRadians);
	context.scale(this.scale, this.scale);
	context.strokeStyle = '#ffffff';
	context.beginPath();
	context.moveTo(-10,-10);
	context.lineTo(10,0);
	context.moveTo(10,1);
	context.lineTo(-10,10);
	context.lineTo(1,1);
	context.moveTo(1,-1);
	context.lineTo(-10,-10);
	
	if (this.thrust == 1 && this.scale == 1) {
		context.moveTo(-4,-2);
		context.lineTo(-4,1);
		context.moveTo(-5,-1);
		context.lineTo(-10,-1);
		context.moveTo(-5,0);
		context.lineTo(-10,0);
	}
	
	context.stroke();
	context.closePath();
	context.restore();
	
	for (var i = 0; i < missiles.length; i++) {
		missiles[i].draw(context);
	}
}
	
});

Player.method('onCollision', function(event) {

	var myCollision = false;

	if (typeof event.obj1 === 'PlayerMissile') {
		for (var i = 0; i < missiles.length; i++) {
			if (event.obj1 === missiles[i]) {
				obj1.dead(true);
				myCollision = true;
				break;
			}
		}
	}
	if (typeof event.obj2 === 'PlayerMissile') {
		for (var i = 0; i < missiles.length; i++) {
			if (event.obj2 === missiles[i]) {
				obj2.dead(true);
				myCollision = true;
				break;
			}
		}
	}
	
	if (event.obj1 === this) {
		this.hit(true);
		myCollision = true;
	}
	if (event.obj2 === this) {
		this.hit(true);
		myCollision = true;
	}
	
	if (myCollision && (typeof event.obj1 === 'Saucer' || typeof event.obj1 === 'Rock')) {
		this.addToScore(obj1.score);
	}
	if (myCollision && (typeof event.obj2 === 'Saucer' || typeof event.obj2 === 'Saucer')) {
		this.addToScore(obj2.score);
	}
});

Player.method('thrustOn', function () {
	var angleInRadians = this.rotation * Math.PI / 180;
	this.facingX = Math.cos(angleInRadians);
	this.facingY = Math.sin(angleInRadians);
	var movingXNew = this.movingX + this.thrustAcceleration * this.facingX;
	var movingYNew = this.movingY + this.thrustAcceleration * this.facingY;
	var currentVelocity = Math.sqrt((movingXNew * movingXNew) + (movingYNew * movingYNew));
	
	if (currentVelocity < this.maxVelocity) {
		this.movingX = movingXNew;
		this.movingY = movingYNew;
	}
	
	this.thrust = true;
});

Player.method('thrustOff', function () {	
	this.thrust = false;
});

Player.method('rotateCCW', function () {
	this.rotation -= this.rotationalVelocity;
});

Player.method('rotateCW', function () {
	this.rotation += this.rotationalVelocity;
});

Player.method('fireMissile', function () {
	if (this.missileFrameCount > this.missileFrameDelay) {
		var p = new ShipMissile();
		p.init(this.x, this.y, this.width, this.height, this.rotation);
		this.missiles.push(p);
		this.missileFrameCount = 0;
	}
});

Player.method('addToScore', function (value) {
	score += value;
});

Player.method('checkForExtraShip', function () {
	if (Math.floor(this.score / this.extraShipAtEach) > this.extraShipsEarned) {
		this.lives++;
		this.extraShipsEarned++;
	}
});

Player.method('dead', function(value) {
	this.isDead = value;
	this.setToDispose(value);
});

Player.method('hit', function() {
	this.isHit = true;
	this.lives--;
	if (this.lives < 1) {
		this.dead(true);
	}
});
			
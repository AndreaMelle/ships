/********/
/* Rock */
/********/

var Rock = function (rockType, score, scale) {
	this.score = score;
	this.scale = scale;
	this.rockType = rockType;
	this.maxSpeed = 0;
	this.isHit = false;
	this.isDead = false;
};

Rock.prototype = new gameComponent();
makeCollidable(Rock);

Rock.method('init', function (maxSpeed, x, y) {

	this.width = Math.ceil(50 / this.scale);
	this.height = Math.ceil(50 / this.scale);
	
	this.halfWidth = this.width / 2;
	this.halfHeight = this.height / 2;
	
	this.maxSpeed = maxSpeed;
	this.dx = (Math.random()*2) + this.maxSpeed;
	this.dy = (Math.random()*2) + this.maxSpeed;
	
	if (Math.random()<.5) {
		this.dx*=-1;
	}
	
	if (Math.random()<.5) {
		this.dy*=-1;
	}
	
	this.rotationInc = (Math.random()*5)+1;
	if (Math.random()<.5) {
		this.rotationInc*=-1;
	}
	
	if (typeof x != 'undefined' && typeof y != 'undefined') {
		this.x = x;
		this.y = y;		
	} else {
		this.x = Math.floor(Math.random()*50);
		this.y = Math.floor(Math.random()*50);
	}
	
	CollisionManager.addCollidable(this);
	
});

Rock.method('update', function () {
	this.x += this.dx;
	this.y += this.dy;
	this.rotation += this.rotationInc;
	
	if (this.x > Context.xMax()) {
		this.x = Context.xMin() - this.width;
	} else if (this.x < Context.xMin() - this.width) {
		this.x = Context.xMax();
	}
	
	if (this.y > Context.yMax()) {
		this.y = Context.yMin() - this.width;
	} else if (this.y < Context.yMin() - this.width) {
		this.y = Context.yMax();
	}
});

Rock.method('draw', function (context) {
	var angleInRadians = this.rotation * Math.PI / 180.0;
	context.save();
	context.setTransform(1,0,0,1,0,0);
	context.translate(this.x + this.halfWidth, this.y + this.halfHeight);
	context.rotate(angleInRadians);
	context.strokeStyle = '#ffffff';
	context.beginPath();
	context.moveTo(-(this.halfWidth-1),-(this.halfHeight-1));
	context.lineTo((this.halfWidth-1),-(this.halfHeight-1));
	context.lineTo((this.halfWidth-1),(this.halfHeight-1));
	context.lineTo(-(this.halfWidth-1),(this.halfHeight-1));
	context.lineTo(-(this.halfWidth-1),-(this.halfHeight-1));
	context.stroke();
	context.closePath();
	context.restore();
});

Rock.method('hit', function(value) {
	this.isHit = value;
});

Rock.method('dead', function(value) {
	this.isDead = value;
	this.setToDispose(value);
});

Rock.method('dispose', function() {
	CollisionManager.removeCollidable(this);
});

/************/
/* Particle */
/************/

var Particle = function () {
	this.isDead = false;
	this.lifeCtr = 0;
};

Particle.prototype = new gameComponent();

Particle.method('init', function (x,y) {
	
	this.dx = Math.random() * 3;
	
	if (Math.random() < 0.5){
		this.dx *= -1;
	}
	
	this.dy = Math.random()*3;
	
	if (Math.random() < 0.5) {
		this.dy *= -1;
	}
	
	this.life = Math.floor(Math.random() * 30 + 30);
	
	this.x = x;
	this.y = y;
});

Particle.method('update', function () {
	this.x += this.dx;
	this.y += this.dy;
	this.lifeCtr++;
	
	if (this.lifeCtr > this.life) {
		this.dead(true);
	} else if ((this.x > Context.xMax()) || (this.x < Context.xMin()) || (this.y > Context.yMax()) || (this.y < Context.yMin())) {
		this.dead(true);
	}
});

Particle.method('draw', function (context) {
	context.save();
	context.setTransform(1,0,0,1,0,0);
	context.translate(this.x, this.y);
	context.strokeStyle = '#ffffff';
	context.beginPath();
	context.moveTo(0,0);
	context.lineTo(1,1);
	context.stroke();
	context.closePath();
	context.restore();
});

Particle.method('dead', function(value) {
	this.isDead = value;
	this.setToDispose(value);
});

//Particle.method('reset', function () {});

/*****************/
/* World Manager */
/*****************/

// The World Manager is responsible to manage rocks and other non-intelligent elements
var WorldManager = (function () {

	var my = {};
	my.prototype = new gameComponent();
	
	var scoreRockL = 50;
	var scoreRockM = 75;
	var scoreRockS = 100;

	var scaleRockL = 1;
	var scaleRockM = 2;
	var scaleRockS = 4;
	
	var rocks = [];
	var particles = [];
	
	var rockMaxSpeed = 0;
	
	var spanRock = function (type, speed, x, y) {
		
		var r = null;
		
		switch (type) {
			case WorldManager.ROCK_LARGE:
				r = new Rock(WorldManager.ROCK_LARGE,scoreRockL,scaleRockL);
				break;
			case WorldManager.ROCK_MEDIUM:
				r = new Rock(WorldManager.ROCK_MEDIUM,scoreRockM,scaleRockM);
				break;
			case WorldManager.ROCK_SMALL:
				r = new Rock(WorldManager.ROCK_SMALL,scoreRockS,scaleRockS);
				break;
			default:
				throw { name : 'TypeError', message : 'Rock type unknown' };	
		}
		
		if (r != null) {
			r.init(speed,x,y);
			rocks.push(r);
		}
		
		return r;
	};
	
	var splitRock = function (rock) {
	
		newRockType = null;
		newRockNum = null;
		
		switch (rock.rockType) {
			case WorldManager.ROCK_LARGE:
				newRockType = WorldManager.ROCK_MEDIUM;
				newRockNum = 2;
				break;
			case WorldManager.ROCK_MEDIUM:
				newRockType = WorldManager.ROCK_SMALL;
				newRockNum = 2;
				break;
			case WorldManager.ROCK_SMALL:
				newRockNum = 0;
				break;
			default:
				throw { name : 'TypeError', message : 'Rock type unknown' };	
		}
	
		for (var i = 0; i < newRockNum; i++){
			var r = spanRock(newRockType,rock.maxSpeed,rock.x,rock.y);
			r.dx = Math.random() * 3;
			r.dy = Math.random() * 3;
		}
		
		spanParticles(rock.x + rock.halfWidth, rock.y + rock.halfHeight, 10);
		rock.dead(true);
	};
	
	my.method('init', function () {
		CollisionManager.subscribe(WorldManager.onCollision);
	});
	
	my.method('onCollision', function (event) {
		if (typeof event.obj1 === 'Rock') {
			event.obj1.hit(true);
		}
		if (typeof event.obj2 === 'Rock') {
			event.obj2.hit(true);
		}
	};
	
	my.method('update', function () {
		
		var temp = null;
		var l = rocks.length - 1;
		for (var i = l; i >= 0; i--) {
			temp = rocks[i];
			if (temp.isHit) {
				splitRock(temp);
			}
			temp.update();
			
			if (temp.getToDispose()) {
				rocks.splice(i,1);
				temp.dispose();
				temp = null;	
			}
		}
		
		temp = null;
		l = particles.length-1;
		for (var i = l; i >= 0; l--) {
			temp = particles[i];
			temp.update();
			
			if (temp.getToDispose()) {
				particles.splice(i,1);
				temp.dispose();
				temp = null;	
			}
		}
	});
	
	my.method('draw', function (context) {
		for (var i = 0; i < rocks.length; i++) {
			rocks[i].draw(context);
		}
		
		for (var i = 0; i < particles.length; i++) {
			particles[i].draw(context);
		}
	});
	
	my.method('reset', function () {});
	
	my.method('dispose', function () {
		var temp = null;
		var l = rocks.length - 1;
		for (var i = l; i >= 0; i--) {
			temp = rocks[i];
			rocks.splice(i,1);
			temp.dispose();
			temp = null;
		}
		temp = null;
		l = particles.length-1;
		for (var i = l; i >= 0; l--) {
			temp = particles[i];
			particles.splice(i,1);
			temp.dispose();
			temp = null;
		}
		CollisionManager.unsubscribe(WorldManager.onCollision);
	});
	
	my.method('spanRocks', function (num, type) {
		for (var i = 0; i < num; i++) {
			WorldManager.spanRock(type,rockMaxSpeed);
		}
	});
	
	my.method('spanParticles', function (x,y,num) {
		for (var i = 0; i < num; i++) {
			var p = new Particle();
			p.init(x,y);
			particles.push(p);
		}
	});
	
	my.method('setRockMaxSpeed', function (value) {
		this.rockMaxSpeed = value;
	});
	
	my.method('getNumRocks', function () {
		return this.rocks.length;
	});
	
	my.ROCK_LARGE = 1;
	my.ROCK_MEDIUM = 2;
	my.ROCK_SMALL = 3;
	
	return my;

} ());


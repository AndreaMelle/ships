/**************/
/* Level Data */
/**************/

// a level data object makes it easy to manage generative and loaded from file levels as well.
var LevelData = {
	levelNum : 0,
	saucerData : {
		score : 300,
		speed : 1,
		fireDelay : 300,
		fireRate : 30,
		missileSpeed : 1,
		max : 1,
		occurrenceRate : 25
	},
	rockData : {
		maxSpeedAdjust : 1,
		maxSpeed : 0,
		numRocks : 0
	}
};

// Generative
var generateLevelParameters = function(level) {

	var levelData = new LevelData();

	levelData.levelNum = level;
	levelData.rockData.maxSpeedAdjust = level * .25;
	levelData.rockData.maxSpeed = min(3 ,levelData.rockData.maxSpeedAdjust);
	levelData.rockData.numRocks = level + 3;
	levelData.saucerData.max = min(1 + Math.floor(level/10) , 5);
	levelData.saucerData.occurrenceRate = min(10 + 3 * level , 35);
	levelData.saucerData.speed = min(1 + 0.5 * level , 5);
	levelData.saucerData.fireDelay = min(120 - 10 * level , 20);
	levelData.saucerData.fireRate = min(20 + 3 * level , 50);
	levelData.saucerData.missileSpeed = min(1 + 0.2 * level , 4);
	
	return levelData;
};

//TODO: from file
var loadLevelParameters = function (file) {
	return null;
};

/*********/
/* Level */
/*********/

var Level = function () {
	this.player = null;
	this.runnable = null;
	this.levelData = null;
	this.background = null;
	this.scoreboard = null;
};

makePublisher(Level);

Level.method('init', function (player, level) {
	
	this.levelData = generateLevelParameters(level);
	this.player = player;
	
	WorldManager.setRockMaxSpeed(levelData.rockData.maxSpeed);
	EvilManager.setSaucerParams(levelData.saucerData);

	WorldManager.reset();
	EvilManager.reset();
	this.player.reset();
	
	WorldManager.spanRocks(levelData.rockData.numRocks, WorldManager.ROCK_LARGE);
	
	this.background = new Background();
	this.scoreboard = new Scoreboard(player.score, player.lives, FrameRateManager.countFrames());
	this.background.init();
	this.scoreboard.init();
	
	this.runnable = this.intro;
});

Level.method('dispose', function () {
	this.background.dispose();
	this.scoreboard.dispose();
	this.background = null;
	this.scoreboard = null;
});

Level.method('run', function () {
	this.runnable();
});

Level.method('intro', function () {
	if (this.ship.alpha < 1) {
		this.alpha += .02;
		Context.get().globalAlpha = this.ship.alpha;
	} else {
		this.runnable = this.gameLoop();
		return;
	}
	
	this.player.update();
	Context.get().globalAlpha = 1;
	
	this.player.draw(Context.get());
	
	WorldManager.update();
	
	this.background.draw(Context.get());
	WorldManager.draw(Context.get());
	//this.scoreboard.draw(Context.get());
});

Level.method('outro', function () {
	if (particles.length >0 || playerMissiles.length>0) {
		WorldManager.update();
		EvilManager.update();
		
		this.background.draw(Context.get());
		WorldManager.draw(Context.get());
		EvilManager.draw(Context.get());
		//this.scoreboard.draw(Context.get());
		
		this.player.update();
		this.player.draw();
	} else {
		if (this.player.isDead) {
			this.publish(GameController.GAME_STATE_GAME_OVER);
		} else {
			this.player.reset();
			this.runnable = this.intro();
			return;
		}
	}
});

Level.method('gameLoop', function () {

	this.background.update();
	
	if(this.player.isHit) {
		WorldManager.spanParticles(this.player.x + this.player.halfWidth, this.player.y + this.player.halfWidth, 50);
		this.runnable = this.outro();
		return;
	}
	
	checkCollisions();
	
	this.player.update();
	EvilManager.update();
	WorldManager.update();
	
	if (WorldManager.getNumRocks() == 0) {
		this.publish(GameController.GAME_STATE_NEW_LEVEL);
	}
	
	this.scoreboard.setScoreInfo(player.score);
	this.scoreboard.setLifeInfo(player.lives);
	this.scoreboard.setFramerateInfo(frameRateCounter.countFrames());
	this.scoreboard.update();
	
	this.background.draw(Context.get());
	WorldManager.draw(Context.get());
	EvilManager.draw(Context.get());
	this.player.draw(Context.get());
	this.scoreboard.draw(Context.get());
});

Level.method('onKey', function (e) {
	if (keyPressList[38]==true){
		NODES.ship.thrustOn();
	} else {
		NODES.ship.thrustOff();
	}
	
	if (keyPressList[37]==true) {
		NODES.ship.rotateCCW();
	}
	
	if (keyPressList[39]==true) {
		NODES.ship.rotateCW();
	}
	
	if (keyPressList[32]==true) {
		NODES.ship.fireMissile();
	}
});
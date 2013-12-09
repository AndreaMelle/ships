var Stage = function () {};
makePublisher(Stage);
Stage.method('init', function () {});
Stage.method('run', function () {});
Stage.method('dispose', function (context) {});

/* Title stage */

var TitleStage = function () {
	this.background = null;
};

TitleStage.prototype = new Stage();

TitleStage.method('init', function () {
	this.background = new Background();
	this.background.init();
});

TitleStage.method('dispose', function (context) {
	this.background.dispose();
	this.background = null;
});

TitleStage.method('run', function () {

	this.background.update();
	this.background.draw(Context.get());
	
	setTextStyle();
	context.fillText ("Geo Blaster Basic", 130, 70);
	context.fillText ("Press Space To Play", 120, 140);
});

TitleStage.method('onKey', function(e) {
	if (e.keyCode == 32 && e.pressed) {
		ConsoleLog.log("space pressed");
		this.publish(GameController.GAME_STATE_NEW_GAME);
	}
});

/* GameOver stage */

var GameOver = function () {
	this.background = null;
};

GameOver.prototype = new Stage();

GameOver.method('init', function () {
	this.background = new Background();
	this.background.init();
});

GameOver.method('dispose', function (context) {
	this.background.dispose();
	this.background = null;
});

GameOver.method('run', function () {

	this.background.update();
	this.background.draw(Context.get());
	
	//TODO: renderScoreBoard();
	setTextStyle();
	context.fillText ("Game Over!", 150, 70);
	context.fillText ("Press Space To Play", 120, 140);
});

GameOver.method('onKey', function(e) {
	if (e.keyCode == 32 && e.pressed) {
		ConsoleLog.log("space pressed");
		this.publish(GameController.GAME_STATE_TITLE);
	}
});

/* Game stage */

var GameStage = function () {
	this.player = null;
	this.currentLevel = null;
	this.currentLevelNumber = 0;
};

GameStage.prototype = new Stage();

GameStage.method('init', function () {
	this.player = new Player();
	this.currentLevel = new Level();
	this.currentLevel.subscribe(this.onLevelStateChangeEvent);
	this.player.init();
	this.nextLevel();
});

GameStage.method('dispose', function (context) {
	this.currentLevel.unsubscribe(this.onLevelStateChangeEvent);
	this.currentLevel.dispose();
	this.player.dispose();
});

GameStage.method('nextLevel', function () {
	this.currentLevelNumber++;
	this.currentLevel.unsubscribe(this.onLevelStateChangeEvent);
	this.currentLevel.dispose();
	this.currentLevel = new Level();
	this.currentLevel.subscribe(this.onLevelStateChangeEvent);
	this.currentLevel.init(this.player, this.currentLevelNumber);
});

GameStage.method('run', function () {
	this.currentLevel.run();
});

GameStage.method('onLevelStateChangeEvent', function (event) {
	if (event == GameController.GAME_STATE_GAME_OVER) {
		this.publish(GameController.GAME_STATE_GAME_OVER);
	} else if (event == GameController.GAME_STATE_NEW_LEVEL) {
		this.nextLevel();
	}
});

GameStage.method('onKey', function(e) {
	if(this.currentLevel) {
		this.currentLevel.onKey(e);
	}
});
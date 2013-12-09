/* The application singleton, managing the states */

var GameController = (function () {
	
	var my = {};
	
	my.GAME_STATE_TITLE = 0;
	my.GAME_STATE_NEW_GAME = 1;
	my.GAME_STATE_GAME_OVER = 2;
	
	var currentGameState = 0;
	var currentStage = null;
	var inputManager = null;
	
	function replaceStage(nextStage) {
		var oldStage = currentStage;
		
		nextStage.init();
		inputManager.subscribe(nextStage.onKey);
		nextStage.subscribe(GameController.onGameStateChangeEvent);
		currentStage = nextStage;
		
		if (oldStage) {
			oldStage.dispose();
			inputManager.unsubscribe(oldStage.onKey);
			oldStage.unsubscribe(GameController.onGameStateChangeEvent);
			oldStage = null; 
		}
	}
	
	my.method('onGameStateChangeEvent', function (event) {
		switchGameState(event);
	}
	
	function switchGameState (newState) {
		currentGameState = newState;
		switch (currentGameState) {
			case GameController.GAME_STATE_TITLE:
				replaceStage(new TitleStage());
				break;
			case GameController.GAME_STATE_NEW_GAME:
				replaceStage(new GameStage());
				break;
			case GameController.GAME_STATE_GAME_OVER:
				replaceStage(new GameOverStage());
				break;
		}
	}
	
	function runGame() {
		inputManager.update();
		currentScreen.run();	
	}
	
	my.method('start', function () {
		inputManager = new InputManager();
		inputManager.init();
		Context.init();
		switchGameState(GameController.GAME_STATE_TITLE);
		setInterval(runGame, FrameRateManager.intervalTime);
		inputManager.dispose();
	};
	
	return my;
}());
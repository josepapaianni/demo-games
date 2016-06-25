var PCH = require('../../../common/proxys/default-proxy');
var Hud = require('../../../common/shared-modules/hudModule');
var Popup = require('../../../common/shared-modules/popupModule');
var Tutorial = require('./tutorial');
var utils = require('../../../common/shared-modules/utils');
var sharedConfig = require('../../../common/shared-modules/sharedConfig');
var ProxyManager = require('../../../common/ProxyManager');
var gameConfig = require('./config');
var preloadState = require('./preloadState');
var gameState = require('./gameState');

var AppManager = function () {

  this.user = null;
  this.policy = null;
  this.rules = null;
  this.gameStarted = false;
  this.popupOpen = false;

  this.gameProxy = document.location.hostname === 'localhost' || document.location.hostname === '0.0.0.0' ? PCH.gameProxy : window.PCH.gameProxy;
  this.proxyManager = new ProxyManager(this.gameProxy);
  this.game = new Phaser.Game(gameConfig.gameSize.width, gameConfig.gameSize.height, Phaser.AUTO, 'game');

  this.game.state.add('preloader', preloadState);
  this.game.state.add('gameState', gameState);

  this.game.state.start('preloader', false, false, (function () {
    //when the game loads all the assets:
    this.game.state.start('gameState', false, false, this);
  }).bind(this));

};

AppManager.prototype = {

  initialize: function () {
    var _self = this;
    this.proxyManager.registerStartFunction(function (arg) {
      _self.user = arg.user.firstName;
      _self.policy = arg.game.policy;
      _self.rules = arg.game.rules;
      _self.d = arg.game.d;
    });
    console.log('app manager initialize');
  },

  welcome: function () {
    this.welcomePopup = new Popup({
      game: this.game,
      type: 'welcome',
      device: gameConfig.device
    });
    this.welcomePopup.initialize(this.user, this);
    this.welcomePopup.show();
  },

  //when the user click start game
  initializeGameContext: function () {
    // Call the proxy to get game info, and the start the game (startWinner)
    this.proxyManager.gameStart(this.loadModules.bind(this));
  },

  //this function is called when all the game is loaded
  loadModules: function () {
    this.gameManager = this.game.state.states.gameState;
    //Hud Module
    this.hud = new Hud(this.game, this.gameManager, this, gameConfig);
    this.gameManager.hud = this.hud;

    this.hud.initialize();
    this.hud.showHud();

    //Tutorial Module
    var userWantToSee = utils.getSavedPreference(gameConfig.gameName,'showTutorial');
    if (gameConfig.tutorialFiles.length > 0 ){
      this.tutorial = new Tutorial(this.game, this);
    }

    if (userWantToSee && gameConfig.tutorialFiles.length > 0){
      this.showTutorial();
    } else {
      this.gameStarted = true;
      this.gameManager.startGame();
    }

    //Quit Popup Module
    this.quitPopup = new Popup ({
      game: this.game,
      type: 'quit',
      device: gameConfig.device
    });

    this.quitPopup.initialize(null, this);

    if (this.gameManager.startMusicLoop){
      this.gameManager.startMusicLoop();
    }
  },

  showTutorial: function () {
    if (this.gameManager.countDownInactive) {
      this.tutorial.showTutorial();
      this.disableHudInputs();
    }
    if (this.gameManager.timer && this.gameManager.countDownInactive) {
      this.gameManager.pauseGame();
    }
  },

  hideTutorial: function () {
    this.enableHudInputs();
    if (!this.gameStarted) {
      this.gameStarted = true;
      this.tutorial.hideTutorial(this.gameManager.startGame.bind(this.gameManager));
    } else {
      this.tutorial.hideTutorial();
    }
    if (this.gameManager.timer) {
      this.gameManager.resumeGame();
    }
  },

  quitWindow: function () {
    if (this.gameManager.timer && !this.popupOpen) {
      this.disableHudInputs();
      this.popupOpen = true;
      this.pauseGame();
      this.quitPopup.show();
    }
  },

  cancelQuit: function () {
    this.enableHudInputs();
    this.resumeGame();
    this.quitPopup.hide();
    this.popupOpen = false;
  },

  enableHudInputs: function () {
    this.hud.addEvents();
  },

  disableHudInputs: function () {
    this.hud.disableInputs();
  },

  resumeGame: function () {
    this.gameManager.resumeGame();
  },

  pauseGame: function () {
    this.gameManager.pauseGame();
  },

  quitGame: function () {
    this.disableHudInputs();
    this.proxyManager.gameEnd();
  },

  gameEnd: function (score) {
    // Send game events to proxy
    setTimeout(function(){
      this.proxyManager.gameEnd({'d':score * this.d});
    }.bind(this),5000);
  }

};



module.exports = AppManager;


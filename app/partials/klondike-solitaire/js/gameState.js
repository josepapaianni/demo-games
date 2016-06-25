var sharedConfig = require('../../../common/shared-modules/sharedConfig');
var gameConfig = require('./config');
var TweenMax = require('gsap');
var _ = require('underscore');
var CardModel = require('./cardModel');
var CardsDeckModel = require('./cardsDeckModel');
var CardHoldersManager = require('./cardsHolderManager');
var CardStackManager = require('./cardsStackManager');
var WelcomeAnimation = require('./welcomeAnimation');
var HintMachine = require('./hintMachine');
var utils = require('../../../common/shared-modules/utils');

var gameState = {
  init: function (appManager) {
    this.appManager = appManager;
  },

  create: function () {
    //Create the main groups to use as layers
    this.game.mainGameGroup = this.add.group();
    this.game.mainHudGroup = this.add.group();
    this.game.mainTutorialGroup = this.add.group();
    this.game.mainPopupGroup = this.add.group();

    //common game props
    this.gameTime = gameConfig.gameTime;
    this.score = 0;
    this.appManagerRef = this.appManager;
    this.tutorialVisible = false;
    this.gameStarted = false;
    this.countDownInactive = true;
    this.totalCards = 52;
    this.totalKindCards = 4;
    this.cards = [];
    this.cardHolders = [];
    this.matchCardsHolders = [];
    this.hintWaitTime = 4000;
    this.isHintActive = false;

    this.totalWidth = (gameConfig.grid.width * 7) + (gameConfig.grid.gutter * 6);
    this.offsetX = (this.game.width - this.totalWidth) / 2;
    this.mountedCardOffsetY = gameConfig.grid.height/10;

    this.initialize();
    this.animateWelcome(this.appManager.welcome.bind(this.appManager));
  },

  initialize: function () {
    //add assets
    this.background = this.game.add.image(0, 0, 'background');

    //add elements to mainGameGroup
    this.game.mainGameGroup.add(this.background);

    //Initialize Sounds
    this.soundIntro = this.game.add.audio('sound-intro');
    this.soundGameEnd = this.game.add.audio('sound-game-end');
    this.soundGamePlay = this.game.add.audio('sound-gameplay');
    this.soundShuffle = this.game.add.audio('sound-shuffling');
    this.lastSeconds = this.game.add.audio('clock-tick', 1, true);
  },

  animateWelcome: function (welcomeModal) {
    this.welcomeAnimation = new WelcomeAnimation(this.game, this.game.mainGameGroup, welcomeModal, this.soundIntro);
  },

  createCards: function () {
    this.cardsGroup = this.add.group();
    this.game.mainGameGroup.add(this.cardsGroup);
    for (var i = 0; i < this.totalKindCards; i++) {
      for (var j = 0; j < this.totalCards / this.totalKindCards; j++) {
        var card = new CardModel(this.game, this, {
          kind: i,
          number: j,
          color: i <= 1 ? 'black' : 'red'
        });
        this.cards.push(card);
      }
    }
    this.cards = _.shuffle(this.cards);
    this.cardsGroup.addMultiple(this.cards);
  },

  createDeck: function () {
    var initialPosX = gameConfig.grid.width / 2 + this.offsetX;
    var initialPosY = (gameConfig.grid.height / 2) + (this.game.height / 3.75);
    this.deck = new CardsDeckModel(this, this.cards, initialPosX, initialPosY, this.cardsGroup);
  },

  createCardsHolders: function () {
    for (var i = 0; i < 7; i++) {
      var xPos = (i * (gameConfig.grid.width + gameConfig.grid.gutter)) + this.offsetX;
      var yPos = this.game.height / 2;
      var holder = new CardHoldersManager(this.game, this, xPos, yPos);
      this.cardHolders.push(holder);
      this.game.mainGameGroup.add(holder.area);
    }
  },

  createMatchedCardsHolders: function () {
    for (var i = 0; i < 4; i++) {
      var xPos = this.game.width - (gameConfig.grid.width + this.offsetX + (i * (gameConfig.grid.width + gameConfig.grid.gutter)));
      var yPos = this.game.height / 3.75;
      var holder = new CardStackManager(this.game, this, xPos, yPos);
      this.matchCardsHolders.push(holder);
      this.game.mainGameGroup.add(holder.area);
      holder.cardAdded.add(this.setScore, this, 0, 100);
      holder.cardRemoved.add(this.setScore, this, 0, -100);
    }
  },

  createHintMachine: function () {
    this.hintMachine = new HintMachine(this, this.cards, this.cardHolders, this.matchCardsHolders, this.deck);
    this.hintLoop();
  },

  enableHolderInputs: function () {
    for (var i = 0; i < this.cardHolders.length; i++){
      this.cardHolders[i].activateLastCard();
    }
  },

  initialShuffle: function () {
    var cardIndexCount = 0;
    var rowCount = this.cardHolders.length;

    for (var i = 0; i < rowCount; i++) {
      setTimeout(function () {
        this.soundShuffle.play();
      }.bind(this), 150 * i);
      for (var j = i; j < rowCount; j++) {
        var cardHolder = this.cardHolders[j];
        var card = this.cards[cardIndexCount];
        card.isInDeck = false;
        cardHolder.addCard(card, {
          moveTime: 0.5,
          delay: 0.05 * cardIndexCount,
          onComplete: function (i, j, rowCount) {
            this.deck.removeFirstCardInDeck();
            if (i === rowCount - 1 && j === rowCount - 1) {
              this.startTimer();
            }
          }.bind(this, i, j, rowCount)
        });
        cardIndexCount++;
      }
    }
  },

  onStartDragging: function (card) {
    if (this.hintLoopTime){
      clearTimeout(this.hintLoopTime);
    }
    if (card.cardHolder) {
      card.previousHolder = card.cardHolder;
    }
    if (!card.isInDeck && card.cardHolder.childCards.length > 1) {
      card.cardHolder.addChildToCards(card);
    }
  },

  doubleClicked: function (card) {
    this.sendCardToMatchedCardsHolders(card);
    clearTimeout(this.hintLoopTime);
    this.hintLoop();
  },

  onStopDragging: function (card) {
    var isDropValid;
    //check holder for drop
    for (var i = 0; i < this.cardHolders.length; i++) {
      var holder = this.cardHolders[i];
      isDropValid = holder.checkOnDrop(card);
      if (isDropValid) {
        this.restartHint();
        holder.addCard(card);
        this.removeCardsFromPreviousHolder(card);
        this.changeCardParams(card);
        this.checkWin();
        break;
      }
    }

    //check stacked games to drop
    if (!isDropValid) {
      for (var j = 0; j < this.matchCardsHolders.length; j++) {
        var matchHolder = this.matchCardsHolders[j];
        isDropValid = matchHolder.checkOnDrop(card);
        if (isDropValid) {
          this.restartHint();
          matchHolder.addCard(card);
          this.removeCardsFromPreviousHolder(card);
          this.changeCardParams(card);
          this.checkWin();
          break;
        }
      }
    }
    //return card and childs to position
    if (!isDropValid) {
      this.hintLoop();
      card.returnToPreviousPosition(function(){
        if (card.previousHolder){
          card.previousHolder.cleanChildsCards(card, true);
        }
      });
    }
  },

  sendCardToMatchedCardsHolders: function(card) {
    var isCardMatch = false;
    for (var i = 0; i < this.matchCardsHolders.length; i++){
      if (this.matchCardsHolders[i].isCardMatchForHolder(card)){
        this.matchCardsHolders[i].addCard(card);
        isCardMatch = true;
        break;
      }
    }
    if (isCardMatch){
      this.restartHint();
      this.removeCardsFromPreviousHolder(card);
      this.changeCardParams(card);
      this.checkWin();
    } else {
      card.returnToPreviousPosition();
    }
  },

  removeCardsFromPreviousHolder: function (card) {
    var cardHolder = card.previousHolder;
    if (cardHolder) {
      var cardIndex = _.findIndex(cardHolder.childCards, card);
      cardHolder.removeCards(cardIndex);
      cardHolder.activateLastCard();
    }
  },

  changeCardParams: function (card) {
    if (card.isInDeck) {
      this.deck.removeCardFromShowed();
      card.isInDeck = false;
    }
  },

  restartHint: function () {
    this.isHintActive = false;
    this.hintLoop();
  },

  hintLoop: function () {
    if (this.gameDone){
      return;
    }
    if (this.hintLoopTime){
      clearTimeout(this.hintLoopTime);
    }
    var waitTime = this.isHintActive ? 1000 : this.hintWaitTime;
    this.hintLoopTime = setTimeout(function(){
      this.hintMachine.checkPossibleHints();
      this.isHintActive = true;
      this.hintLoop();
    }.bind(this), waitTime)
  },

  checkWin: function () {
    for (var i = 0; i < this.matchCardsHolders.length; i++){
      if (this.matchCardsHolders[i].childCards.length < this.cards.length / 4){
        return false;
      }
    }
    this.gameEnd();
  },

  startMusicLoop: function () {
    this.soundGamePlay.play("", 0, 1, true);
  },

  startGame: function () {
    this.createCardsHolders();
    this.createMatchedCardsHolders();
    this.createCards();
    this.createDeck();
    this.initialShuffle();
    this.game.mainHudGroup.add(this.welcomeAnimation.logoGroup);
    this.welcomeAnimation.goToHeaderPos();
  },

  pauseGame: function () {
    this.timer.pause();
    //this.deactivateDoorsInputs();
  },

  resumeGame: function () {
    this.timer.resume();
    //this.activateDoorsInputs();
  },

  startTimer: function () {
    this.countDown(function () {
      this.timer = this.game.time.create(false);
      this.timer.loop(1000, this.tickClock, this);
      this.timer.start();
      this.gameStarted = true;
      this.countDownInactive = true;
      this.appManagerRef.enableHudInputs();
      this.createHintMachine();
      this.enableHolderInputs();
    });
  },

  countDown: function (callback) {
    this.appManagerRef.disableHudInputs();
    this.countDownInactive = false;
    this.numberCount = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'ingame-messages');
    this.numberCount.anchor.set(0.5);
    this.numberCount.frame = 2;
    this.numberCount.alpha = 0;
    var _self = this;

    var alphaTween = function () {
      TweenMax.to(_self.numberCount, 0.5, {
        alpha: 1,
        repeat: 1,
        yoyo: true
      });
    };

    TweenMax.fromTo(this.numberCount.scale, 1, {
      x: 3,
      y: 3
    }, {
      x: 0,
      y: 0,
      ease: Power3.easeInOut,
      repeat: 3,
      onStart: alphaTween,
      onRepeat: function () {
        alphaTween();
        if (_self.numberCount.frame === 0) {
          _self.numberCount.frame = 3;
        } else {
          _self.numberCount.frame--;
        }
      },
      onComplete: callback,
      onCompleteScope: _self
    })
  },

  tickClock: function () {
    if (this.gameTime == 0) {
      this.gameEnd();
      return;
    }

    if (this.gameTime <= 10 && !this.lastSeconds.isPlaying) {
      this.soundGamePlay.fadeOut(500);
      this.lastSeconds.play();
    }
    this.gameTime--;
    this.hud.updateTime(this.gameTime);
  },

  setScore: function (score) {
    console.log(score)
    this.score += score;
    this.hud.updateScore(this.score);
  },

  gameEnd: function (nomoves) {
    this.timer.stop();
    clearTimeout(this.hintLoopTime);
    this.gameDone = true;
    this.removeInputs();

    if (this.gameTime > 0 && !nomoves) {
      this.hud.endGameWithTime(this.score, this.gameTime, 10);
    }
    if (nomoves){
      this.gameTime = 0;
    }
    if (this.soundGamePlay.isPlaying) {
      this.soundGamePlay.fadeOut(500);
    }
    if (this.lastSeconds.isPlaying) {
      this.lastSeconds.fadeOut(500);
    }
    this.soundGameEnd.play();
    setTimeout(this.showGameOver.bind(this, nomoves), 2000);
    setTimeout(this.appManagerRef.gameEnd.bind(this.appManagerRef, this.score + (this.gameTime * 10)), 3000);
  },

  showGameOver: function (nomoves) {
    var offsetY = 0;
    this.blackModal = this.game.add.graphics();
    this.blackModal.beginFill(0x000);
    this.blackModal.drawRect(0, 0, this.game.width, this.game.height);
    this.blackModal.alpha = 0.65;

    if(nomoves){
      offsetY = 40;
      this.noMovesStyle = {fill: "#ffffff", fontSize: 30, fontWeight: 'bold'};
      this.noMovesTxt = this.game.add.text(this.game.world.centerX, this.game.world.centerY - 60, 'You are out of moves!', this.noMovesStyle);
      this.noMovesTxt.font = 'Open Sans';
      this.noMovesTxt.anchor.set(0.5);

      TweenMax.from(this.noMovesTxt, 1, {
        alpha: 0
      })

    }

    this.gameOverText = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY + offsetY, 'ingame-messages', 4);
    this.gameOverText.anchor.set(0.5);

    TweenMax.from(this.gameOverText, 1, {
      alpha: 0
    });

    TweenMax.from(this.blackModal, 1, {
      alpha: 0
    })
  },

  removeInputs: function () {
    this.cards.forEach(function(card){
      card.deactivateInputs();
    });
    this.deck.deactivateInput();
  }

};

module.exports = gameState;
window.st = gameState;
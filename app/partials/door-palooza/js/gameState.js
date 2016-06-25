var sharedConfig = require('../../../common/shared-modules/sharedConfig');
var gameConfig = require('./config');
var TweenMax = require('gsap');
var _ = require('underscore');
var DoorModel = require('./doorModel');
var WayOut = require('./wayOut');
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

    this.difficultyLevels = gameConfig.difficultyLevels;

    this.currentLevel = 0;
    this.currentMatches = 0;
    this.cardsTypes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    this.cardsTypesMixed = [];
    this.gameTime = gameConfig.gameTime;
    this.score = 0;
    this.appManagerRef = this.appManager;
    this.doors = [];
    this.selectedDoors = [];
    this.tutorialVisible = false;
    this.gameStarted = false;
    this.countDownInactive = true;
    this.onShuffling = false;
    this.comboCounter = 0;

    this.initialize();
    this.animateWelcome(this.appManager.welcome.bind(this.appManager));
  },

  initialize: function () {
    //add assets
    this.background = this.game.add.image(0, 0, 'background');
    this.houseGroup = this.game.add.group();

    this.house = this.houseGroup.create(0, 0, 'home-image');
    this.gameLogo = this.houseGroup.create(271 + 129, 310, 'game-logo');
    this.gameLogo.scale.set(0.8);
    this.gameLogo.anchor.set(0.5, 0.5);
    this.street = this.game.add.image(0, 399, 'street-image');
    this.doorsGroup = this.game.add.group();
    this.numberCount = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'ingame-messages');
    this.numberCount.anchor.set(0.5);
    this.numberCount.frame = 2;
    this.numberCount.alpha = 0;

    //add elements to mainGameGroup
    this.game.mainGameGroup.add(this.background);
    this.game.mainGameGroup.add(this.houseGroup);
    this.game.mainGameGroup.add(this.street);
    this.game.mainGameGroup.add(this.doorsGroup);
    this.game.mainGameGroup.add(this.numberCount);

    //Initialize Sounds
    this.soundCorrectMatch = this.game.add.audio('sound-correct-match');
    this.soundGameEnd = this.game.add.audio('sound-game-end');
    this.soundGameIntro = this.game.add.audio('sound-game-intro');
    this.soundGamePlay = this.game.add.audio('sound-gameplay');
    this.soundIncorrectMatch = this.game.add.audio('sound-incorrect-match');
    this.lastSeconds = this.game.add.audio('clock-tick', 1, true);

    //Create placeholder text to prevent FOUT
    var style = { font: "40px HelveticaNeueLTStd-Blk", fill: "#fff100", align: 'center' };
    var text = this.game.add.text(0,0,'x', style);
    text.alpha = 0;
  },

//This function create an array with all the needed kind of matches for each level
  mixDoors: function (rows) {
    this.cardsTypesMixed = [];
    for (var h = 0; h < (rows * gameConfig.gridSize.totalColumns) / 2; h++) {
      this.cardsTypesMixed.push(this.cardsTypes[h]);
    }
    for (var j = 0; j < (rows * gameConfig.gridSize.totalColumns) / 2; j++) {
      this.cardsTypesMixed.push(this.cardsTypes[j]);
    }
    this.cardsTypesMixed = _.shuffle(this.cardsTypesMixed);
  },

  getXOffset: function () {
    return ((gameConfig.gameSize.width - ((gameConfig.gridSize.w + gameConfig.gridSize.gutter) * gameConfig.gridSize.totalColumns)) / 2) + gameConfig.gridSize.borderOffset
  },

//First Animation
  animateWelcome: function (callback) {
    this.soundGameIntro.play();
    var tweenStreet = this.game.add.tween(this.street);
    tweenStreet.from({y: 525}, 1000, Phaser.Easing.Quintic.Out, true);

    var tweenHouseFromBottom = this.game.add.tween(this.houseGroup);
    tweenHouseFromBottom.from({y: 525}, 1000, Phaser.Easing.Quintic.Out, true, 500);

    var tweenLogo = this.game.add.tween(this.gameLogo.scale);
    tweenLogo.from({x: 0, y: 0}, 1000, Phaser.Easing.Elastic.Out, true, 1000);

    setTimeout(callback, 4000);
  },

//Creates the required doors for each level (doorModel.js)
  createDoors: function (rows, yOffset) {
    this.doors = [];
    for (var j = 0; j < rows; j++) {
      for (var i = 0; i < gameConfig.gridSize.totalColumns; i++) {

        var doorModel = new DoorModel(this.game, this, i, j, this.cardsTypesMixed[i + (j * gameConfig.gridSize.totalColumns)], this.getXOffset(), yOffset);
        doorModel.index = i + (j * gameConfig.gridSize.totalColumns);
        this.doors.push(doorModel);
        this.doorsGroup.add(doorModel.doorGroup);
      }
    }
  },

//This animation is only for the first doors, when complete the timer is fired
  animateDoorsIntro: function (callback) {

    this.tweenHouse = this.game.add.tween(this.houseGroup);
    this.tweenHouse.to({y: 50}, 1000, Phaser.Easing.Back.Out, true);

    var tweenStreet = this.game.add.tween(this.street);
    tweenStreet.to({y: 420}, 1000, Phaser.Easing.Back.Out, true);

    var tweenLogoScale = this.game.add.tween(this.gameLogo.scale);
    tweenLogoScale.to({x: 0.4, y: 0.4}, 500, Phaser.Easing.Back.Out, true);

    var tweenLogoPosition = this.game.add.tween(this.gameLogo);
    tweenLogoPosition.to({y: 180}, 500, Phaser.Easing.Back.Out, true);

    for (var i = 0; i < this.doors.length; i++) {
      var _self = this;
      var tween = this.game.add.tween(this.doors[i].doorGroup);
      tween.from({y: 420, x: this.game.world.centerX}, 250, Phaser.Easing.Exponential.Out, true, i * 100);
      var door = this.doors[i];

      //Initialize the door when the animation ends
      (function (door) {
        tween.onComplete.add(function () {
          door.initialize();
        }, this);
      }(this.doors[i]));

      //callback when ALL the doors are on stage
      if (i == this.doors.length - 1) {
        tween.onComplete.add(callback, this)
      }
    }
  },


  startMusicLoop: function () {
    this.soundGamePlay.play("", 0, 1, true);
  },

  startGame: function () {
    this.gameSarted = true;
    this.mixDoors(this.difficultyLevels[this.currentLevel].rows);
    this.createDoors(this.difficultyLevels[this.currentLevel].rows, gameConfig.doorsInitialOffsetY);
    this.animateDoorsIntro(this.startTimer);
  },

  toNextLevel: function () {
    if (this.currentLevel === this.difficultyLevels.length - 1) {
      this.gameEnd(true);
    } else {
      this.removeCurrentDoors()
      this.showNextLevel();
    }
  },

  removeCurrentDoors: function (callback) {
    var _self = this;
    var groupLenght = this.doorsGroup.length;
    this.doors.forEach(function (door, index) {
      var index = index;
      var groupToKill = _self.doorsGroup.getChildAt(index);
      TweenMax.to(door.doorGroup, 0.5, {
        y: 600,
        delay: index * 0.1,
        onComplete: function () {
          groupToKill.destroy();
          if (index === groupLenght - 1 && callback) {
            callback();
          }
        },
        onCompleteScope: this
      });
    })
  },

  showNextLevel: function () {
    var _self = this;
    this.currentMatches = 0;
    this.currentLevel++;

    //offset fix of the house background with logo
    if (this.currentLevel === this.difficultyLevels.length - 1) {
      TweenMax.to(this.street, 0.25, {
        y: this.street.y + 10
      });
    } else if (this.currentLevel === this.difficultyLevels.length - 2) {
      TweenMax.to(this.street, 0.25, {
        y: this.street.y + 10
      });
    }

    TweenMax.to(this.houseGroup, 0.25, {
      y: 50 - this.currentLevel * 80,
      onComplete: animationCb,
      onCompleteScope: _self
    });

    function animationCb() {
      this.mixDoors(this.difficultyLevels[this.currentLevel].rows);
      this.createDoors(this.difficultyLevels[this.currentLevel].rows, gameConfig.doorsInitialOffsetY - this.difficultyLevels[this.currentLevel].yOffset);
      this.animateNextLevelDoors(this.difficultyLevels[this.currentLevel].rows)
    }
  },

  animateNextLevelDoors: function () {
    this.onShuffling = true;
    var _self = this;
    for (var i = 0; i < this.doors.length; i++) {
      var tween = this.game.add.tween(this.doors[i].doorGroup);
      tween.from({y: this.doors[i].doorGroup.y - 50}, 500, Phaser.Easing.Bounce.Out, true, i * 100);
      TweenMax.from(this.doors[i].doorGroup, 0.5, {
        alpha: 0,
        delay: i * 0.1
      });
      var door = this.doors[i];
      //Initialize the door when the animation ends
      (function (door, arrayLenght, index, scope) {
        tween.onComplete.add(function () {
          door.initialize();
          if (index === arrayLenght - 1) {
            scope.onShuffling = false;
          }
        }, this);
      }(this.doors[i], this.doors.length, i, this));
    }
  },

  checkLevelFinished: function () {
    if (this.difficultyLevels[this.currentLevel].neededMatches === this.currentMatches) {
      this.toNextLevel();
    }
  },

  openAllDoors: function () {
    this.doors.forEach(function (door) {
        if (door.state == 0 || door.state == 1) {
          door.openDoor('silent');
        }
      }
    )
  },

  pauseGame: function () {
    this.timer.pause();
    this.deactivateDoorsInputs();
  },

  resumeGame: function () {
    this.timer.resume();
    this.activateDoorsInputs();
  },

  startTimer: function () {
    this.countDown(function () {
      this.timer = this.game.time.create(false);
      this.timer.loop(1000, this.tickClock, this);
      this.timer.start();
      this.gameStarted = true;
      this.countDownInactive = true;
      this.appManagerRef.enableHudInputs();
    });
  },

  countDown: function (callback) {
    this.appManagerRef.disableHudInputs();
    this.countDownInactive = false;

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
      this.timer.stop();
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

  gameEnd: function (completedBeforeTime) {
    var waitTimeTween = this.onShuffling ? this.currentLevel * 100 : 0;
    clearTimeout(this.openAnimation);
    clearTimeout(this.closeAnimation);

    setTimeout(function(){
        this.openAllDoors();
        this.removeInputs();
    }.bind(this),waitTimeTween);

    if (this.gameTime > 0) {
      this.timer.stop();
      this.hud.endGameWithTime(this.score, this.gameTime, 10);
    }

    if (this.soundGamePlay.isPlaying) {
      this.soundGamePlay.fadeOut(500);
    }
    if (this.lastSeconds.isPlaying) {
      this.lastSeconds.fadeOut(500);
    }
    this.soundGameEnd.play();

    setTimeout(function () {
      this.appManagerRef.gameEnd(this.score + (this.gameTime * 10));
      this.showGameOver(completedBeforeTime);
    }.bind(this), 1500 + waitTimeTween);
  },

  showGameOver: function (completedBeforeTime) {
    this.blackModal = this.game.add.graphics();
    this.blackModal.beginFill(0x000);
    this.blackModal.drawRect(0, 0, this.game.width, this.game.height);
    this.blackModal.alpha = 0.65;
    this.game.mainGameGroup.add(this.blackModal);

    TweenMax.from(this.blackModal, 1, {
      alpha: 0
    });

    if (completedBeforeTime) {
      this.wayOut = new WayOut(this.game);
      this.game.mainGameGroup.add(this.wayOut.mainGroup);
    } else {
      this.gameOverText = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'ingame-messages', 4);
      this.gameOverText.anchor.set(0.5);
      TweenMax.from(this.gameOverText, 1, {
        alpha: 0
      });
    }
  },

  removeInputs: function () {
    this.doors.forEach(function (door) {
      door.disableInput();
    })
  },

  revealCard: function (sprite) {
    var card = this.doors[sprite.modelRef.index];

    if (this.selectedDoors.length < 2 && card.state != 1 && card.state != 2 && this.gameStarted) {
      var _self = this;

      this.selectedDoors.push(card);

      if (this.selectedDoors.length == 2) {
        if (this.selectedDoors[0].type === this.selectedDoors[1].type) {
          this.openAnimation = setTimeout(function () {
            _self.comboCounter++;
            var comboMultiplier = _self.comboCounter > 1 ? gameConfig.comboMultiplier * (_self.comboCounter-1) : 0;
            var scoreValue = (gameConfig.doorPointsValue * (_self.currentLevel + 1)) + comboMultiplier;
            _self.score += scoreValue;
            _self.hud.updateScore(_self.score);
            _self.soundCorrectMatch.play();
            _self.selectedDoors[0].matchSelection();
            _self.selectedDoors[1].matchSelection();
            _self.selectedDoors[0].state = 2;
            _self.selectedDoors[1].state = 2;
            _self.selectedDoors[1].showCombo(_self.comboCounter, scoreValue);
            _self.selectedDoors = [];
            _self.currentMatches++;
            _self.checkLevelFinished();
          }, 250);
        } else {
          this.openAnimation = setTimeout(function () {
            _self.soundIncorrectMatch.play();
            _self.selectedDoors[0].closeDoor();
            _self.selectedDoors[1].closeDoor();
            _self.selectedDoors[0].state = 0;
            _self.selectedDoors[1].state = 0;
            _self.selectedDoors = [];
            _self.comboCounter = 0;
          }, 500);
        }
      }
      card.state = 1;
      card.openDoor();
    }
  },

  deactivateDoorsInputs: function () {
    this.doors.forEach(function (door) {
      door.door.inputEnabled = false;

    })
  },

  activateDoorsInputs: function () {
    this.doors.forEach(function (door) {
      door.door.inputEnabled = true;
      door.door.input.useHandCursor = true;
    })
  }

};

module.exports = gameState;
window.gameState = gameState;
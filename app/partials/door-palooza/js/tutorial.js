var gameConfig = require('./config');
var TweenMax = require('gsap');
var utils = require('../../../common/shared-modules/utils');

var Tutorial = function (phaserGame, appManager, group) {

  this.game = phaserGame;

  this.appManagerRef = appManager;

  this.tutorialGroup = this.game.add.group();
  this.slidesGroup = this.game.add.group();
  this.clickSound = this.game.add.audio('button-click');

  for (var i = 0; i < gameConfig.tutorialFiles.length; i++) {
    var slide = this.slidesGroup.create(this.game.world.centerX, this.game.world.centerY, gameConfig.tutorialFiles[i].name);
    slide.anchor.set(0.5);
    slide.alpha = i === 0 ? 1 : 0;
  }

  this.tutorialGroup.add(this.slidesGroup);

  this.playButtonGroup = this.game.add.group();

  this.playButton = this.tutorialGroup.create(gameConfig.gameSize.width - 60, gameConfig.gameSize.height - 40, 'genericButtons', 'btn-bg-small.png');
  this.playButton.scale.set(0.4);
  this.playButton.anchor.set(0.5);

  this.playText = this.game.add.text(gameConfig.gameSize.width - 60, gameConfig.gameSize.height - 37, 'Play');
  this.playText.anchor.set(0.5);
  this.playText.font = 'Open Sans';
  this.playText.fontWeight = 'bold';
  this.playText.fontSize = 22;
  this.playText.fill = 'white';

  this.playButton.inputEnabled = true;
  this.playButton.input.useHandCursor = true;
  this.playButton.events.onInputDown.add(this.appManagerRef.hideTutorial, this.appManagerRef);

  this.playButtonGroup.add(this.playButton);
  this.playButtonGroup.add(this.playText);
  this.tutorialGroup.add(this.playButtonGroup);

  //Create next button if have more than 1 image
  if (gameConfig.tutorialFiles.length > 1) {

    this.slideIndex = 0;

    this.nextButtonGroup = this.game.add.group();

    this.nextButton = this.tutorialGroup.create(gameConfig.gameSize.width - 165, gameConfig.gameSize.height - 40, 'genericButtons', 'btn-bg-small.png');
    this.nextButton.scale.set(0.4);
    this.nextButton.anchor.set(0.5);

    this.nextText = this.game.add.text(gameConfig.gameSize.width - 165, gameConfig.gameSize.height - 37, 'Next');
    this.nextText.anchor.set(0.5);
    this.nextText.font = 'Open Sans';
    this.nextText.fontWeight = 'bold';
    this.nextText.fontSize = 22;
    this.nextText.fill = 'white';

    this.nextButton.inputEnabled = true;
    this.nextButton.input.useHandCursor = true;
    this.nextButton.events.onInputDown.add(this.showNextSlide, this);

    this.nextButtonGroup.add(this.nextButton);
    this.nextButtonGroup.add(this.nextText);
    this.tutorialGroup.add(this.nextButtonGroup);

  }

  this.checkBox = this.tutorialGroup.create(30, gameConfig.gameSize.height - 27, 'genericButtons', 'check-off.png');
  this.checkBox.scale.set(0.8);
  this.checkBox.anchor.set(0.5);

  this.checkBoxOn = this.tutorialGroup.create(30, gameConfig.gameSize.height - 27, 'genericButtons', 'check-on.png');
  this.checkBoxOn.scale.set(0.8);
  this.checkBoxOn.anchor.set(0.5);
  this.checkBoxOn.alpha = utils.getSavedPreference(gameConfig.gameName, 'showTutorial') ? 0 : 1;

  this.checkBoxText = this.game.add.text(92, gameConfig.gameSize.height - 24, "Don't show");
  this.checkBoxText.anchor.set(0.5);
  this.checkBoxText.font = 'Open Sans';
  this.checkBoxText.fontWeight = 'normal';
  this.checkBoxText.fontSize = 18;
  this.checkBoxText.fill = 'white';

  this.checkBox.inputEnabled = true;
  this.checkBox.input.useHandCursor = true;
  this.checkBox.events.onInputDown.add(this.confirmCheckbox, this);

  this.tutorialGroup.add(this.checkBoxText);

  this.tutorialGroup.alpha = 0;

};

Tutorial.prototype = {

  backToGame: function () {
    this.appManagerRef.hideTutorial();
  },

  showNextSlide: function () {
    this.clickSound.play();
    var slidesTotal = gameConfig.tutorialFiles.length - 1;
    //increment index
    this.slideIndex++;
    this.slideIndex = this.slideIndex > slidesTotal ? 0 : this.slideIndex;

    var prevIndex = this.slideIndex - 1 < 0 ? slidesTotal : this.slideIndex - 1;
    var nextIndex = this.slideIndex > slidesTotal ? 0 : this.slideIndex;
    var prevSlide = this.slidesGroup.getChildAt(prevIndex);
    var nextSlide = this.slidesGroup.getChildAt(nextIndex);

    TweenMax.to(prevSlide, 0.33, {
      delay: 0.33,
      alpha: 0,
      ease: Power0.easeNone
    });
    TweenMax.to(nextSlide, 0.33, {
      alpha: 1,
      ease: Power0.easeNone
    });

  },

  confirmCheckbox: function (event) {
      this.clickSound.play();
    if (utils.getSavedPreference(gameConfig.gameName,'showTutorial')) {
      this.checkBoxOn.alpha = 1;
      utils.savePreference(gameConfig.gameName,'showTutorial');
    } else {
      this.checkBoxOn.alpha = 0;
      utils.savePreference(gameConfig.gameName,'showTutorial');
    }
  },

  showTutorial: function () {
    this.enableInputs();
    TweenMax.to(this.tutorialGroup, 0.5, {
      alpha: 1
    })
  },

  disableInputs: function () {
    if (this.nextButton){
      this.nextButton.inputEnabled = false;
    }
    this.playButton.inputEnabled = false;
    this.checkBox.inputEnabled = false;
  },

  enableInputs: function () {
    if (this.nextButton){
      this.nextButton.inputEnabled = true;
      this.nextButton.input.useHandCursor = true;
    }
    this.playButton.inputEnabled = true;
    this.playButton.input.useHandCursor = true;
    this.checkBox.inputEnabled = true;
    this.checkBox.input.useHandCursor = true;
  },

  hideTutorial: function (callback) {
    this.clickSound.play();
    this.disableInputs();
    TweenMax.to(this.tutorialGroup, 0.5, {
      alpha: 0,
      onComplete: function () {
        if (callback) {
          callback()
        }
      }
    });
  },

};


module.exports = Tutorial;
'use strict';

var TweenMax = require('gsap');
var utils = require('./utils');

var Tutorial = function (phaserGame, appManager, gameConfig) {

  this.game = phaserGame;
  this.appManagerRef = appManager;
  this.gameConfig = gameConfig;

  this.slideIndex = 0;

  this.device = "desktop";
  this.posXStartButton = this.game.width - 60;
  this.posYStartButton = this.game.height - 40;
  this.posXNextButton = this.game.width - 165;
  this.posYNextButton = this.game.height - 40;
  this.posXCheckbox = 30;
  this.posYCheckbox = this.game.height - 27;
  this.overlayColor = 0x000000;
  this.overlayAlpha = 0;
  this.userWantToSee = utils.getSavedPreference(this.gameConfig.gameName, 'showTutorial');
};

Tutorial.prototype = {

  initialize: function() {
    this.tutorialGroup = this.game.add.group();
    this.tutorialGroup.alpha = 0;


    this.slidesGroup = this.game.add.group();
    this.clickSound = this.game.add.audio('button-click');

    switch(this.device)
    {
      case "desktop":
        this.buttonScale = 0.4;
        this.buttonFontSize = 22;
        this.checkboxScale = 0.6;
        this.checkboxFontSize = 18;
        this.posXCheckBoxText = 65;
        break;
      case "mobile":
        this.buttonScale = 0.6;
        this.buttonFontSize = 36;
        this.checkboxScale = 1;
        this.checkboxFontSize = 36;
        this.posXCheckBoxText = 120;
        break;
    }

    this.getOverlay();
    this.getSlideImages();
    this.getPlayButton();
    this.getNextButton();
    this.getCheckbox();
  },

  getOverlay: function() {
    var overlay = this.game.add.graphics(0, 0);
    this.tutorialGroup.add(overlay);
    overlay.beginFill(this.overlayColor, this.overlayAlpha);
    overlay.drawRect(0, 0, this.game.width, this.game.height);
  },

  getSlideImages: function() {
    for (var i = 0; i < this.gameConfig.tutorialFiles.length; i++) {
      var slide = this.slidesGroup.create(this.game.width/2, this.game.height/2, this.gameConfig.tutorialFiles[i].name);
      slide.anchor.set(0.5);
      slide.alpha = i === 0 ? 1 : 0;
    }
    this.tutorialGroup.add(this.slidesGroup);
  },

  getPlayButton: function() {
    this.playButtonGroup = this.game.add.group();
    this.playButtonGroup.x = this.posXStartButton;
    this.playButtonGroup.y = this.posYStartButton;
    
    this.playButton = this.tutorialGroup.create(0, 0, 'genericButtons', 'btn-bg-small.png');
    this.playButtonGroup.add(this.playButton);
    this.playButton.scale.set(this.buttonScale);
    this.playButton.anchor.set(0.5);

    this.playText = this.game.add.text(0, 2, 'Play');
    this.playButtonGroup.add(this.playText);
    this.playText.anchor.set(0.5);
    this.playText.font = 'Open Sans';
    this.playText.fontWeight = 'bold';
    this.playText.fontSize = this.buttonFontSize;
    this.playText.fill = 'white';

    this.playButton.inputEnabled = true;
    this.playButton.input.useHandCursor = true;
    this.playButton.events.onInputDown.add(this.appManagerRef.hideTutorial, this.appManagerRef);
    
    this.tutorialGroup.add(this.playButtonGroup);
  },

  /**
  * Create next button if have more than 1 image
  */
  getNextButton: function() {
    if (this.gameConfig.tutorialFiles.length > 1) {
      this.nextButtonGroup = this.game.add.group();
      this.nextButtonGroup.x = this.posXNextButton;
      this.nextButtonGroup.y = this.posYNextButton;

      this.nextButton = this.tutorialGroup.create(0, 0, 'genericButtons', 'btn-bg-small.png');
      this.nextButton.scale.set(this.buttonScale);
      this.nextButton.anchor.set(0.5);

      this.nextText = this.game.add.text(0, 2, 'Next');
      this.nextText.anchor.set(0.5);
      this.nextText.font = 'Open Sans';
      this.nextText.fontWeight = 'bold';
      this.nextText.fontSize = this.buttonFontSize;
      this.nextText.fill = 'white';

      this.nextButton.inputEnabled = true;
      this.nextButton.input.useHandCursor = true;
      this.nextButton.events.onInputDown.add(this.showNextSlide, this);

      this.nextButtonGroup.add(this.nextButton);
      this.nextButtonGroup.add(this.nextText);
      this.tutorialGroup.add(this.nextButtonGroup);
    } else {
      return false;
    }
  },

  getCheckbox: function() {
    this.checkboxGroup = this.game.add.group();
    this.checkboxGroup.x = this.posXCheckbox;
    this.checkboxGroup.y = this.posYCheckbox;

    this.checkBox = this.checkboxGroup.create(0, 0, 'genericButtons', 'check-off.png');
    this.checkBox.scale.set(this.checkboxScale);
    this.checkBox.anchor.set(0.5);

    this.checkBoxOn = this.checkboxGroup.create(0, 0, 'genericButtons', 'check-on.png');
    this.checkBoxOn.scale.set(this.checkboxScale);
    this.checkBoxOn.anchor.set(0.5);
    this.checkBoxOn.alpha = this.userWantToSee ? 0 : 1;

    this.checkBoxText = this.game.add.text(this.posXCheckBoxText, 3, "Don't show");
    this.checkBoxText.anchor.set(0.5);
    this.checkBoxText.font = 'Open Sans';
    this.checkBoxText.fontWeight = 'normal';
    this.checkBoxText.fontSize = this.checkboxFontSize;
    this.checkBoxText.fill = 'white';
    this.checkboxGroup.add(this.checkBoxText);

    this.checkBox.inputEnabled = true;
    this.checkBox.input.useHandCursor = true;
    this.checkBox.events.onInputDown.add(this.confirmCheckbox, this);

    this.tutorialGroup.add(this.checkboxGroup);
  },

  backToGame: function () {
    this.appManagerRef.hideTutorial();
  },

  showNextSlide: function () {
    this.clickSound.play();
    var slidesTotal = this.gameConfig.tutorialFiles.length - 1;
    //increment index
    this.slideIndex++;
    this.slideIndex = this.slideIndex > slidesTotal ? 0 : this.slideIndex;
    console.log(this.slideIndex);

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
    if (this.userWantToSee) {
      this.checkBoxOn.alpha = 1;
      utils.savePreference(this.gameConfig.gameName, 'showTutorial')
    } else {
      this.checkBoxOn.alpha = 0;
      utils.savePreference(this.gameConfig.gameName, 'showTutorial')
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

// Setters y getters
Object.defineProperties(Tutorial.prototype, {
    "posXStartButton": { 
        get: function () {
          return this._posXStartButton; 
        },
        set: function (value) {
          this._posXStartButton = value;
        }
    },
    "posYStartButton": { 
        get: function () {
          return this._posYStartButton; 
        },
        set: function (value) {
          this._posYStartButton = value;
        }
    },
    "posXNextButton": { 
        get: function () {
          return this._posXNextButton; 
        },
        set: function (value) {
          this._posXNextButton = value;
        }
    },
    "posYNextButton": { 
        get: function () {
          return this._posYNextButton; 
        },
        set: function (value) {
          this._posYNextButton = value;
        }
    },
    "posXCheckbox": { 
        get: function () {
          return this._posXCheckbox; 
        },
        set: function (value) {
          this._posXCheckbox = value;
        }
    },
    "posYCheckbox": { 
        get: function () {
          return this._posYCheckbox; 
        },
        set: function (value) {
          this._posYCheckbox = value;
        }
    },
    "overlayColor": { 
        get: function () {
          return this._overlayColor; 
        },
        set: function (value) {
          this._overlayColor = value;
        }
    },
    "overlayAlpha": { 
        get: function () {
          return this._overlayAlpha; 
        },
        set: function (value) {
          this._overlayAlpha = value;
        }
    },
    "device": { 
        get: function () {
          return this._device; 
        },
        set: function (value) {
          this._device = value;
        }
    }    
});

module.exports = Tutorial;
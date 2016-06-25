var sharedConfig = require('./sharedConfig');
var RoundedRectangle = require('./customObjects/roundedRectangle');
var TweenMax = require('gsap');

var Popup = function (options) {
  this.game = options.game;
  this.type = options.type;
  this.deviceType = options.device;
  this.clickedStart = new Phaser.Signal();
};

Popup.prototype = {
  initialize: function (user, appManager) {
    this.appManagerRef = appManager;
    this.mainGroup = this.game.add.group();
    this.mainGroup.fixedToCamera = true;

    var width = this.game.width > this.game.height ? sharedConfig.welcomePopup.desktopSize.width : sharedConfig.welcomePopup.mobileSize.width;
    var height = this.game.width > this.game.height ? sharedConfig.welcomePopup.desktopSize.height : sharedConfig.welcomePopup.mobileSize.height;
    var gameCenterX = this.game.width / 2;
    var gameCenterY = this.game.height / 2;

    this.clickSound = this.game.add.audio('button-click');


    this.blackModal = this.game.add.graphics();
    this.blackModal.beginFill(0x000);
    this.blackModal.drawRect(0, 0, this.game.width, this.game.height);
    this.blackModal.alpha = 0.65;
    this.mainGroup.add(this.blackModal);

    this.whiteFrame = new RoundedRectangle(this.game, gameCenterX, gameCenterY, width, height, 20, 'rgba(255,255,255,1)', null, null);
    this.whiteFrame.anchor.set(0.5);
    this.mainGroup.add(this.whiteFrame);

    var titleText;
    var bodyText;

    switch (this.type) {
      case 'welcome':
        var userName = user;
        titleText = 'Welcome ' + userName + '!';
        bodyText = 'Click below to start your game!';

        this.playButton = this.mainGroup.create(gameCenterX, gameCenterY + 70, 'genericButtons', 'btn-bg-big.png');
        this.playButton.scale.set(0.5);
        this.playButton.anchor.set(0.5);

        this.btnText = this.game.add.text(gameCenterX - 25, gameCenterY + 72);
        this.btnText.anchor.set(0.5);
        this.btnText.font = 'Open Sans';
        this.btnText.text = 'Play Now!';
        this.btnText.align = 'center';
        this.btnText.fill = 'white';
        this.mainGroup.add(this.btnText);

        this.playButton.events.onInputDown.add(this.clickStart, this);
        break;
      case 'quit':
        titleText = 'Quit game';
        bodyText = 'Are you sure?';

        this.yesButton = this.mainGroup.create(gameCenterX - 60, gameCenterY + 70, 'genericButtons', 'btn-bg-small.png');
        this.yesButton.anchor.set(0.5);
        this.yesButton.scale.set(0.5);
        this.yesButton.events.onInputDown.add(this.confirmQuit, this);

        this.noButton = this.mainGroup.create(gameCenterX + 60, gameCenterY + 70, 'genericButtons', 'btn-bg-small.png');
        this.noButton.anchor.set(0.5);
        this.noButton.scale.set(0.5);
        this.noButton.events.onInputDown.add(this.cancelQuit, this);

        this.yesText = this.game.add.text(gameCenterX - 60, gameCenterY + 70, 'Yes');
        this.yesText.anchor.set(0.5);
        this.yesText.font = 'Open Sans';
        this.yesText.fontWeight = 'bold';
        this.yesText.fontSize = 28;
        this.yesText.fill = 'white';

        this.noText = this.game.add.text(gameCenterX + 60, gameCenterY + 70, 'No');
        this.noText.anchor.set(0.5);
        this.noText.font = 'Open Sans';
        this.noText.fontWeight = 'bold';
        this.noText.fontSize = 28;
        this.noText.fill = 'white';

        this.mainGroup.add(this.yesButton);
        this.mainGroup.add(this.noButton);
        this.mainGroup.add(this.yesText);
        this.mainGroup.add(this.noText);
        break;

    }

    this.welcomeTitleText = this.game.add.text(gameCenterX, gameCenterY - 80);
    this.welcomeTitleText.anchor.set(0.5);
    this.welcomeTitleText.fontSize = 34;
    this.welcomeTitleText.font = 'Open Sans';
    this.welcomeTitleText.align = 'center';
    this.welcomeTitleText.lineSpacing = -8;
    this.welcomeTitleText.text = titleText;
    this.mainGroup.add(this.welcomeTitleText);

    this.welcomeText = this.game.add.text(gameCenterX, gameCenterY - 10);
    this.welcomeText.anchor.set(0.5);
    this.welcomeText.fontSize = 22;
    this.welcomeText.lineSpacing = -5;
    this.welcomeText.font = 'Open Sans';
    this.welcomeText.fontWeight = 'normal';
    this.welcomeText.text = bodyText;
    this.welcomeText.align = 'center';
    this.mainGroup.add(this.welcomeText);

    this.game.mainPopupGroup.add(this.mainGroup);


    if (this.type === 'welcome' && userName.length > 9) {
      this.welcomeTitleText.text = 'Welcome\n' + userName + '!';
      this.welcomeTitleText.y = gameCenterY - 60;
      this.welcomeText.y = gameCenterY + 10;
    }

    this.blackModal.alpha = 0;
    this.mainGroup.alpha = 0;

  },

  show: function () {
    if (this.type === 'quit') {
      this.yesButton.inputEnabled = true;
      this.yesButton.input.useHandCursor = true;
      this.noButton.inputEnabled = true;
      this.noButton.input.useHandCursor = true;
    } else {
      this.playButton.inputEnabled = true;
      this.playButton.input.useHandCursor = true;
    }
    TweenMax.to(this.blackModal, 0.5, {
      alpha: 0.65
    });
    TweenMax.to(this.mainGroup, 0.5, {
      alpha: 1,
      ease: Power0.easeNone
    });
  },

  hide: function () {
    this.disableInputs();
    TweenMax.to(this.blackModal, 0.5, {
      alpha: 0
    });
    TweenMax.to(this.mainGroup, 0.5, {
      alpha: 0,
      ease: Power0.easeNone
    });
  },

  clickStart: function () {
    this.clickSound.play();
    var _self = this;
    this.hide();
    this.appManagerRef.initializeGameContext();
    //this.clickedStart.dispatch();
  },

  confirmQuit: function () {
    this.clickSound.play();
    this.game.sound.mute = true;
    this.appManagerRef.quitGame();
    this.disableInputs();
  },

  cancelQuit: function () {
    this.clickSound.play();
    this.disableInputs();
    this.appManagerRef.cancelQuit();
  },

  disableInputs: function () {
    this.game.canvas.style.cursor = "default";
    if (this.type === 'quit') {
      this.yesButton.inputEnabled = false;
      this.noButton.inputEnabled = false;
    } else {
      this.playButton.inputEnabled = false;
    }
  }
};


module.exports = Popup;
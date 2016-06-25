'use strict';

var _ = require('underscore');
var TweenMax = require('gsap');
var Globals = require('./Globals');

var HudModule = function (game, gameManager, appManager, gameConfig, container, backColor) {
  this.gameRef = game;
  this.mainHudGroup = game.mainHudGroup;
  this.gameManagerRef = gameManager;
  this.appManagerRef = appManager;
  this.container = container;
  this.gameConfig = gameConfig;
  //this.mainColor = Phaser.Color.hexToColor(backColor);
  this.mainColor = backColor ? backColor : '0x7c92a3';
  this.mainColorCss = '#' + this.mainColor.slice(2,this.mainColor.length);
  console.log(this.mainColor)
  this.device = this.gameConfig.device;

  this.boldGreenStyle = {fill: backColor, fontSize: 12, fontWeight: 'bold'};
  this.boldRedStyle = {fill: "#ff3533", fontSize: 12, fontWeight: 'bold'};
  this.iconsStyle = {fill: "#fff", fontSize: 11, fontWeight: 'bold'};
  this.whiteBoldStyle = {fill: "#fff", fontSize: 12};
  this.clickSound = this.gameRef.add.audio('button-click');
};

HudModule.prototype = {
  initialize: function () {

    var hudHeight, iconSize, iconPosY,  scoreCounterXPos, textYPos, timeTextPosX, scoreTextPosX, iconBackColor, iconTint, volIconScale, volIconX, helpIconX, quitIconX, iconsAlpha;
    var game = this.gameRef;

    switch (this.device){
      case Globals.DESKTOP:
        hudHeight = 24;
        iconSize = 15;
        timeTextPosX = game.width - 116;
        textYPos = 4;
        scoreTextPosX = 35;
        scoreCounterXPos = 78;
        iconPosY = 12;
        iconBackColor = this.mainColor;
        iconTint = 0xffffff;
        volIconScale = 0.35;
        helpIconX = 0;
        volIconX = game.width - 40;
        quitIconX = game.width - 20;
        iconsAlpha = 1;
        this.boldGreenStyle = {fill: this.mainColorCss, fontSize: 12, fontWeight: 'bold'};
        this.boldRedStyle = {fill: "#ff3533", fontSize: 12, fontWeight: 'bold'};
        this.iconsStyle = {fill: "#fff", fontSize: 11, fontWeight: 'bold'};
        this.whiteBoldStyle = {fill: "#fff", fontSize: 12};
        break;
      case Globals.MOBILE:
        hudHeight = 62;
        iconSize = 62;
        timeTextPosX = game.width - 175;
        textYPos = 12;
        scoreTextPosX = 15;
        scoreCounterXPos = 115;
        iconPosY = 100;
        iconBackColor = this.mainColor
        iconTint = 0x838ee8;
        volIconScale = 0.9;
        helpIconX = 30;
        volIconX = game.width - 120;
        quitIconX = game.width - 50;
        iconsAlpha = 0.8;
        this.boldGreenStyle = {fill: this.mainColorCss, fontSize: 30, fontWeight: 'bold'};
        this.boldRedStyle = {fill: "#ff3533", fontSize: 30, fontWeight: 'bold'};
        this.iconsStyle = {fill: "#fff", fontSize: 40, fontWeight: 'bold'};
        this.whiteBoldStyle = {fill: "#fff", fontSize: 30};
        break;
    }
    //create all the required elements
    this.container ? this.hudGroup = this.container : this.hudGroup = game.add.group();

    this.currentScore = 0;

    //main hud
    this.hudBackground = game.add.graphics(0, 0);
    this.hudBackground.beginFill(0x000000);
    this.hudBackground.drawRect(0, 0, game.width, hudHeight);
    this.hudBackground.endFill();
    this.hudBackground.alpha = 0.6;

    //help icon
    this.helpIcon = game.add.group();
    this.helpIconBackground = game.add.graphics(0, 0);
    this.helpIconBackground.beginFill(iconBackColor);
    this.helpIconBackground.drawCircle(17.5, 0, iconSize);
    this.helpIconBackground.endFill();

    this.helpSign = game.add.text(17.5, 3, "?", this.iconsStyle);
    this.helpSign.font = 'Open Sans';
    this.helpSign.anchor.set(0.5);
    this.helpSign.boundsAlignH = 'center';
    this.helpSign.tint = iconTint;

    this.helpIcon.add(this.helpIconBackground);
    this.helpIcon.add(this.helpSign);
    this.helpIcon.y = iconPosY;
    this.helpIcon.x = helpIconX;
    this.helpIcon.alpha = iconsAlpha;

    //score text
    this.scoreTextGroup = game.add.group();
    this.scoreText = game.add.text(scoreTextPosX, textYPos, "Score:", this.boldGreenStyle);
    this.scoreText.font = 'Open Sans';

    this.scoreCounter = game.add.text(scoreCounterXPos, textYPos, '0', this.whiteBoldStyle);
    this.scoreCounter.font = 'Open Sans';

    this.scoreTextGroup.add(this.scoreText);
    this.scoreTextGroup.add(this.scoreCounter);

    //time text
    this.timeTextGroup = game.add.group();
    this.timeText = game.add.text(timeTextPosX, textYPos, 'Time:', this.boldGreenStyle);
    this.timeText.font = 'Open Sans';
    //this.timeCounter = game.add.text(game.width - 80, textYPos, '1:00', this.whiteBoldStyle);
    this.timeCounter = game.add.text(game.width - 80, textYPos, '', this.whiteBoldStyle);
    this.timeCounter.font = 'Open Sans';

    this.timeTextGroup.add(this.timeText);
    this.timeTextGroup.add(this.timeCounter);

    //volume icon
    this.volumeIcon = game.add.group();
    this.volumeIconBackground = game.add.graphics();
    this.volumeIconBackground.beginFill(iconBackColor);
    this.volumeIconBackground.drawCircle(0, 0, iconSize);
    this.volumeIconBackground.endFill();
    this.volumeIcon.add(this.volumeIconBackground);
    this.volIconImage = this.volumeIcon.create(0, 0, 'vol-icon');
    this.volIconImage.scale.set(volIconScale);
    this.volIconImage.anchor.set(0.5);
    this.volIconImage.tint = iconTint;
    this.volumeIcon.x = volIconX;
    this.volumeIcon.y = iconPosY;
    this.volumeIcon.alpha = iconsAlpha;

    //quit icon
    this.quitIcon = game.add.group();
    this.quitIconBackground = game.add.graphics(0, 0);
    this.quitIconBackground.beginFill(iconBackColor);
    this.quitIconBackground.drawCircle(0, 0, iconSize);
    this.quitIconBackground.endFill();
    this.quitSign = game.add.text(0, 2, 'x', this.iconsStyle);
    this.quitSign.tint = iconTint;
    this.quitSign.anchor.set(0.5);
    this.quitIcon.add(this.quitIconBackground);
    this.quitIcon.add(this.quitSign);
    this.quitIcon.x = quitIconX;
    this.quitIcon.y = iconPosY;
    this.quitIcon.alpha = iconsAlpha;

    this.hudGroup.add(this.hudBackground);
    this.hudGroup.add(this.helpIcon);
    this.hudGroup.add(this.scoreTextGroup);
    this.hudGroup.add(this.timeTextGroup);
    this.hudGroup.add(this.quitIcon);
    this.hudGroup.add(this.volumeIcon);

    this.hudGroup.alpha = 0;
    this.hudGroup.y = -this.hudGroup.height;

    if(this.gameConfig.hudLogo != undefined) {
      var posY = 100;
      switch(this.device) {
        case Globals.DESKTOP:
          posY = 70;
          break;
        case Globals.MOBILE:
          posY = 100;
          break;
      }
      this.hudLogo = game.add.image(game.width / 2,posY,this.gameConfig.hudLogo.name);
      this.hudLogo.anchor.set(0.5);
      this.hudGroup.add(this.hudLogo);
    }

    //Add all elements to the main group
    this.mainHudGroup.add(this.hudGroup);
    this.mainHudGroup.fixedToCamera = true;

    this.updateTime(this.gameManagerRef.gameTime);
    this.addEvents();
  },

  addEvents: function () {
    this.helpIcon.forEach(
        function (child) {
          child.inputEnabled = true;
          child.events.onInputDown.add(this.helpPressed, this);
          child.input.useHandCursor = true;
        }, this
    );
    this.quitIcon.forEach(
        function (child) {
          child.inputEnabled = true;
          child.events.onInputDown.add(this.quitGame, this);
          child.input.useHandCursor = true;
        }, this
    );
    this.volumeIcon.forEach(
        function (child) {
          child.inputEnabled = true;
          child.events.onInputDown.add(this.muteGame, this);
          child.input.useHandCursor = true;
        }, this
    );
  },

  helpPressed: function () {
    if (this.gameManagerRef.tutorialVisible){
      this.appManagerRef.hideTutorial();
    } else {
      this.appManagerRef.showTutorial();
      this.clickSound.play();
    }
  },

  quitGame: function () {
    this.clickSound.play();
    this.appManagerRef.quitWindow();
  },

  muteGame: function () {
    if (this.gameRef.sound.mute === false) {
      this.gameRef.sound.mute = true;
      this.volIconImage.frame = 1;
    } else {
      this.gameRef.sound.mute = false;
      this.volIconImage.frame = 0;
    }
    this.clickSound.play();
  },

  showHud: function () {
    TweenMax.to(this.hudGroup, 0.5, {
      y: 0,
      alpha: 1,
      delay: 0.3
    });
  },

  hideHud: function () {
    TweenMax.to(this.hudGroup, 0.5, {
      y: -this.hudHeight
    })
  },

  disableInputs: function () {
    this.helpIcon.forEach(
        function (child) {
          child.inputEnabled = false;
        }, this);
    this.quitIcon.forEach(
        function (child) {
          child.inputEnabled = false;
        }, this);
    this.volumeIcon.forEach(
        function (child) {
          child.inputEnabled = false;

        }, this);
  },

  endGameWithTime: function(score, time, multiplier) {
    this.countZeroInterval = setInterval(intLoop.bind(this), 10);
    this.currentSeconds = time;
    this.currentScore = score;
    var multi = multiplier;

    function intLoop () {
      this.currentSeconds--;
      this.currentScore = this.currentScore + multi;
      if(this.currentSeconds <= -1) {
        clearInterval(this.countZeroInterval)
      } else {
        this.updateTime(this.currentSeconds);
        this.updateScore(this.currentScore);
      }
    }
  },

  updateTime: function (timeInSeconds) {
    var minutes = Math.floor(timeInSeconds / 60);
    var seconds = minutes > 0 ? timeInSeconds - (minutes*60) : timeInSeconds;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    if (minutes === 0 && seconds <= 10) {
      this.timeCounter.tint = 0xff3533;
    } else {
      this.timeCounter.tint = 0xffffff;
    }

    this.timeCounter.text = minutes + ':' + seconds;
  },

  updateScore: function (score) {
    this.scoreCounter.text = score;
  }
};

module.exports = HudModule;
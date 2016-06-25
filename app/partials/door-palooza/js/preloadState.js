var sharedConfig = require('../../../common/shared-modules/sharedConfig');
var gameConfig = require('./config');

var preloadState = {
  init: function (cb) {
    this.callback = cb;
  },

  preload: function () {
    this.load.crossOrigin = 'anonymus';
    this.time.advancedTiming = true;

    this.loadTimer = this.time.create(false);

    //Load common images
    for (var i = 0; i < sharedConfig.hudAssets.length; i++) {
      var assetInfo = sharedConfig.hudAssets[i];
      this.load.spritesheet(assetInfo.name, assetInfo.path, assetInfo.width, assetInfo.height, assetInfo.frames);
    }
    //Load common sounds
    for (var k = 0; k < sharedConfig.soundAssets.length; k++) {
      var assetInfo = sharedConfig.soundAssets[k];
      this.load.audio(assetInfo.name, assetInfo.path);
    }
    //Load tutorial images
    for (var j = 0; j < gameConfig.tutorialFiles.length; j++) {
      var assetInfo = gameConfig.tutorialFiles[j];
      this.load.spritesheet(assetInfo.name, assetInfo.path, gameConfig.gameSize.width, gameConfig.gameSize.height);
    }
    //Load Game Images
    for (var l = 0; l < gameConfig.gameImages.length; l++){
      var img = gameConfig.gameImages[l];
      this.load.image(img.name, img.path, img.w, img.h);
    }
    //Load Game Spritesheets
    for (var m = 0; m < gameConfig.gameSpriteSheets.length; m++){
      var sprite = gameConfig.gameSpriteSheets[m];
      this.load.spritesheet(sprite.name, sprite.path, sprite.w, sprite.h, sprite.f);
    }
    //Load Game Sounds
    for (var n = 0; n < gameConfig.gameAudio.length; n++){
      var audio = gameConfig.gameAudio[n];
      this.load.audio(audio.name, audio.path);
    }

    this.load.atlasJSONHash('genericButtons', sharedConfig.sharedButtons.image, sharedConfig.sharedButtons.map);

  },

  create: function () {
    console.log("%c %c %c Welcome to PCH Games    %c  %c  http://www.pch.com/     %c %c ♩♫♯♩♬♬♪ ","background: #1e90ff","background: #1e90ff","color: #87ceeb; background: #00008B;","background: #1e90ff","background: #87ceeb","background: #1e90ff","color: #00008B; background: #fff");
    console.log('Game Loaded in: ' + this.loadTimer.elapsed + ' ms');
    var _self = this;

    if (this.loadTimer.elapsed > 3000) {
      this.removeInitialAnimation();
      this.loadTimer = null;
      this.callback();
    } else {
      setTimeout(function () {
        _self.removeInitialAnimation();
        _self.loadTimer = null;
        _self.callback();
      }, 3000 - this.loadTimer.elapsed);
    }
  },

  removeInitialAnimation: function () {
    var animation = document.getElementById('pchIntro');
    TweenMax.to(animation, 0.5, {
      autoAlpha: 0
    })
  }
};

module.exports = preloadState;
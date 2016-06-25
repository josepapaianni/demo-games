var sharedConfig = require('../../../common/shared-modules/sharedConfig');
var gameConfig = require('./config');
var TweenMax = require('gsap');
var _ = require('underscore');
var utils = require('../../../common/shared-modules/utils');

var WayOut = function (game) {
  this.mainGroup = game.add.group();

  this.rayLightGroup = game.add.group();
  this.rayLightGroup.x = game.world.centerX;
  this.rayLightGroup.y = game.world.centerY;

  for (var i = 0; i < 40; i++){
    var rayLight = this.rayLightGroup.create(0, 0, 'ray-light');
    rayLight.anchor.set(0.5,1);
    rayLight.scale.set(1.1);
    rayLight.alpha = 0;
    rayLight.angle = i * (360/40);
  }

  this.mainGroup.add(this.rayLightGroup);

  this.woodBack = this.mainGroup.create(game.world.centerX, game.world.centerY, 'wood-back');
  this.woodBack.anchor.set(0.5);

  this.matchedMsg = this.mainGroup.create(game.world.centerX, game.world.centerY - 50, 'matched-all');
  this.matchedMsg.anchor.set(0.5);

  this.wayOutMsg = game.add.text(game.world.centerX, game.world.centerY + 80);
  this.wayOutMsg.anchor.set(0.5);
  this.wayOutMsg.font = 'Open Sans';
  this.wayOutMsg.text = 'WAY TO GO!';
  this.wayOutMsg.align = 'center';
  this.wayOutMsg.fill = 'black';
  this.wayOutMsg.fontSize = 48;

  this.mainGroup.add(this.wayOutMsg);

  TweenMax.from(this.woodBack, 0.5,{
    y: game.height,
    alpha: 0,
    onStart: function(){
      TweenMax.from(this.woodBack.scale, 0.75,{
        x: 0,
        y: 0,
        ease: Power3.easeOut
      })
    },
    onStartScope: this
  });

  TweenMax.from(this.matchedMsg.scale, 1,{
    x: 0,
    y: 0,
    ease: Elastic.easeOut.config(1,0.5),
    delay: 0.5
  });

  TweenMax.from(this.wayOutMsg, 1,{
    alpha: 0,
    delay: 0.5
  });

  this.rayLightGroup.forEach(function(child){
    TweenMax.to(child, 1,{
      alpha: 0.6,
      delay: 1
    })
  });

  TweenMax.to(this.rayLightGroup, 10,{
    angle: 360,
    repeat: -1,
    ease: Power0.easeNone,
    delay: 1
  })
};

module.exports = WayOut;
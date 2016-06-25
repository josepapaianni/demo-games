var TweenMax = require('gsap');

var DoorModel = function(game, gameManager, gridX, gridY, cardType, startPosX, startPosY){
  this.type = cardType;
  this.gameRef = game;
  this.managerRef = gameManager;
  this.doorGroup = game.add.group();
  this.holder = this.doorGroup.create(0, 0, 'door-holder');
  this.matchImage = this.doorGroup.create(38, 0, 'items', cardType);
  this.likeThumb = this.doorGroup.create(3, 0, 'door-like');
  this.door = this.doorGroup.create(3, 0, 'door');
  this.door.modelRef = this;
  this.state = 0;
  this.textIsTweening = false;

  this.likeThumb.anchor.set(0, 0.5);
  this.holder.anchor.set(0, 0.5);
  this.matchImage.anchor.set(0.5, 0.5);
  this.matchImage.scale.set(0.9);
  this.door.anchor.set(0, 0.5);

  this.matchImage.alpha = 0;
  this.matchImage.y = cardType === 4 ? this.matchImage.y +5 : this.matchImage.y;
  this.likeThumb.alpha = 0;

  this.doorGroup.x = gridX * 80 + startPosX;
  this.doorGroup.y = gridY * 105 + startPosY;

};


DoorModel.prototype =  {

  initialize: function () {
    this.matchImage.alpha = 1;
    this.animationOpenDoor = this.door.animations.add('open', null, 20, false);
    this.animationCloseDoor = this.door.animations.add('close', [4, 3, 2, 1, 0], 20, false);
    this.tweenSelection = this.gameRef.add.tween(this.matchImage.scale);
    this.tweenSelection.to({x: 1.1, y: 1.1}, 250, Phaser.Easing.Back.Out);
    this.tweenSelection.yoyo(true, 125);
    this.door.inputEnabled = true;
    this.door.input.useHandCursor = true;
    this.door.events.onInputDown.add(this.managerRef.revealCard, this.managerRef);
    this.soundOpenDoor = this.gameRef.add.audio('sound-open-door');
  },

  openDoor: function(silent) {
    this.animationOpenDoor.play();
    if (!silent){
      this.soundOpenDoor.play();
    }
  },

  closeDoor: function() {
    this.animationCloseDoor.play();
  },

  matchSelection: function(){
    this.tweenSelection.start();
    this.showLikeThumb();
    this.hideDoor();
  },

  disableInput: function(){
    this.door.inputEnabled = false;
  },

  goOut: function (){
    this.goOutAnimation.start();
  },

  showCombo: function (count, score) {

    this.textIsTweening = true;

    var xx = this.doorGroup.position.x + this.holder.width;
    var yy = this.doorGroup.position.y - this.holder.height/2;

    if (count > 1){
      var style = { font: "40px HelveticaNeueLTStd-Blk", fill: "#fff100", align: 'right' };
      var text = this.gameRef.add.text(xx,yy, count, style);
      text.anchor.set(1, 0.5);
      text.stroke = "#7b79ff";
      text.strokeThickness = 10;
      text.setShadow(0,5,'#5656d2',0,true,false);

      var styleIna = { font: "16px HelveticaNeueLTStd-Blk", fill: "#fff100", align: 'left' };
      var textIna = this.gameRef.add.text(xx-5,yy,"IN A\nROW", styleIna);
      textIna.lineSpacing = -15;
      textIna.anchor.set(0, 0.5);
      textIna.stroke = "#7b79ff";
      textIna.strokeThickness = 8;
      textIna.setShadow(0,4,'#5656d2',0,true,false);

      TweenMax.from(text.scale, 0.75,{
        x: 0,
        y: 0,
        ease: Elastic.easeOut
      });

    TweenMax.from(textIna, 0.5,{
        alpha: 0,
        x: textIna.x+50,
        ease: Power4.easeOut
      });

      TweenMax.to([text, textIna], 0.5,{
        delay: 1,
        y:  text.y - 20,
        alpha: 0,
        ease: Power3.easeOut,
        onComplete: function () {
          this.textIsTweening = false;
          if (text){
            text.destroy();
          }
          if (textIna){
            textIna.destroy();
          }
        },
        onCompleteScope: this
      });
    }

    var pointsX = count >= 10 ? -25 : 0;
    var pointsY = text ? 30 : 0;

    var pointsStyle = { font: "14px HelveticaNeueLTStd-Blk", fill: "#fff100", align: 'center' };
    var pointsTxt = this.gameRef.add.text(xx + pointsX, yy + pointsY, '+' + score + 'PTS', pointsStyle);
    pointsTxt.anchor.set(0.5);
    pointsTxt.stroke = "#7b79ff";
    pointsTxt.strokeThickness = 10;
    pointsTxt.setShadow(0,5,'#5656d2',0,true,false);

    TweenMax.from(pointsTxt, 0.75,{
      x: pointsTxt.x + 50,
      alpha: 0,
      ease: Power4.easeOut
    });

    TweenMax.to(pointsTxt, 0.5,{
      delay: 1,
      y:  pointsTxt.y - 20,
      alpha: 0,
      ease: Power3.easeOut,
      onComplete: function () {
        if (pointsTxt){
          pointsTxt.destroy();
        }
      }
    });
  },

  hideDoor: function(){
    TweenMax.to(this.door, 0.5,{
      delay: 0.5,
      alpha:0
    })
  },

  showLikeThumb: function(){
    TweenMax.to(this.likeThumb, 0.5,{
      delay: 0.5,
      alpha: 1
    })
  }

};

module.exports = DoorModel;
var TweenMax = require('gsap');
var gameConfig = require('./config');

var CardModel = function (game, gameManager, cardInfo) {
  //Inherit Phaser Sprite Class
  var transparentPlaceholder = game.make.bitmapData(gameConfig.grid.width, gameConfig.grid.height);
  transparentPlaceholder.rect(0, 0, gameConfig.grid.width, gameConfig.grid.height, 'rgba(255,255,255,0)');

  Phaser.Sprite.call(this, game, 0, 0, transparentPlaceholder);
  this.hitArea = new Phaser.Rectangle(-gameConfig.grid.width / 2, -gameConfig.grid.height / 2, gameConfig.grid.width, gameConfig.grid.height);
  this.anchor.set(0.5);

  this.cardsScale = 1;
  this.gameManager = gameManager;
  this.kind = cardInfo.kind;
  this.number = cardInfo.number;
  this.color = cardInfo.color;
  this.frontFace = game.add.sprite(0, 0, 'pch-cards', this.number + (this.kind * 13));
  this.frontFace.anchor.set(0.5);
  this.frontFace.width = 0;
  this.frontFace.height = gameConfig.grid.height;
  this.backFace = game.add.sprite(0, 0, 'pch-cards', 61);
  this.backFace.anchor.set(0.5);
  this.backFace.width = gameConfig.grid.width;
  this.backFace.height = gameConfig.grid.height;
  this.addChild(this.frontFace);
  this.addChild(this.backFace);
  this.childCards = [];
  this.cardHolder = null;
  this.canFlip = false;
  this.isCovered = true;
  this.isInDeck = true;
  this.preDragPosition = null;
  this.initialPosition = null;
  //this.alpha = 0.5;
  game.world.add(this);
  this.clickCount = 0;
  this.initialize();
};

//Inherit Phaser Sprite Methods
CardModel.prototype = Object.create(Phaser.Sprite.prototype);
CardModel.prototype.constructor = CardModel;


CardModel.prototype.initialize = function () {
  this.events.onDragStart.add(this.startDragging.bind(this));
  this.events.onDragStop.add(this.stopDragging.bind(this))
};

CardModel.prototype.startDragging = function (card) {
  if (this.isReturning) return;
  this.gameManager.onStartDragging(this);
  card.parent.bringToTop(card);
  this.preDragPosition = {x: card.x, y: card.y};
};

//CardModel.prototype.isDragging = function () {
//  this.gameManager.onUpdateDragging(this);
//};

CardModel.prototype.stopDragging = function (obj, pointer) {
  if (this.isReturning) return;
  if (this.minDragMove()) {
    this.gameManager.onStopDragging(this);
  } else if (this.doubleClicked()) {
    this.gameManager.doubleClicked(this);
  } else {
    this.returnToPreviousPosition();
  }
};

CardModel.prototype.minDragMove = function () {
  var posX = Math.abs(this.position.x - this.preDragPosition.x);
  var posY = Math.abs(this.position.y - this.preDragPosition.y);
  if (posX > this.width || posY > this.height) {
    return true
  }
};

CardModel.prototype.doubleClicked = function () {
  console.log('double');
  if (new Date() - this.lastClick < 600) {
    return true;
  } else {
    this.lastClick = new Date();
  }
};

CardModel.prototype.flip = function (obj, pointer) {
  if (pointer.msSinceLastClick < 300) {
    this.gameManager.onDoubleClick(this);
    //obj.flipToFront();flipToFront
  }
};

CardModel.prototype.flipToFront = function () {
  this.isCovered = false;
  TweenMax.to(this.frontFace, 0.1, {
    delay: 0.1,
    width: gameConfig.grid.width
  });
  TweenMax.to(this.backFace, 0.1, {
    width: 0
  });
};


CardModel.prototype.flipToBack = function () {
  this.isCovered = true;
  TweenMax.to(this.backFace, 0.1, {
    delay: 0.1,
    width: gameConfig.grid.width
  });
  TweenMax.to(this.frontFace, 0.1, {
    width: 0
  });
};

CardModel.prototype.returnToPreviousPosition = function (cb) {
  this.isReturning = true;
  TweenMax.to(this, 0.2, {
    x: this.preDragPosition.x,
    y: this.preDragPosition.y,
    ease: Power2.easeOut,
    onComplete: function(){
      this.isReturning = false;
      if (cb) cb();
    },
    onCompleteScope: this
  })
};

CardModel.prototype.beat = function () {
  TweenMax.fromTo(this.scale, 0.1, {
    x: 1,
    y: 1
  }, {
    x: 1.1,
    y: 1.1,
    yoyo: true,
    repeat: 5,
    ease: Power3.easeOut
  });
};

CardModel.prototype.enableInputs = function () {
  this.inputEnabled = true;
  this.input.enableDrag();
};

CardModel.prototype.deactivateInputs = function () {
  if (this.input) {
    this.input.disableDrag();
    this.inputEnabled = false;
  }
};

module.exports = CardModel;
var TweenMax = require('gsap');
var gameConfig = require('./config');
var CardModel = require('./cardModel');
var _ = require('underscore');

var CardHoldersManager = function (game, parent, posX, posY) {
  this.area = game.add.sprite(posX, posY, 'pch-cards', 63);
  this.area.width = gameConfig.grid.width;
  this.area.height = gameConfig.grid.height;
  this.cardAdded = new Phaser.Signal();
  this.cardRemoved = new Phaser.Signal();
  this.gameManager = parent;
  this.childCards = [];
  this.initialHitArea = {
    x1: this.area.x,
    x2: this.area.x + this.area.width,
    y1: this.area.y,
    y2: this.area.y + this.area.height
  };

};

CardHoldersManager.prototype = {

  checkOnDrop: function (card) {
    var xMatch = card.x > this.initialHitArea.x1 && card.x < this.initialHitArea.x2;
    var yMatch = card.y > this.initialHitArea.y1 && card.y < this.initialHitArea.y2 + (this.childCards.length * gameConfig.mountedCardOffsetY);
    var isMatch = this.isCardMatchForHolder(card);
    if (xMatch && yMatch && isMatch) {
      return true
    }
  },

  addCard: function (card, animationParams) {

    var cards = this.getChildCards(card);

    this.cardAdded.dispatch();

    if (cards.length > 1) {
      this.removeChildCards(cards);
    }

    var animation = {
      moveTime: animationParams ? animationParams.moveTime : 0.15,
      delay: animationParams ? animationParams.delay : 0,
      onComplete: animationParams ? animationParams.onComplete : null
    };

    for (var j = 0; j < cards.length; j++) {
      cards[j].isReturning = true;
      var xPos = this.area.x + this.area.width / 2;
      var yPos = this.stackManager ? this.area.y + this.area.height / 2 : this.area.y + this.area.height / 2 + (this.childCards.length * gameConfig.mountedCardOffsetY);

      cards[j].cardHolder = this;
      this.childCards.push(cards[j]);

      cards[j].positionInStack = {x: xPos, y:yPos};

      TweenMax.to(cards[j], animation.moveTime, {
        x: xPos,
        y: yPos,
        onComplete: function(index){
          cards[index].isReturning = false;
          if (animation.onComplete){
            animation.onComplete()
          }
        },
        onCompleteParams: [j],
        delay: animation.delay
      });
    }
  },

  cleanChildsCards: function (card, isReturning){
    var cards = this.getChildCards(card);
    this.removeChildCards(cards, isReturning);
  },

  getChildCards: function (card){
    var cards = [];
    cards.push(card);
    for (var i = 0; i < card.children.length; i++) {
      if (card.children[i] instanceof CardModel) {
        cards.push(card.children[i]);
      }
    }
    return cards;
  },

  addChildToCards: function (card) {
    var cardHolderCards = this.childCards;
    var cardIndex = _.findIndex(cardHolderCards, card) + 1;
    var cardCount = 0;
    for (var i = cardIndex, len = cardHolderCards.length; i < len; i++) {
      cardCount++;
      cardHolderCards[i].previousGroup = this.gameManager.cardsGroup;
      cardHolderCards[i].x = 0;
      cardHolderCards[i].y = (gameConfig.mountedCardOffsetY * cardCount);
      card.addChild(cardHolderCards[i]);
    }
  },

  removeChildCards: function (cards, isReturning) {
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].previousGroup) {
        //I have to use a cached position when returning the card because the updated
        // absolute position of phaser.world is inaccurate when the callback is executed
        var cachedPos = isReturning ? cards[i].positionInStack : cards[i].world;
        cards[i].previousGroup.add(cards[i]);
        cards[i].previousGroup = null;
        cards[i].position.x = cachedPos.x;
        cards[i].position.y = cachedPos.y;
      }
    }
  },

  activateLastCard: function(){
    var card = this.childCards[this.childCards.length-1];
    if (card && card.isCovered){
      card.flipToFront();
      card.enableInputs();
    }
  },

  removeCards: function (index) {
    this.cardRemoved.dispatch();
    var len = this.childCards.length;
    this.childCards.splice(index, len - index);
  },

  getLastCard: function () {
    if (this.childCards.length > 0){
      return this.childCards[this.childCards.length-1]
    }
  },

  getNoCoveredCards: function () {
    return _.filter(this.childCards, function(card){
      return !card.isCovered;
    })
  },

  isCardMatchForHolder: function (card) {
    var lastCardAdded = this.childCards[this.childCards.length - 1];
    if (this.childCards.length === 0 && card.number === 12 || (lastCardAdded && lastCardAdded.number - 1 === card.number && lastCardAdded.color != card.color)) {
      return true
    }
  }
};


module.exports = CardHoldersManager;
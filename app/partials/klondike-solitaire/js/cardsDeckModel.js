var TweenMax = require('gsap');
var gameConfig = require('./config');
var _ = require('underscore');

var CardsDeckModel = function (gameManager, cards, posX, posY, cardsGroup) {
  this.cards = cards.slice(0);
  this.initialPosX = posX;
  this.initialPosY = posY;
  this.gameManager = gameManager;
  this.shuffleSound = this.gameManager.add.audio('sound-shuffling-short');
  this.restarted = false;

  var transparentPlaceholder = gameManager.make.bitmapData(gameConfig.grid.width, gameConfig.grid.height);
  transparentPlaceholder.rect(0, 0, gameConfig.grid.width, gameConfig.grid.height, 'rgba(255,255,255,0)');
  this.restartCard = cardsGroup.create(posX, posY, 'pch-cards', 63 );
  this.restartCard.width = gameConfig.grid.width;
  this.restartCard.height = gameConfig.grid.height;
  this.restartCard.anchor.set(0.5);
  cardsGroup.sendToBack(this.restartCard);

  this.hitArea = gameManager.add.sprite(posX, posY, transparentPlaceholder);
  this.hitArea.anchor.set(0.5);
  this.deckIndex = 0;
  this.showingCards = [];
  this.cardsRemovedInHand = 0;
  this.removedCardsFromDeck = 0;
  this.isTweenActive = false;
  this.cardsOnHand = gameConfig.cardsOnHand;
  this.initialize();
};

CardsDeckModel.prototype = {
  initialize: function () {
    this.cardsLenght = this.cards.length;
    for (var i = 0; i < this.cardsLenght; i++) {
      this.cards[i].x = this.initialPosX;
      this.cards[i].y = this.initialPosY;
    }
    this.hitArea.inputEnabled = true;
    this.hitArea.events.onInputDown.add(this.giveCards, this);
  },

  removeCardFromShowed: function () {
    this.cardsRemovedInHand = this.cardsRemovedInHand + 1;
    this.showingCards.splice(this.showingCards.length - 1, 1);
    this.cards.splice(this.showingCards.length, 1);
    this.removedCardsFromDeck++;
    this.activateNextCard();
  },



  giveCards: function () {
    if (!this.isTweenActive && this.gameManager.gameStarted) {
      if (this.cards.length - this.showingCards.length < this.cardsOnHand){
        this.cardsOnHand = this.cards.length - this.showingCards.length;
      }
      this.gameManager.restartHint();
      if (this.showingCards.length === this.cards.length){
        this.restartDeck();
      } else {
        this.disablePreviousCards(this.showNextCards.bind(this));
      }
    }
  },

  showNextCards: function () {
    for (var i = 0; i < this.cardsOnHand; i++) {
      var cardIndex = (this.deckIndex + i) - this.cardsRemovedInHand;
      this.showingCards.push(this.cards[cardIndex]);
      this.cards[cardIndex].parent.bringToTop(this.cards[cardIndex]);
      this.cards[cardIndex].initialPosition = {x: this.cards[cardIndex].x, y: this.cards[cardIndex].y};
      TweenMax.to(this.cards[cardIndex], 0.15, {
        x: this.cards[cardIndex].x + this.cards[cardIndex].width + ((this.cards[cardIndex].width * 0.4) * i) + gameConfig.grid.gutter,
        delay: 0.1 * i,
        onStart: function(){
          this.shuffleSound.play();
        },
        onStartScope: this,
        onComplete: function(card, i) {
          card.flipToFront();
          if (i === this.cardsOnHand - 1){
            this.isTweenActive = false;
            if (this.showingCards.length === this.cards.length){
              this.showRestart();
            }
          }
        },
        onCompleteParams: [this.cards[cardIndex], i],
        onCompleteScope: this
      })
    }
    this.activateNextCard();
    this.deckIndex = this.deckIndex + this.cardsOnHand;
    this.gameManager.hintLoop();
  },

  showRestart: function(){

  },

  restartDeck: function () {
    this.restarted = true;
    var cardsCount = this.showingCards.length;
    for (var i = 0; i < this.showingCards.length; i++){
      this.showingCards[i].flipToBack();
      this.showingCards[i].isReset = false;
      TweenMax.to(this.showingCards[i], 0.2,{
        x: this.initialPosX,
        ease: Power3.easeOut
      });
    }
    setTimeout(this.giveCards.bind(this), 250)
    this.deckIndex = 0;
    this.showingCards = [];
    this.cardsOnHand = gameConfig.cardsOnHand;
    this.cardsRemovedInHand = 0;
  },

  disablePreviousCards: function (showNextCards) {
    this.isTweenActive = true;
    var counter = 0;
    if (this.showingCards.length > 0){
      for (var i = 0; i < this.showingCards.length; i++){
        this.showingCards[i].deactivateInputs();
        this.showingCards[i].scale.set(1);
        if(!this.showingCards[i].isReset){
          TweenMax.to(this.showingCards[i], 0.2,{
            x: this.initialPosX + this.showingCards[i].width + gameConfig.grid.gutter,
            delay: counter,
            ease: Power3.easeOut
          });
          counter = counter + 0.05;
          this.showingCards[i].isReset = true;
        }
      }
    }
    setTimeout(showNextCards, counter * 1000 * 2);
  },

  activateNextCard: function () {
    if (this.showingCards.length > 0) {
      this.showingCards[this.showingCards.length - 1].enableInputs();
    }
  },

  removeFirstCardInDeck: function (){
    this.removedCardsFromDeck++;
    this.cards.splice(0,1);
  },

  getUpperCoveredCard: function () {
    for (var i = this.cards.length-1; i >= 0; i--){
      if (this.cards[i].isCovered){
        return this.cards[i]
      }
    }
  },

  deactivateInput: function () {
    this.hitArea.inputEnabled = false;
  },

  beatRestart: function () {
    TweenMax.fromTo(this.restartCard.scale, 0.1,{
      x: this.restartCard.scale.x,
      y: this.restartCard.scale.y
    }, {
      x: this.restartCard.scale.x + 0.1,
      y: this.restartCard.scale.y + 0.1,
      yoyo: true,
      repeat: 5,
      ease: Power3.easeOut
    });
  }


  //removePreviousCards: function (callback) {
  //  this.isTweenActive = true;
  //  for (var i = 0; i < this.showingCards.length; i++) {
  //    //this.showingCards[i].flipToBack();
  //    this.showingCards[i].parent.sendToBack(this.showingCards[i]);
  //    this.showingCards[i].deactivateInputs();
  //  }
  //  this.isTweenActive = false;
  //  this.cleanShowedCards();
  //  callback();
  //}


  //Remove previous cards from deck with tween
  //removePreviousCards: function (callback) {
  //  this.isTweenActive = true;
  //  for (var i = 0; i < this.showingCards.length; i++) {
  //    this.showingCards[i].flipToBack();
  //    this.showingCards[i].parent.sendToBack(this.showingCards[i]);
  //    this.showingCards[i].deactivateInputs();
  //    TweenMax.to(this.showingCards[i], 0.15, {
  //      x: this.showingCards[i].initialPosition.x,
  //      y: this.showingCards[i].initialPosition.y,
  //      delay: 0.15,
  //      onComplete: function (card, index) {
  //        if (index === this.showingCards.length - 1) {
  //          this.isTweenActive = false;
  //          this.cleanShowedCards();
  //          callback();
  //        }
  //      },
  //      onCompleteParams: [this.showingCards[i],i],
  //      onCompleteScope: this
  //    });
  //  }
  //},

};

module.exports = CardsDeckModel;

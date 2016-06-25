var TweenMax = require('gsap');
var gameConfig = require('./config');
var CardHoldersManager = require('./cardsHolderManager');
var _ = require('underscore');

var CardStackManager = function (game, parent, posX, posY) {
  CardHoldersManager.call(this, game, parent, posX, posY);
  this.stackManager = true;
};

CardStackManager.prototype = Object.create(CardHoldersManager.prototype);
CardStackManager.prototype.constructor = CardStackManager;

CardStackManager.prototype.checkOnDrop = function (card) {
  var xMatch = card.x > this.initialHitArea.x1 && card.x < this.initialHitArea.x2;
  var yMatch = card.y > this.initialHitArea.y1 && card.y < this.initialHitArea.y2 + (this.childCards.length * (this.area.height / 6));
  var isMatch = this.isCardMatchForHolder(card);
  if (xMatch && yMatch && isMatch) {
    return true
  }
};

CardStackManager.prototype.isCardMatchForHolder = function (card) {
  var lastCardAdded = this.childCards[this.childCards.length - 1];
  if (this.childCards.length === 0 && card.number === 0 || (lastCardAdded && lastCardAdded.number + 1 === card.number && lastCardAdded.kind === card.kind)) {
    return true
  }
};

module.exports = CardStackManager;
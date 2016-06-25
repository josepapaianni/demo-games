var _ = require('underscore');

var HintMachine = function (manager, cards, holders, stacks, deck) {
  this.gameManager = manager;
  this.cards = cards;
  this.holders = holders;
  this.stacks = stacks;
  this.deck = deck;
  this.cardsL = this.cards.length;
  this.holdersL = this.holders.length;
  this.stacksL = this.stacks.length;
};

HintMachine.prototype = {
  checkPossibleHints: function () {
    var movesDeckToStack = this.movementFromDeckToStack();
    var movesHolderToStack = this.movementFromHolderToStack();
    var movesDeckToHolder = this.movementFromDeckToHolder();
    var movesHolderToHolder = this.movementFromHolderToHolder();
    var childToHolders = this.movementChildsToHolder();
    var noMoreMoves = this.noMoreMoves();

    if (movesDeckToStack) {
      this.showHint(movesDeckToStack);
    } else if (movesHolderToStack) {
      this.showHint(movesHolderToStack);
    } else if (movesDeckToHolder) {
      this.showHint(movesDeckToHolder);
    } else if (movesHolderToHolder) {
      this.showHint(movesHolderToHolder);
    } else if (childToHolders){
      this.showHint(childToHolders);
    } else if (noMoreMoves){
      this.gameManager.gameEnd('nomoves');
    } else if (this.deck.cards.length > 0) {
      var card = this.deck.getUpperCoveredCard();
      this.showHint({cards: card});
    }

  },

  movementFromDeckToStack: function () {
    var availableCardOnDeck = this.deck.showingCards[this.deck.showingCards.length - 1];
    if (availableCardOnDeck) {
      for (var i = 0; i < this.stacksL; i++) {
        var stack = this.stacks[i];
        if (this.stacks[i].isCardMatchForHolder(availableCardOnDeck)) {
          return {cards: availableCardOnDeck, destinationCard: stack.childCards[stack.childCards.length - 1]}
        }
      }
    }
  },

  movementFromDeckToHolder: function () {
    var availableCardOnDeck = this.deck.showingCards[this.deck.showingCards.length - 1];
    if (availableCardOnDeck) {
      for (var i = 0; i < this.holdersL; i++) {
        var holder = this.holders[i];
        if (holder.isCardMatchForHolder(availableCardOnDeck)) {
          return {cards: availableCardOnDeck, destinationCard: holder.childCards[holder.childCards.length - 1]}
        }
      }
    }
  },

  movementFromHolderToStack: function () {
    for (var i = 0; i < this.holdersL; i++) {
      var holder = this.holders[i];
      var possibleCard = holder.childCards[holder.childCards.length - 1];
      if (possibleCard) {
        for (var j = 0; j < this.stacksL; j++) {
          var stack = this.stacks[j];
          if (stack.isCardMatchForHolder(possibleCard)) {
            return {cards: possibleCard, destinationCard: stack.childCards[stack.childCards.length - 1]}
          }
        }
      }
    }
  },

  movementFromHolderToHolder: function () {
    for (var i = 0; i < this.holdersL; i++) {
      var firstHolder = this.holders[i];
      var possibleCard = firstHolder.childCards[firstHolder.childCards.length - 1];
      if (possibleCard) {
        for (var j = 0; j < this.holdersL; j++) {
          var holder = this.holders[j];
          if (holder.isCardMatchForHolder(possibleCard) && !(this.checkIfSameParent(possibleCard, holder))) {
            return {cards: possibleCard, destinationCard: holder.childCards[holder.childCards.length - 1]};
          }
        }
      }
    }
  },

  movementChildsToHolder: function () {
    for (var i = 0; i < this.holdersL; i++) {
      var firstholder = this.holders[i];
      var availableCards = firstholder.getNoCoveredCards();
      if (availableCards.length > 1) {
        for (var j = 0; j < availableCards.length; j++) {
          for (var k = 0; k < this.holdersL; k++) {
            if (this.holders[k].isCardMatchForHolder(availableCards[j])) {
              var cardIndex = _.findIndex(firstholder.childCards, availableCards[j]);
              if (!(this.checkIfSameParent(availableCards[j], this.holders[k]))){
                var cardsToBeat = firstholder.childCards.slice(cardIndex, firstholder.childCards.length);
                var r = {cards: cardsToBeat, destinationCard: this.holders[k].childCards[this.holders[k].childCards.length-1]}
                console.log('child to holder', r);
                return r
              }
            }
          }
        }
      }
    }
  },

  noMoreMoves: function () {
    var cardsShowed = this.deck.cardsOnHand;
    for (var j = cardsShowed - 1; j < this.deck.cards.length; j+= cardsShowed){
      for (var i = 0; i < this.holdersL; i++) {
        var holder = this.holders[i];
        if (holder.isCardMatchForHolder(this.deck.cards[j])) {
          return false;
        }
      }
      for (var i = 0; i < this.stacksL; i++) {
        var holder = this.stacks[i];
        if (holder.isCardMatchForHolder(this.deck.cards[j])) {
          return false;
        }
      }
    }

    if(this.deck.restarted){
      return true;
    }
    //this.deck.restarted
  },

  checkTwoSpacesEmptyForK: function (card, holder) {
    var emptyHolders = _.filter(this.holders, function (holder) {
      return holder.childCards.length <= 0;
    });

    var coveredChild = card.cardHolder.childCards.length > 1;

    if (card.number === 12 && holder && emptyHolders.length > 0 && card.cardHolder.childCards.length > 0 && coveredChild) {
      return true
    }
  },

  checkIfSameParent: function (card, holder) {
    //todo: check for K double spaces
    var cardIndex = _.findIndex(card.cardHolder.childCards, card);
    var lastChildCard = card.cardHolder.childCards[cardIndex-1];
    var destinationCard = holder.getLastCard();

    if (lastChildCard && destinationCard && lastChildCard.number === destinationCard.number) {
      return true;
    } else if(!lastChildCard && !destinationCard) {
      return true;
    }
  },

  showHint: function (cardsObj) {
    if(!cardsObj.cards){
      this.deck.beatRestart();
      return;
    }
    var cardsToMove = cardsObj.cards;
    var secondCard = cardsObj.destinationCard;
    if (cardsToMove instanceof Array) {
      cardsToMove.forEach(function(obj){
        obj.beat();
      })
    } else {
      cardsToMove.beat();
    }
    if (secondCard) {
      secondCard.beat();
    }
  }
};


module.exports = HintMachine;
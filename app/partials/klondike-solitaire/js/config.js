var gameConfig = {

  gameName: 'Klondike Solitaire',

  device: 'desktop',

  cardsOnHand: 3,

  gameSize: {
    width: 800,
    height: 600
  },
  gameTime: 180,

  //grid in this case means the card size
  grid: {
    width: 75,
    height: 106,
    gutter: 32
  },

  mountedCardOffsetY: 20,

  gameImages: [
    {
      name: 'background',
      path: 'assets/images/background.jpg',
      w: 800,
      h: 600
    },
    {
      name: 'intro-logo-0',
      path: 'assets/images/intro-kl-0.png',
      w: 664,
      h: 241
    },
    {
      name: 'intro-logo-1',
      path: 'assets/images/intro-kl-1.png',
      w: 664,
      h: 241
    },
    {
      name: 'intro-logo-2',
      path: 'assets/images/intro-kl-2.png',
      w: 664,
      h: 241
    },
    {
      name: 'intro-logo-3',
      path: 'assets/images/intro-kl-3.png',
      w: 664,
      h: 241
    },
    {
      name: 'solitaire-logo',
      path: 'assets/images/intro-solitaire.png',
      w: 353,
      h: 83
    },
    {
      name: 'flakes',
      path: 'assets/images/flake-particle.png',
      w: 96,
      h: 108
    }
  ],

  gameSpriteSheets: [
    {
      name: 'pch-cards',
      path: 'assets/images/pch-cards.png',
      w: 100,
      h: 142,
      f: 65
    },
    {
      name: 'ingame-messages',
      path: 'assets/images/ingame-messages.png',
      w: 281,
      h: 110,
      f: 5
    }
  ],

  gameAudio: [
    {
      name: 'sound-game-end',
      path: 'assets/sounds/game-end.mp3'
    },
    {
      name: 'sound-gameplay',
      path: 'assets/sounds/gameplay.mp3'
    },
    {
      name: 'sound-shuffling',
      path: 'assets/sounds/shuffling.mp3'
    },
    {
      name: 'sound-shuffling-short',
      path: 'assets/sounds/shuffle-short.mp3'
    },
    {
      name: 'sound-intro',
      path: 'assets/sounds/intro-sound.mp3'
    }
  ],

  tutorialFiles: [
    {
      name: 'tutorial1',
      path: 'assets/images/tutorial/tutorial.jpg'
    }
  ]
};

module.exports = gameConfig;

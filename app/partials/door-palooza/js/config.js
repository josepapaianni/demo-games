var gameConfig = {

  gameName: 'Prize Door Palooza',

  device: 'desktop',

  comboMultiplier: 5,

  doorPointsValue: 10,

  //The max number of
  gridSize: {
    totalColumns: 8,
    totalRows: 4,
    w: 70,
    h: 95,
    gutter: 10,
    borderOffset: 5
  },

  //The initial Y pos of the first row
  doorsInitialOffsetY: 390,

  gameSize: {
    width: 800,
    height: 525
  },
  gameTime: 180,

  difficultyLevels: [
    {
      rows: 1,
      neededMatches: 4,
      maxTime: null,
      yOffset: 0
    },
    {
      rows: 2,
      neededMatches: 8,
      maxTime: null,
      yOffset: 85
    },
    {
      rows: 3,
      neededMatches: 12,
      maxTime: null,
      yOffset: 185
    },
    {
      rows: 4,
      neededMatches: 16,
      maxTime: null,
      yOffset: 270
    }
  ],

  gameImages: [
    {
      name: 'background',
      path: 'assets/images/background.jpg',
      w: 800,
      h: 600
    },
    {
      name: 'home-image',
      path: 'assets/images/house.png',
      w: 800,
      h: 718
    },
    {
      name: 'street-image',
      path: 'assets/images/street.png',
      w: 800,
      h: 126
    },
    {
      name: 'door-holder',
      path: 'assets/images/door-holder.png',
      w: 70,
      h: 95
    },
    {
      name: 'game-logo',
      path: 'assets/images/game-logo-big.png',
      w: 540,
      h: 309
    },
    {
      name: 'door-like',
      path: 'assets/images/door-like.png',
      w: 64,
      h: 89
    },
    {
      name: 'wood-back',
      path: 'assets/images/wood-back.png',
      w: 497,
      h: 296
    },
    {
      name: 'ray-light',
      path: 'assets/images/ray-light.png',
      w: 23,
      h: 470
    },
    {
      name: 'matched-all',
      path: 'assets/images/matched-all.png',
      w: 350,
      h: 125
    }
  ],

  gameSpriteSheets: [
    {
      name: 'door',
      path: 'assets/images/door-table.png',
      w: 64,
      h: 99,
      f: 5
    },
    {
      name: 'items',
      path: 'assets/images/match-items.png',
      w: 70,
      h: 95,
      f: 16
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
      name: 'sound-correct-match',
      path: 'assets/sounds/correct-match.mp3'
    },
    {
      name: 'sound-game-end',
      path: 'assets/sounds/game-end.mp3'
    },
    {
      name: 'sound-game-intro',
      path: 'assets/sounds/game-intro.mp3'
    },
    {
      name: 'sound-gameplay',
      path: 'assets/sounds/gameplay.mp3'
    },
    {
      name: 'sound-incorrect-match',
      path: 'assets/sounds/incorrect-match.mp3'
    },
    {
      name: 'sound-open-door',
      path: 'assets/sounds/open-door.mp3'
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

var gameConfiguration = {

  welcomePopup:{
    mobileSize: {
      width: 560,
      height: 350
    },
    desktopSize: {
      width: 400,
      height: 250
    },
    message: function (userName){
      return 'Welcome '+userName+'!';
    }

  },

  introAnimation: {
    waitingTime: 3000
  },

  sharedButtons: {
    image: 'http://cdn.pch.com/spectrum/games/images/generic.png',
    map: 'http://cdn.pch.com/spectrum/games/images/generic.json'
  },
  soundAssets: [
    {
      name: 'clock-tick',
      path: 'assets/sounds/clock.mp3'
    },
    {
      name: 'button-click',
      path: 'assets/sounds/button.mp3'
    }
  ],
  hudAssets: [
    {
      name: 'vol-icon',
      path: 'assets/images/vol-icon.png',
      width: 32,
      height: 32,
      frames: 2
    }
  ]

};

module.exports = gameConfiguration;
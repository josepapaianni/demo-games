module.exports = {
  gameProxy: {
    registerStartFunction: function(callback) {
      callback({
        "user": {
          "firstName": "Blackjack",
          "lastName": "Player"
        },
        "setup": {
          "id": 6227,
          "gameTokenValue": 100,
          "policy": "http://rules.pch.com/viewrulesfacts?mailid=IWE-93#facts",
          "rules": "http://rules.pch.com/viewrulesfacts?mailid=IWE-93",
          "standardErrorMessage": "we're experiencing technical difficulties. Please try again later.",
          "timeout": 20,
          "url": "http://www.pch.com/game/index.php",
          "chipsBetMax": 10000,
          "chipsBetMin": 500,
          "chipsBetInc": 100,
          "chipsBetDefault": 2000,
          "roundsTotal": 30
        },
        "game": {
          "game": {
            "status": "active",
            "round": 1,
            "token": 30923094820398
          },
          "player": {
            "chips": 100000,
            "hands": [
              {
                "bet": 300,
                "status": "active",
                "cards": ["d01.png", "d02.png"]
              }
            ]
          },
          "dealer": {
            "status": "pending",
            "cards": ["s03.png", "s04.png"]
          }
        }
      });
    },
    gameStart: function(callback) {
      callback({
        response: {
          type: "winner",
          data: {
            description: "You have won $100!!!",
            prizeType: { name: "Token" },
            prizeValue: 5000,
            timeStamp: "Mon Jun 03 16:35:07 EDT 2013",
            claimUrl: "https://claim.pch.com/claim/fb/..."
          }
        }
      });
    },
    gameEvent: function(event, data, callback) {
      console.log(event, data);
    },
    gameEnd: function(callback) {
      callback(null);
    }
  }
};

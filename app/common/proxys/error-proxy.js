var PCH = {
  gameProxy: {
    registerStartFunction: function(callback) {
      callback({
        "user": {
          "firstName": "Nestor",
          "lastName": "Katz"
        },
        "game": {
          id: 6227,
          gameTokenValue: 100,
          policy: "http://rules.pch.com/viewrulesfacts?mailid=IWE-93#facts",
          rules: "http://rules.pch.com/viewrulesfacts?mailid=IWE-93",
          standardErrorMessage: "we're experiencing technical difficulties. Please try again later.",
          timeout: 20,
          url: "http://www.pch.com/game/index.php"
        }
      });
    },
    gameStart: function(callback) {
      callback({
        response: {
          type: "error",
          data: {
            message: "Error message",
            code: 123
          }
        }
      });
    },
    gameEvent: function(game, data, callback) {
      callback(null);
    },
    gameEnd: function(callback) {
      callback(null);
    }
  }
};

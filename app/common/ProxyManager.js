var ProxyManager = function (proxy) {

  var gameResults;

  function _gameStart(callback) {
    proxy.gameStart(function (data) {
      var dataType;
      if (data.response) {
        gameResults = data.response;
      } else {
        gameResults = data;
      }
      if (gameResults.type) {
        dataType = gameResults.type.toLocaleLowerCase();
      }
      if (dataType == "error") {
        $(".content p").addClass("error").html("Error: " + gameResults.data.message);
        $(".content .play_now_button").hide();
        $(".content .loading").hide();
        proxy.gameEvent(
          "end",
          {
            "status": gameResults.data.code,
            "errordesc": gameResults.data.message
          },
          function() {
            console.log("end with error")
          }
        );
      } else if (dataType == "winner" && gameResults.data.prizeValue > 0) {
        callback();
      } else if ((!$.isNumeric(gameResults.data.prizeValue)) || gameResults.data.prizeValue <= 0) {
        $(".content p").addClass("error").html("Error: Technical Difficulties");
        $(".content .loading").hide();
        $(".content .play_now_button").hide();
        proxy.gameEvent(
          "end",
          {
            "status": 3,
            "errordesc": "Technical difficulties"
          },
          function() {
            console.log("end with technical difficulties")
          }
        );
      }
    });
  }

  function _registerStartFunction(callback) {
    proxy.registerStartFunction(callback);
  }

  function _gameEnd(score) {
    proxy.gameEvent('end', {'d':score})
  }

  function _isPrizeCashstar() {
    return gameResults.data.prizeType.name.toLocaleLowerCase() == "cashstar";
  }

  function _isPrizeCashCertificate() {
    return gameResults.data.prizeType.name.toLocaleLowerCase() == "certificate";
  }

  function _isPrizeCash() {
    return gameResults.data.prizeType.name.toLocaleLowerCase() == "cash";
  }

  function _isPrizeToken() {
    var prizeTypeName = gameResults.data.prizeType.name.toLocaleLowerCase();
    return prizeTypeName == "token" || prizeTypeName == "tokens";
  }

  function _prizeValue() {
    return gameResults.data.prizeValue;
  }

  return {
    gameStart: _gameStart,
    registerStartFunction: _registerStartFunction,
    gameEnd: _gameEnd,
    isPrizeCash: _isPrizeCash,
    isPrizeToken: _isPrizeToken,
    isPrizeCashstar: _isPrizeCashstar,
    isPrizeCashCertificate: _isPrizeCashCertificate,
    prizeValue: _prizeValue
  }
};

module.exports = ProxyManager;
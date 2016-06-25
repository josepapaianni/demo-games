var Utils = function() {

  this.readCookie = function (name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  };

  this.createCookie = function (name, value, days){
    var expires;
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toGMTString();
    }
    else {
      expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
  };

  this.eraseCookie = function (name) {
    this.createCookie(name, "", -1);
  };

  this.userWantToSeeTutorial = function () {
    var doesUserDontWantToSee = (this.readCookie('showTutorial')) ? this.readCookie('showTutorial') : 'true';

    if (doesUserDontWantToSee === 'true') {
      this.createCookie('showTutorial', 'true', 10000);
      return true;
    }
    else {
      this.createCookie('showTutorial', 'false', 10000);
      return false;
    }
  };

  this.standarizeName = function(name){
    var na = name.replace(/ /g, '');
    var fistLetter = na[0].toLowerCase();
    na = na.slice(1, na.length);
    na = fistLetter + na;
    return na;
  };

  this.getSavedPreference = function (gameName, preference) {
    if (typeof(Storage) !== 'undefined'){
      var gameName = this.standarizeName(gameName);
      var stored = localStorage.getItem(gameName + '-' + preference);
      var parsed = JSON.parse(stored);
      parsed = parsed === null ? true : parsed;
      return parsed;
    }
  };

  this.savePreference = function (gameName, preference) {
    if(typeof(Storage) !== "undefined") {
      var gameName = this.standarizeName(gameName);
      var wantsToSeeTutorial = this.getSavedPreference(gameName, preference);
      wantsToSeeTutorial = wantsToSeeTutorial ? false : true;
      //this.userWantToSee = wantsToSeeTutorial;
      localStorage.setItem(gameName + '-' + preference, wantsToSeeTutorial);
      return wantsToSeeTutorial
    }
  }

};

module.exports = new Utils();


var AppManager = require('./appManager');

//Google web font loader
WebFontConfig = {
  google: { families: [ 'Open+Sans:400,700:latin' ] }
};

(function(d) {
  var wf = d.createElement('script'), s = d.scripts[0];
  wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.5.18/webfont.js';
  s.parentNode.insertBefore(wf, s);
})(document);

//On DOM ready load the game
document.addEventListener("DOMContentLoaded", function(event) {

  var appManager = new AppManager();

  appManager.initialize();

});






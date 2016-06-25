// create a PCH namespace
if( !window.PCH ) {
  var PCH = window.PCH = {};
}

/**
 * this object will proxy game events and game data
 * to ehe gameDelegate on the parent page
 *
 * @scope   public
 *
 */
PCH.gameProxy = ( function( win, doc, undefined ) {
  "use strict";

  // internal variables
  var gameProxy,
    startFunction,
    cbCollection = {},
    commands,
    delegateID,
    loc = window.location,
    domain = loc.protocol + "//" + loc.hostname;


  //doc.domain = domain;


  // normalize event handling across browsers
  function addEvent( element, type, handler ){
    if( element.addEventListener ) {
      element.addEventListener( type, handler, false );
    } else if( element.attachEvent ){
      element.attachEvent( "on" + type, handler );
    } else {
      element[ "on" + type ] = handler;
    }
  }

  // return a unique ID and add it to the callback collection mapped to ID
  function generateKeyAndStoreCb( cb ) {
    // stole this from the internet, it makes unique IDs
    var UUID = function() {
      var d = new Date().getTime(),
        uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace( /[xy]/g, function( c ) {
          var r = ( d + Math.random() * 16 ) % 16 | 0;
          d = Math.floor( d / 16 );
          return ( c === "x" ? r : ( r & 0x7 | 0x8 ) ).toString( 16 );
        } );
      return uuid;
    }();

    // add the ID and its callback to the collection
    cbCollection[ UUID ] = cb;

    return UUID;
  }

  // send a string based message to the parent page
  function sendMessage( msg ) {
    win.parent.postMessage( JSON.stringify( msg ), "http://localhost:8000" );
  }

  // listen for incoming mesages and route accordingly
  addEvent( win, "message", function( e ) {
    var evt = e || win.event, // normalize event
      data;

    if( evt.origin === domain ) { // make sure this is a trusted domain
      data = JSON.parse( evt.data ); // parse string into JSON
      if( data.command ) {
        commands[ data.command.toLowerCase() ]( data.args ); // execute command
      } else if( data.callback ) {
        cbCollection[ data.callback ]( data.args ); // invoke callback from collection
      }
    }
  } );


  // internal singelton used to proxy game events to the parent page
  gameProxy = {
    // initalize game once iframe is loaded
    initGame: function( args ) {
      delegateID = args.UUID;
      startFunction( {
        user: args.user,
        game: args.game
      } );
    },
    // send gameEvent data for backend service
    gameEvent: function( event, data, cb ) {
      sendMessage( {
        "delegateID": delegateID,
        "event": event,
        "gamedata": data,
        //"callbackID": generateKeyAndStoreCb( cb )
      } );
    },
    // gameStart alias to gameEvent
    gameStart: function( cb ) {
      this.gameEvent( "start", null, cb );
    },
    // gameEnd alias to gameEvent
    gameEnd: function( cb ) {
      this.gameEvent( "end", null, cb );
    },
    // function the game registers to be called later to start the game
    registerStartFunction: function( fn ) {
      startFunction = fn;
    }/*,
     // for debugging variables inside the closure
     printCbCollection: function() {
     console.log( cbCollection );
     }*/

  };


  // collection of allowed commands
  commands = {
    "initgame": gameProxy.initGame/*,
     "printcbcollection": gameProxy.printCbCollection*/
  };

  // make the internal object public
  return gameProxy;


} )( window, this.document );

module.exports = PCH;

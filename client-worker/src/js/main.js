var modifyDepthButton = document.querySelector('.depth-modifier');
var ws = "";
var reelSound = new Audio('src/sound/reel.mp3')

var updateDepth = function() {
  ws.send('x')
  reelSound.currentTime = 0;
  reelSound.play();
}

// var $SERVER = "localhost";

function initWs() {
  ws = new WebSocket("ws://" + $SERVER + ":8080");

  ws.onmessage = function(event) {
    if (event.data == 'disable') {
      modifyDepthButton.disabled = true;
    } else if (event.data == 'enable') {
      modifyDepthButton.disabled = false;
    }
  }

  ws.onopen = function(event) {
    console.log('connection opened');
    modifyDepthButton.addEventListener('click', updateDepth)
    modifyDepthButton.disabled = false;
  }

  ws.onclose = function() {
    //try to reconnect in 5 seconds
    setTimeout(function() {
      initWs();
      modifyDepthButton.disabled = true;
      modifyDepthButton.removeEventListener('click', updateDepth)
      console.log('reconnecting')
    }, 200);
  };

}

initWs();

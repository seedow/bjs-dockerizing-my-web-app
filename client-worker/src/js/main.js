var modifyDepthButton = document.querySelector('.depth-modifier');
var ws = "";
var updateDepth = function() {
  ws.send('x')
}

function initWs() {
  ws = new WebSocket("ws://192.168.2.15:8080");

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

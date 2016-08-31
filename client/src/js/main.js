window.onload = function() {

  function initWs() {
    // var $SERVER = "localhost"
    ws = new WebSocket("ws://" + $SERVER + ":8080");

    ws.onopen = function() {
      ws.send('depthPing')
    }

    ws.onmessage = function(event) {
      updateDepth(event.data)
    }

    ws.onclose = function() {
      //try to reconnect in 5 seconds
      setTimeout(function() {
        initWs();
        console.log('reconnecting')
      }, 200);
    };

  }

  initWs();


  var audio = new Audio('src/sound/water.mp3');
  audio.play();

  var hook = document.querySelector('.hook');
  var bottle = document.querySelector('.bjs-bottle');
  var depth = document.querySelector('.depth');


  updateDepth = function(newDepth) {
    if (newDepth == 199) {
      hook.classList.add('pull-up');
      bottle.classList.add('bottle-pull-up');
    }
    if (newDepth == 1) {
      hook.classList.remove('pause');
      bottle.classList.remove('pause');
    }
    depth.innerHTML = newDepth + " METERS DEEP";
  }


  hook.addEventListener('animationiteration', function() {
    hook.classList.add('pause');
    bottle.classList.add('pause');
  });

  bottle.addEventListener('animationend', function() {
    this.style.opacity = 0;
  })

}

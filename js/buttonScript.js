function launchGame(iframePath) {
    document.getElementById("jsgame").setAttribute("src", iframePath);
    var elem = document.getElementById("jsgame");
    elem.width = 480;
    elem.height = 360;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
    //document.getElementById("myButton").setAttribute("disabled", true);
}

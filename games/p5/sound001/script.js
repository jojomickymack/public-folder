var song;

var light, dark, current;
var changing = false;
var lerpCounter = 0.0;
var lerpInc = -0.01;

function preload() {
    song = loadSound('sound.ogg');
}

function setup() {
    light = color(168, 240, 122);
    dark = color(68, 53, 91);
    current = light;

    var myCanvas = createCanvas(windowWidth, windowHeight);
    myCanvas.parent('myCanvas');
    song.loop(); // song is ready to play during setup() because it was loaded during preload
    background(current);

    img = loadImage('boombox1.png');
}

function draw() {
    if (changing) {
        lerpCounter += lerpInc;
        current = lerpColor(light, dark, lerpCounter);
        if (lerpCounter >= 1.0 || lerpCounter <= 0.0) changing = false;
    }

    background(current)
    textSize(18);
    fill(0, 102, 153);
    text('click/touch the window to pause/play the sound', 10, 30);
    image(img, width / 2 - img.width / 2, height / 2 - img.height / 2);
}

function touchStarted() {
    switchState();
    return false;
}

function mousePressed() {
    switchState();
}

function switchState() {
    changing = true;
    lerpInc *= -1;

    if (song.isPlaying()) song.pause(); else song.play();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

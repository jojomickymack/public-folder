
var Spiral = function() {
    this.xpos = random(0, width);
    this.ypos = random(0, height);
    this.size = random(0, 1);
    this.offset = random(2, 10);
    this.iterations = random(1000, 10000);
    this.rotation = random(10, 50);
    this.r = random(0, 255);
    this.g = random(0, 255);
    this.b = random(0, 255);
};

var mySpirals = [];
var bgFillColor = {};

function setup() {
    var myCanvas = createCanvas(windowWidth, windowHeight);
    myCanvas.parent('myCanvas');
    reset();
}

function reset() {
    bgFillColor = {
        r: random(0, 255),
        g: random(0, 255),
        b: random(0, 255)
    };
    for (var i = 0; i < 8; i++) {
        mySpirals[i] = new Spiral();
    }
}

function draw() {
    clear();
    background(bgFillColor.r, bgFillColor.g, bgFillColor.b);
    for (var i = 0; i < mySpirals.length; i++) {
        translate(mySpirals[i].xpos, mySpirals[i].ypos);
        rotate(frameCount / mySpirals[i].rotation);
        stroke(mySpirals[i].r, mySpirals[i].g, mySpirals[i].b);
        fill(bgFillColor.r, bgFillColor.g, bgFillColor.b);
        beginShape();
        for (var j = 0; j < mySpirals[i].iterations; j++) {
          var t = radians(j) * mySpirals[i].size;
          var x = t * cos(t) * mySpirals[i].offset;
          var y = t * sin(t) * mySpirals[i].offset;
          vertex(x, y);
        }
        endShape();
        rotate(-frameCount / mySpirals[i].rotation);
        translate(-mySpirals[i].xpos, -mySpirals[i].ypos);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    reset();
}

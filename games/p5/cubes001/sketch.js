var myCubes = []

var Cube = function() {
    this.xpos = random(0, width/8);
    this.ypos = random(0, height/8);
    this.zpos = random(0, width/8);
    this.xsize = random(25, 200);
    this.ysize = random(25, 200);
    this.zsize = random(25, 200);
};

function setup(){
    var myCanvas = createCanvas(windowWidth, windowHeight, WEBGL);
    myCanvas.parent('myCanvas');
    reset();
}

function mousePressed() {
    reset();
}

function reset() {
    for (var i = 0; i < 10; i++) {
        myCubes[i] = new Cube();
    }
}

function draw(){
    background(175);

    for (var i = 0; i < myCubes.length; i++) {
        translate(myCubes[i].xpos, myCubes[i].ypos, myCubes[i].zpos);
        push();
        rotateZ(frameCount * 0.01);
        rotateX(frameCount * 0.01);
        rotateY(frameCount * 0.01);
        box(myCubes[i].xsize, myCubes[i].ysize, myCubes[i].zsize)
        pop();
        translate(-myCubes[i].xpos, -myCubes[i].ypos, -myCubes[i].zpos);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    reset();
}

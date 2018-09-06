


function setup(){
    var myCanvas = createCanvas(windowWidth, windowHeight, WEBGL);
    myCanvas.parent('myCanvas');
}

function draw(){
    clear();
    translate(240, 0, 0);
    push();
    rotateZ(frameCount * 0.01);
    rotateX(frameCount * 0.01);
    rotateY(frameCount * 0.01);
    sphere(width);
    pop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

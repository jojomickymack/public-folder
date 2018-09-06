// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Forces (Gravity and Fluid Resistence) with Vectors

// Demonstration of multiple force acting on bodies (Mover class)
// Bodies experience gravity continuously
// Bodies experience fluid resistance when in "water"

// Five moving bodies
var movers = [];

// Liquid
var liquid;

function setup() {
    var myCanvas = createCanvas(windowWidth, windowHeight);
    myCanvas.parent('myCanvas');
    reset();
}

function reset() {
    // Create liquid object
    liquid = new Liquid(0, height/3, width, height, 0.5);

    for (var i = 0; i < 150; i++) {
        movers[i] = new Mover(random(2.25, 7), random(0, width), 0);
    }
}

function draw() {
    background(90, 0, 190);

    // Draw water
    liquid.display();

    for (var i = 0; i < movers.length; i++) {
        if (movers[i].dead == true) {
            movers[i] = new Mover(random(1.7, 3), random(0, width), 0);
        }

        // Is the Mover in the liquid?
        if (liquid.contains(movers[i])) {
            // Calculate drag force
            var dragForce = liquid.calculateDrag(movers[i]);
            // Apply drag force to Mover
            movers[i].applyForce(dragForce);
        }

        // Gravity is scaled by mass here!
        var gravity = createVector(0, 0.1*movers[i].mass);
        // Apply gravity
        movers[i].applyForce(gravity);

        // Update and display
        movers[i].update();
        movers[i].display();
        movers[i].checkEdges();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    reset();
}

var system;

function setup() {
  var myCanvas = createCanvas(windowWidth, windowHeight);
  myCanvas.parent('myCanvas');
  reset();
}

function reset() {
    system = new ParticleSystem(createVector(width/2, height/2));
}

function draw() {
  background(255, 105, 180);
  system.addParticle();
  system.run();
}

// A simple Particle class
var Particle = function(position) {
  this.acceleration = createVector(0, 0.1);
  this.velocity = createVector(random(-4, 4), random(-4, 0));
  this.position = position.copy();
  this.lifespan = 500;
};

Particle.prototype.run = function() {
  this.update();
  this.display();
};

// Method to update position
Particle.prototype.update = function(){
  this.velocity.add(this.acceleration);
  this.position.add(this.velocity);
  this.lifespan -= 2;
};

// Method to display
Particle.prototype.display = function() {
  stroke(0);
  strokeWeight(2);
  fill(200, 200, 0);
  ellipse(this.position.x, this.position.y, 24, 24);
};

// Is the particle still useful?
Particle.prototype.isDead = function(){
  if (this.lifespan < 0) {
    return true;
  } else {
    return false;
  }
};

var ParticleSystem = function(position) {
  this.origin = position.copy();
  this.particles = [];
};

ParticleSystem.prototype.addParticle = function() {
  this.particles.push(new Particle(this.origin));
};

ParticleSystem.prototype.run = function() {
  for (var i = this.particles.length-1; i >= 0; i--) {
    var p = this.particles[i];
    p.run();
    if (p.isDead()) {
      this.particles.splice(i, 1);
    }
  }
};

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    reset();
}

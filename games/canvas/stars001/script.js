var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var bgr = Math.floor(Math.random() * 255);
var bgg = Math.floor(Math.random() * 255);
var bgb = Math.floor(Math.random() * 255);

var frameCount = 0;
var starCount = 50;
var stars = [];
var rotationSpeed = 0.07;

var requestAnimationFrame = window.requestAnimationFrame ||
                            window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame ||
                            window.msRequestAnimationFrame;

function drawStar(star, index) {
    var centerx = Math.floor(Math.random() * canvas.width);
    var centery = Math.floor(Math.random() * canvas.height);
    var points = 5
    var outerRadius = 40;
    var innerRadius = 20;

    var rot = Math.PI / 2 * 3;
    var step = Math.PI / points;

    ctx.translate(star.xpos, star.ypos);
    ctx.rotate(frameCount * rotationSpeed);
    ctx.beginPath();
    ctx.moveTo(0, 0 - outerRadius)

    for (var i = 0; i < points; i++) {
        var x = 0 + Math.cos(rot) * outerRadius;
        var y = 0 + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y)
        rot += step

        x = 0 + Math.cos(rot) * innerRadius;
        y = 0 + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y)
        rot += step
    }

    ctx.lineTo(0, 0 - outerRadius);
    ctx.rotate(-frameCount * rotationSpeed);
    ctx.closePath();

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black'
    ctx.stroke();
    ctx.fillStyle = 'rgb(' + star.r + ', ' + star.g + ', ' + star.b + ')';;
    ctx.fill();
    ctx.translate(-star.xpos, -star.ypos);
}

function drawStars() {
    ctx.fillStyle = 'rgb(' + bgr + ', ' + bgg + ', ' + bgb +')';
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();

    frameCount++;
    stars.forEach(drawStar);
    requestAnimationFrame(drawStars);
}

var Star = function(xpos, ypos, r, g, b) {
    this.xpos = xpos;
    this.ypos = ypos;
    this.r = r;
    this.g = g;
    this.b = b;
}

reset();

window.onresize = reset;

function reset() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = 'rgb(' + bgr + ', ' + bgg + ', ' + bgb +')';
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();

    stars = [];
    for (var i = 0; i < starCount; i++) {
        stars.push(new Star(Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255)));
    }
    drawStars();
}

var canvas=document.getElementById('canvas');
var ctx=canvas.getContext('2d');

function drawStar(x, y, h){

    // top left
    ctx.moveTo(x - h, y);
    // top right
    ctx.lineTo(x + h, y);
    // bottom left
    ctx.lineTo(x - h, y + h);
    // top tip
    ctx.lineTo(x, y - h);
    // bottom right
    ctx.lineTo(x + h, y + h);
    // top left
    ctx.lineTo(x - h, y);

	ctx.closePath();
	ctx.lineWidth=5;
	ctx.strokeStyle='black';
	ctx.stroke();
}

reset();

window.onresize = reset;

function reset() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();

    for (var i = 0; i < canvas.width; i += 200) {
    	for (var j = 0; j < canvas.height; j += 200) {
    		drawStar(i, j, 30);
    	}
    }
}

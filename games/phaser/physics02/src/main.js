var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#1099bb',
    parent: 'phaser-example',
    physics: {
        default: 'matter',
        matter: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create
    }
};

var game = new Phaser.Game(config);

function preload () {
    this.load.image('star', 'assets/star.png');
}

function create () {
    this.matter.world.setBounds();
    var star = this.matter.world.fromPath('50 0 63 38 100 38 69 59 82 100 50 75 18 100 31 59 0 38 37 38');

    var polygons = [];

    for (var i = 0; i < 15; i++) {
        polygons.push(this.matter.add.image(i * 10, 50, 'star'));
    }

    for (var i = 0; i < 15; i++) {
        polygons[i].setBody({type: 'fromVerts', verts: star});
        polygons[i].setVelocity(0, 3);
        polygons[i].setBounce(1);
    }

    this.matter.add.mouseSpring();

    window.onresize = function () {
        this.renderer.resize(window.innerWidth, window.innerHeight, 1.0);
    }

}

let config = {
    type: Phaser.AUTO,
    parent: 'spinning',
    width: window.innerWidth,
    height: window.innerHeight,    
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);
let background;
let monkey;
let direction = 1;

function preload() {
    this.load.image('jungle', 'assets/jungle.png');
    this.load.image('monkey', 'assets/zombie_monkey.png');
    this.load.audio('drums', 'assets/drums.ogg');
    this.load.audio('noise', 'assets/monkey_noise.ogg');    
}

function create() {
    background = this.add.image(0, 0, 'jungle').setOrigin(0).setDisplaySize(game.config.width, game.config.height);
    monkey = this.add.image(game.config.width / 2, game.config.height - game.config.height / 3, 'monkey');

    path = new Phaser.Curves.Path();

    path.add(new Phaser.Curves.Ellipse(400, 300, 100));

    var tween = this.tweens.add({
        targets: monkey,
        y: `-= ${game.config.height / 2}`,
        duration: 200,
        ease: 'Power1',
        yoyo: true,
        repeat: -1
    });

    let noise = this.sound.add('noise', { loop: true });
    let drums = this.sound.add('drums', { loop: true });
    noise.play();
    drums.play();
}

function update() {
    if (monkey.rotation > 1 || monkey.rotation < -1) direction *= -1;
    monkey.rotation += (Phaser.Math.RND.between(3, 10) * 0.01) * direction;
}

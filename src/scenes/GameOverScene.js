import Phaser from 'phaser'

export default class GameOverScene extends Phaser.Scene
{
	constructor(){
		super('game-over-scene');
	}
	
	init(data){
		this.replayButton = undefined;

		// score
		this.score = data.score;
	}

	preload(){
        this.load.image(`bg`, `images/bg_layer1.png`);
		this.load.image(`gameover`, `images/gameover.png`);
		this.load.image(`replay`, `images/replay.png`);
    }

    create(){
        this.add.image(200, 320, `bg`);
		this.add.image(200, 200, `gameover`);
		this.replayButton = this.add.image(200, 450, `replay`).setInteractive();

		this.replayButton.once(`pointerup`, () => {
			this.scene.start(`corona-buster-scene`)
		}, this);

		// score text
		this.add.text(30, 300, `SCORE:`, {
			fontSize: `50px`,
			// @ts-ignore
			fill: `#000`
		});

		this.add.text(300, 300, this.score, {
			fontSize: `50px`,
			// @ts-ignore
			fill: `#000`
		});
    }

	update(){
		
	}
}

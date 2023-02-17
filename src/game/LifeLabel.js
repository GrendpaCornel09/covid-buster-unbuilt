import Phaser from 'phaser'

const formatLife = (gameLife => `Life: ${gameLife}`);

export default class scoreLabel extends Phaser.GameObjects.Text
{
	constructor(scene, x, y, playerLife, style){
		super(scene, x, y, formatLife(playerLife), style);
		this.life = playerLife;
	}

	setLife(playerLife){
		this.life = playerLife;
		this.setText(formatLife(playerLife));
	}

	getLife(){
		return this.life;
	}

	add(points){
		this.setLife(this.life + points);
	}

	substract(value){
		this.setLife(this.life - value);
	}
}
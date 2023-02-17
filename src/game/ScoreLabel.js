import Phaser from 'phaser'

const formatScore = (gameScore => `Score: ${gameScore}`);

export default class scoreLabel extends Phaser.GameObjects.Text
{
	constructor(scene, x, y, scor, style){
		super(scene, x, y, formatScore(scor), style);
		this.score = scor;
	}

	setScore(scor){
		this.score = scor;
		this.setText(formatScore(this.score));
	}

	getScore(){
		return this.score;
	}

	add(points){
		this.setScore(this.score + points);
	}
}
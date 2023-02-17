import Phaser, { Sound } from 'phaser'
import FallingObject from '../game/FallingObject';
import Laser from '../game/Laser';
import scoreLabel from '../game/ScoreLabel';
import lifeLabel from '../game/LifeLabel';

export default class CoronaBusterScene extends Phaser.Scene
{
	constructor(){
		super('corona-buster-scene');
	}

	init(){
		// cloud
		this.clouds = undefined;

		// controls button
		this.nav_left = false;
		this.nav_right = false;
		this.shoot = false;

		// player
		this.player = undefined;
		this.speed = 100;

		// arrow keys movement
		this.cursors = undefined;

		// enemy
		this.enemies = undefined;
		this.enemySpeed = 60;

		// laser
		this.lasers = undefined;
		this.lastFired = 0;

		// score label
		this.scoreLabel = undefined;

		// life label
		this.lifeLabel = undefined;

		// hand sanitizer
		this.handSanitizer = undefined;

		// backsound
		this.backsound = undefined;
	}


	preload(){
        this.load.image(`bg`, `images/bg_layer1.png`);
		this.load.image(`cloud`, `images/cloud.png`);

		// buttons
		this.load.image(`leftBtn`, `images/left-btn.png`);
		this.load.image(`rightBtn`, `images/right-btn.png`);
		this.load.image(`shootBtn`, `images/shoot-btn.png`);

		// enemy
		this.load.image(`enemy`, `images/enemy.png`);

		// player
		this.load.spritesheet(`player`, `images/ship.png`, {
			frameWidth: 66,
			frameHeight: 66
		});

		// laser
		this.load.spritesheet(`laser`, `images/laser-bolts.png`, {
			frameWidth: 16,
			frameHeight: 32,
			startFrame: 16, 
			endFrame: 32
		});

		// hand sanitizer
		this.load.image(`handSanitizer`, `images/handsanitizer.png`);

		// sounds
		this.load.audio(`laserSound`, `sfx/sfx_laser.ogg`);
		this.load.audio(`destroySound`, `sfx/destroy.mp3`);
		this.load.audio(`handSanitizerSound`, `sfx/handsanitizer.mp3`);
		this.load.audio(`backsound`, `music/heheBoi.ogg`);
		this.load.audio(`gameOverSound`, `sfx/fail.mp3`);
		this.load.audio(`hit`, `sfx/Hit.mp3`);
    }

    create(){
        // background
		const frameWidth = this.scale.width * 0.5;
		const frameHeight = this.scale.height * 0.5;
		this.add.image(frameWidth, frameHeight, `bg`);

		// cloud
		this.clouds = this.physics.add.group({
			key: `cloud`,
			repeat: 20
		});
		Phaser.Actions.RandomRectangle(this.clouds.getChildren(), this.physics.world.bounds);

		// calling createButton()
		this.createButton();

		// player movement
		this.player = this.createPlayer();

		// wasd movement
		this.cursors = this.input.keyboard.addKeys({
			up: Phaser.Input.Keyboard.KeyCodes.W,
			down: Phaser.Input.Keyboard.KeyCodes.S,
			left: Phaser.Input.Keyboard.KeyCodes.A,
			right: Phaser.Input.Keyboard.KeyCodes.D,
			space: Phaser.Input.Keyboard.KeyCodes.SPACE
		});

		// enemy
		this.enemies = this.physics.add.group({
			classType: FallingObject,
			maxSize: 10,
			runChildUpdate: true
		});

		this.time.addEvent({
			delay: Phaser.Math.Between(1000, 5000),
			callback: this.spawnEnemy,
			callbackScope: this,
			loop: true
		});

		// laser
		this.lasers = this.physics.add.group({
			classType: Laser,
			maxSize: 15,
			runChildUpdate: true
		});

		// laser-enemy overlaping
		this.physics.add.overlap(this.lasers, this.enemies, this.hitEnemy, null, this);

		// score label
		this.scoreLabel = this.createScoreLabel(16, 16, 0);

		// life label
		this.lifeLabel = this.createLifeLabel(16, 45, 3);

		// decrease life
		this.physics.add.overlap(this.player, this.enemies, this.decreaseLife, null, this);

		
		// hand sanitizer
		this.handSanitizer = this.physics.add.group({
			classType: FallingObject,
			runChildUpdate: true
		});
		
		this.time.addEvent({
			delay: 10000,
			callback: this.spawnHandSanitizer,
			callbackScope: this,
			loop: true
		});

		// increase life
		this.physics.add.overlap(this.player, this.handSanitizer, this.increaseLife, null, this);
    }
	
	update(time){
		this.clouds.children.iterate((child) => {
			child.setVelocityY(20);
			if(child.y > this.scale.height){
				child.x = Phaser.Math.Between(10, 400);
				child.y = child.displayHeight * -1
			}
		});

		// player movement
		this.movePlayer(this.player, time);
	}

	createButton(){
		this.input.addPointer(3);

		let shoot = this.add.image(320, 550, `shootBtn`).setInteractive().setDepth(0.5).setAlpha(0.8);
		let navLeft = this.add.image(50, 550, `leftBtn`).setInteractive().setDepth(0.5).setAlpha(0.8);
		let navRight = this.add.image(navLeft.x + navLeft.displayWidth + 20, 550, `rightBtn`).setInteractive().setDepth(0.5).setAlpha(0.8);

		// button interaction
		navLeft.on(`pointerdown`, () => {
			this.nav_left = true;
		}, this);

		navLeft.on(`pointerout`, () => {
			this.nav_left = false;
		}, this);

		navRight.on(`pointerdown`, () => {
			this.nav_right = true;
		}, this);

		navRight.on(`pointerout`, () => {
			this.nav_right = false;
		}, this);

		shoot.on(`pointerdown`, () => {
			this.shoot = true;
		}, this);

		shoot.on(`pointerout`, () => {
			this.shoot = false;
		}, this);
	}

	movePlayer(player, time){
		// @ts-ignore
		if(this.cursors.left.isDown || this.nav_left){
			this.player.setVelocityX(this.speed * -1);
			this.player.anims.play(`left`, true);
			this.player.setFlipX(false);
		}
		// @ts-ignore
		else if(this.cursors.right.isDown || this.nav_right){
			this.player.setVelocityX(this.speed);
			this.player.anims.play(`right`, true);
			this.player.setFlipX(true);
		}

		// @ts-ignore
		else if(this.cursors.up.isDown){
			this.player.setVelocityY(this.speed * -1);
			this.player.anims.play(`turn`, true);
		}

		// @ts-ignore
		else if(this.cursors.down.isDown){
			this.player.setVelocityY(this.speed);
			this.player.anims.play(`turn`, true);
		}
		
		else{
			this.player.setVelocityX(0);
			this.player.setVelocityY(0);
			this.player.anims.play(`turn`);
		}

		// laser
		// @ts-ignore
		if((this.shoot || this.cursors.space.isDown) && time > this.lastFired){
			const laser = this.lasers.get(0, 0, `laser`);

			if(laser){
				laser.fire(this.player.x, this.player.y);
				this.lastFired = time + 150;

				this.sound.play(`laserSound`);
			}
		}
	}
	
	spawnEnemy(){
		const config = {
			speed: this.enemySpeed,
			rotation: 0.08
		}

		// @ts-ignore
		const enemy = this.enemies.get(0, 0, `enemy`, config);
		const enemyWidth = enemy.displayWidth;
		const positionX = Phaser.Math.Between(enemyWidth, this.scale.width - enemyWidth);

		if(enemy){
			enemy.spawn(positionX);
		}
	}

	spawnHandSanitizer(){
		const config = {
			speed: 60,
			rotation: 0.05
		}

		// @ts-ignore
		const handSanitizer = this.handSanitizer.get(0, 0, `handSanitizer`, config);
		const handSanitizerWidth = handSanitizer.displayWidth;
		const positionX = Phaser.Math.Between(handSanitizerWidth, this.scale.width - handSanitizerWidth);

		if(handSanitizer){
			handSanitizer.spawn(positionX);
		}
	}

	createPlayer(){
		const player = this.physics.add.sprite(200, 450, `player`);
		player.setCollideWorldBounds(true);

		this.anims.create({
			key: `turn`,
			frames: [{key: `player`, frame: 0}]
		});

		this.anims.create({
			key: `left`,
			frames: this.anims.generateFrameNumbers(`player`, {
				start: 1, 
				end: 2
			}),
			frameRate: 10
		});

		this.anims.create({
			key: `right`,
			frames: this.anims.generateFrameNumbers(`player`, {
				start: 1,
				end: 2
			}),
			frameRate: 10
		});

		return player;
	}

	hitEnemy(laser, enemy){
		laser.erase();
		enemy.die();

		// add score
		this.scoreLabel.add(10);
		if(this.scoreLabel.getScore() % 100 == 0){
			this.enemySpeed += 30;
		}

		this.sound.play(`destroySound`);
	}

	createScoreLabel(x, y, score){
		const style = {
			fontSize: `32px`,
			fill: `#000`
		}
		const label = new scoreLabel(this, x, y, score, style).setDepth(1);

		this.add.existing(label);
		return(label);
	}

	createLifeLabel(x, y, life){
		const style = {
			fontSize: `32px`,
			fill: `#000`
		}

		const label = new lifeLabel(this, x, y, life, style).setDepth(1);

		this.add.existing(label);
		return label;
	}

	decreaseLife(player, enemy){
		enemy.die();
		this.lifeLabel.substract(1);
		this.sound.play(`hit`);

		if(this.lifeLabel.getLife() == 2){
			player.setTint(0xff0000);
		}

		else if(this.lifeLabel.getLife() == 1){
			player.setTint(0xff0000).setAlpha(0.2);
		}

		else if(this.lifeLabel.getLife() == 0){
			this.scene.start(`game-over-scene`, {
				score: this.scoreLabel.getScore()
			});
			this.sound.stopAll();
			this.sound.play(`gameOverSound`);
		}
	}

	increaseLife(player, handSanitizer){
		handSanitizer.die();
		this.lifeLabel.add(1);

		if(this.lifeLabel.getLife() >= 3){
			player.clearTint().setAlpha(2);
		}

		if(this.lifeLabel.getLife() == 2){
			player.setTint(0xff0000);
		}

		this.sound.play(`handSanitizerSound`);
	}
}
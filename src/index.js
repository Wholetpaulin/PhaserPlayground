import Phaser from 'phaser';
import blue from './assets/paddle_blue.png';
import red from './assets/paddle_red.png';
import background from './assets/background.png';
import ball_img from './assets/ball.png';

// There's a cleaner way than to use globals like this... What is it?
let cursor;
let player;
let pc;
let velocityX = Phaser.Math.Between(-100, 100);
let velocityY = 100;
let scorePlayer = 0;
let scorePc = 0;
let scoreTextPlayer;
let scoreTextPc;
let ball;

const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 400,
  physics: {
    default: 'arcade'
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image('background', background);
  this.load.image('blue', blue);
  this.load.image('red', red);
  this.load.image('ball_img', ball_img);
}

function create() {
  cursor = this.input.keyboard.createCursorKeys(); //keyboard Access
  // There's a better way than 'installing' W and S keys
  this.keyW=this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  this.keyS=this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

  this.add.image(400, 200, 'background');

  scoreTextPc = this.add.text(16, 16, 'score: 0', { fontSize: '16px', fill: '#F00' });
  scoreTextPlayer = this.add.text(700, 16, 'score: 0', { fontSize: '16px', fill: '#00F' });

  ball = this.physics.add.sprite(400, 50, 'ball_img');
  ball.setCollideWorldBounds(true);
  ball.setBounce(1);

  // Give the ball horizontal and vertical movement.
  ball.setVelocityY(velocityY);
  ball.setVelocityX(velocityX);

  player = this.physics.add.sprite(780, 200, 'blue');
  player.setCollideWorldBounds(true);
  player.name = 'player';

  pc = this.physics.add.sprite(20, 200, 'red');
  pc.setCollideWorldBounds(true);
  pc.name = 'pc';

  this.physics.add.collider(ball, player, hitPaddle, null, this);
  this.physics.add.collider(ball, pc, hitPaddle, null, this);
}

function update() {
  if(cursor.up.isDown)// move up if the up key is pressed
  {
    player.setVelocityY(-250);
  }
  else if(cursor.down.isDown)// move down if the down key is pressed
  {
    player.setVelocityY(250);
  }
  else//stop if no key is pressed.
  {
    player.setVelocityY(0);
  }
  // PC input
  if(this.keyW.isDown)
  {
    pc.setVelocityY(-250);
  }
  else if(this.keyS.isDown)
  {
    pc.setVelocityY(250);
  }
  else
  {
    pc.setVelocityY(0);
  }
  // --------------- Score condition ----------------------
  if(ball.x==796)
  {
    scorePc += 1;
    scoreTextPc.setText('Score: ' + scorePc);
    reset();
  }

  if(ball.x==4)
  {
    scorePlayer += 1;
    scoreTextPlayer.setText('Score: ' + scorePlayer);
    reset(); 
  }
}

function hitPaddle(ball,hitter)
{  
  if(velocityY<0)
  {
    velocityY=velocityY*-1
    ball.setVelocityY(velocityY);
  }
  if(hitter.name == 'player')
  {
    velocityX=velocityX+50;
    velocityX=velocityX*-1;
    ball.setVelocityX(velocityX);
    hitter.setVelocityX(-1);
  } else {
    velocityX=velocityX-50;
    velocityX=velocityX*-1;
    ball.setVelocityX(velocityX);
    hitter.setVelocityX(1);
  }
}

function reset()
{
  velocityX=Phaser.Math.Between(-100, 100);
  velocityY=100;
  ball.x=400;
  ball.y=200;
  player.x=780;
  player.y=200;
  pc.x=20;
  pc.y=200;
  ball.setVelocityX(velocityX);
  ball.setVelocityY(velocityY);
}
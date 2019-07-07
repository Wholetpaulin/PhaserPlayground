import Phaser from 'phaser';
import blue from './assets/paddle_blue.png';
import red from './assets/paddle_red.png';
import background from './assets/background.png';
import multiButton from './assets/multiButton.png';
import singleButton from './assets/singleButton.png';
import ball_img from './assets/ball.png';
import speaker_img from './assets/speaker.png';
import mute_img from './assets/mute.png';
import boop_sound from './assets/boop.mp3';
import crack_sound from './assets/crack.mp3';


// There's a cleaner way than to use globals like this... What is it?
let cursor;
let player;
let pc;
let plusOrMinus = Math.random() < 0.5 ? -1 : 1;
let velocityX = plusOrMinus*Phaser.Math.Between(75, 150);
let velocityY = 100;
let scorePlayer = 0;
let scorePc = 0;
let scoreTextPlayer;
let scoreTextPc;
let announcementText;
let ball;
let boop;
let crack;
let singlePlayerButton;
let splitScreenButton;
let speaker;
let mute;
let splitScreenModeEnabled = true;


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
  this.load.image('multiButton', multiButton);
  this.load.image('singleButton', singleButton);
  this.load.image('blue', blue);
  this.load.image('red', red);
  this.load.image('ball_img', ball_img);
  this.load.image('speaker_img', speaker_img);
  this.load.image('mute_img', mute_img);
  this.load.audio('boop', boop_sound);
  this.load.audio('crack', crack_sound);
}

function create() {
  cursor = this.input.keyboard.createCursorKeys(); //keyboard Access
  // There's a better way than 'installing' W and S keys
  this.keyW=this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  this.keyS=this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

  this.add.image(400, 200, 'background');
  
  scoreTextPc = this.add.text(16, 16, 'score: 0', { fontSize: '16px', fill: '#F00' });
  scoreTextPlayer = this.add.text(700, 16, 'score: 0', { fontSize: '16px', fill: '#00F' });
  announcementText = this.add.text(400, 22, 'Use the arrow keys and WS to move.', { fontSize: '24px', fill: '#000', align: "center"});
  announcementText.setOrigin(0.5);
  announcementText.setVisible(false);

  ball = this.physics.add.sprite(400, 50, 'ball_img');
  ball.setCollideWorldBounds(true);
  ball.setBounce(1);

  player = this.physics.add.sprite(780, 200, 'blue');
  player.setCollideWorldBounds(true);
  player.name = 'player';

  pc = this.physics.add.sprite(20, 200, 'red');
  pc.setCollideWorldBounds(true);
  pc.name = 'pc';

  this.physics.add.collider(ball, player, hitPaddle, null, this);
  this.physics.add.collider(ball, pc, hitPaddle, null, this);

  boop = this.sound.add("boop");
  crack = this.sound.add("crack");
  this.sound.setVolume(0.4);
  // Throws up a menu here for either single player or splitscreen
  speaker = this.add.sprite(750, 350, 'speaker_img').setInteractive()
    .on('pointerover', function () {
      this.setTint(0xD3D3D3);
    })
    .on('pointerout', function () {
      this.clearTint();
    })
    .on('pointerdown', function () {
      makeMute(true);
    });
  mute = this.add.sprite(750, 350, 'mute_img').setInteractive()
    .on('pointerover', function () {
      this.setTint(0xD3D3D3);
    })
    .on('pointerout', function () {
      this.clearTint();
    })
    .on('pointerdown', function () {
      makeMute(false);
    });
  mute.setVisible(false);
  splitScreenButton = this.add.sprite(400, 250, 'multiButton').setInteractive()
    .on('pointerover', function () {
      this.setTint(0xD3D3D3);
    })
    .on('pointerout', function () {
      this.clearTint();
    })
    .on('pointerdown', function () {
      splitScreenModeEnabled = true;
      this.setTint(0xA9A9A9);
      announcementText.setText('Use the arrow keys and WS to move.');
      announcementText.setVisible(true);
      startGame();
    });
  singlePlayerButton = this.add.sprite(400, 150, 'singleButton').setInteractive()
    .on('pointerover', function () {
      this.setTint(0xD3D3D3);
    })
    .on('pointerout', function () {
      this.clearTint();
    })
    .on('pointerdown', function () {
      splitScreenModeEnabled = false; // disable WS controls
      this.setTint(0xA9A9A9);
      startGame()
    });
}

function startGame() {
  scorePlayer = 0;
  scoreTextPlayer.setText('Score: ' + scorePlayer);
  scorePc = 0;
  scoreTextPc.setText('Score: ' + scorePc);
  singlePlayerButton.visible = false;
  splitScreenButton.visible = false;
  mute.visible = false;
  speaker.visible = false;

  // Give the ball horizontal and vertical movement.
  ball.setVelocityY(velocityY);
  ball.setVelocityX(velocityX);
  // Wait 5 seconds then remove announcement message
  setTimeout(()=> {
    announcementText.setVisible(false);
  }, 5000);
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
  else // stop if no key is pressed.
  {
    player.setVelocityY(0);
  }
  if(splitScreenModeEnabled) {
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
  } else {
    // PC auto
    if(pc.x >= ball.x - 220) { // wait until the ball gets close...
      if (Phaser.Math.Between(1, 5) === 1) { // make it continue towards direction of ball every ~6 frames
        if(pc.y < ball.y) {
          pc.setVelocityY(250);
        } else {
          pc.setVelocityY(-250);
        }
      }
    }
  }
  // --------------- Score condition ----------------------
  if(ball.x==796)
  {
    boop.play();
    scorePc += 1;
    scoreTextPc.setText('Score: ' + scorePc);
    if (scorePc >= 5) {
      announcementText.setText('Red has won! GG'); // show a blinking MATCH POINT message
      announcementText.setVisible(true);
      endGame();
    } else {
      reset();
    }
  }

  if(ball.x==4)
  {
    boop.play();
    scorePlayer += 1;
    scoreTextPlayer.setText('Score: ' + scorePlayer);
    if (scorePlayer >= 5) {
      announcementText.setText('Blue has won! GG'); // show a blinking MATCH POINT message
      announcementText.setVisible(true);
      endGame();
    } else {
      reset(); 
    }
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
    crack.setDetune(velocityX);
    crack.play(); // sound effect!
    velocityX=velocityX+50;
    velocityX=velocityX*-1;
    ball.setVelocityX(velocityX);
    hitter.setVelocityX(-1);
  } else {
    crack.setDetune(-velocityX);
    crack.play(); // sound effect!
    velocityX=velocityX-50;
    velocityX=velocityX*-1;
    ball.setVelocityX(velocityX);
    hitter.setVelocityX(1);
  }
}

function reset()
{
  plusOrMinus = Math.random() < 0.5 ? -1 : 1;
  velocityX=plusOrMinus*Phaser.Math.Between(60, 120); // This is bad.  Make each direction have a min of like 80
  velocityY=Phaser.Math.Between(80, 120);
  ball.x=400;
  ball.y=200;
  player.x=780;
  player.y=200;
  pc.x=20;
  pc.y=200;
  ball.setVelocityX(velocityX);
  ball.setVelocityY(velocityY);
}

function endGame()
{
  // Wait 5 seconds then remove announcement message
  setTimeout(()=> {
    announcementText.setVisible(false);
  }, 5000);
  ball.x=400;
  ball.y=200;
  player.x=780;
  player.y=200;
  pc.x=20;
  pc.y=200;
  // TODO: Show a blinking message on who won for like 3-4 seconds then go back to menu.
  singlePlayerButton.visible = true; // hopefully this is not clickable
  splitScreenButton.visible = true; // hopefully this is not clickable
  ball.setVelocityX(0);
  ball.setVelocityY(0);
}

function makeMute(muted) {
  if(muted) {
    mute.setVisible(true);
    speaker.setVisible(false);
  } else {
    mute.setVisible(false);
    speaker.setVisible(true);
  }
  game.sound.setMute(muted);
}

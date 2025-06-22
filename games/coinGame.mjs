// TODO

// 1. make it harder 
// 2. dlete all code and quitr coding and dleete gitbin





/*******************************************************/
// P5.play: t22_keyboard
// Move sprite via keyboard
// Written by Scott
/*******************************************************/

// setup()
/*******************************************************/

const GameWidth = 800;
const GameHeight = 800;
const NumberOfCoins = 1000;
const TextSize = 35;
const GameSeconds = 15;
var Score = 0;
var StartTime;

let cnv;
let Player, Spinner, WallGroup, Wall_Left, Wall_Right, Wall_Top, Wall_Bottom, CoinGroup, RestartButton;

// Firebase functions and variables to get the highscores working
var HighScore;
var uid = null;

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { fb_initialise, fb_write, fb_read } from '../fb_io.mjs';

fb_initialise();

function updateHighScore(_highScore) {
    if (uid != null) {
        var filePath = "users/" + uid + "/coinGameHighScore";
        fb_write(filePath, _highScore);
    }
}
function readHighScore() {
    if (uid != null) {
        var filePath = "users/" + uid + "/coinGameHighScore";
        return fb_read(filePath);
    }
}

const AUTH = getAuth();
onAuthStateChanged(AUTH, (user) => {
    if (user) {
        console.log("User doesn't need to sign in");
        uid = user.uid;
        console.log(uid);
		readHighScore().then((DBHighScore) => {
			console.log("The high score is:");
			HighScore = DBHighScore;
			console.log(HighScore);
		});
    } else {
        console.log("User needs to sign in");
    }
}, (error) => {
    console.log("Authorisation state detection error");
    console.log(error);
});

function setup() {
	console.log("setup: ");
	cnv = new Canvas(GameWidth, GameWidth);
	world.gravity.y = 10;
	StartTime = millis();

	// Sprites
	Player = new Sprite(500, 200, 100, 100, 'd');
	Player.color = "White";
	Player.vel.x = 2;
	Player.bounciness = 0;

	Spinner = new Sprite(500, 800, 100, 500, 'k');
	Spinner.color = "Green";
	Spinner.rotationSpeed = -5;
	Spinner.vel.x = 0;
	Spinner.bounciness = 0;
	Spinner.friction = 200;

	WallGroup = new Group();
	Wall_Left = new Sprite(GameWidth + 10, 0, 20, GameHeight * 2, 'k');
	WallGroup.add(Wall_Left);
	Wall_Right = new Sprite(-10, 0, 20, GameHeight * 2, 'k');
	WallGroup.add(Wall_Right);
	Wall_Top = new Sprite(0, -10, GameWidth * 2, 20, 'k');
	WallGroup.add(Wall_Top);
	Wall_Bottom = new Sprite(0, GameHeight + 10, GameWidth * 2, 20, 'k');
	WallGroup.add(Wall_Bottom);

	WallGroup.bounciness = 1.5;

	// Coin Functionality
	CoinGroup = new Group();

	MakeCoins();
	CoinGroup.collides(Player, CollisionFunction);
	function CollisionFunction(WhichCoin, Player) {
		WhichCoin.remove();
        Score++;
	}

	// Restart button
	RestartButton = createButton("Restart Game");
	RestartButton.position(GameWidth / 2 - 55, GameHeight / 2 + 3 * TextSize);
	RestartButton.mousePressed(RestartGame);
	RestartButton.hide();
}

/*******************************************************/
// draw()
/*******************************************************/
function draw() {	
	// Controls
    Player.moveTowards(mouseX, mouseY, 0.05);

	// Check if they try to restart
	if(kb.presses('r')) {
        CoinGroup.removeAll();
		RestartGame();
	}
	
	textSize(TextSize);
	// Display text and check if game is over
    if((millis() - StartTime) >= GameSeconds * 1000) {
		// If game is over hide sprites
        CoinGroup.removeAll();
        Spinner.visible = false;
        Player.visible = false;
		RestartButton.show();
        textAlign(CENTER, CENTER);
		if(Score >= NumberOfCoins) {
			background('green');
			text("You Won :)", GameWidth / 2, GameHeight / 2 - 20);
		} else {
			background('red');
			text("Game Over :(", GameWidth / 2, GameHeight / 2 - 20);
		}
		text("Your Score: " + Score + "/" + NumberOfCoins, GameWidth / 2, GameHeight / 2 + TextSize);
		// Send highscore to firebase
        if (uid != null) {
            if (Score > HighScore) {
                updateHighScore(Score);
            }
            text("Your high score is " + HighScore, GameWidth / 2, GameHeight / 2 + 2 * TextSize);
        } else {
            text("Sign-in to view your highscores", GameWidth / 2, GameHeight / 2 + 2 * TextSize);
        }
        textAlign(LEFT, CENTER);
    } else {
		background('red');
        fill('white');
        text("Score: " + Score + "/" + NumberOfCoins, 15, TextSize);
        text("Timer: " + (GameSeconds - Math.floor((millis() - StartTime)/1000)), 15, TextSize * 2 + 15);
	}
}

function RestartGame() {
	StartTime = millis();
	RestartButton.hide();
	Score = 0;
	Spinner.visible = true;
	Player.visible = true;
	MakeCoins();
	
	// Get the highscore now because it is async
    if (uid != null) {
        readHighScore().then((DBHighScore) => {
            console.log("The high score is:");
            HighScore = DBHighScore;
            console.log(HighScore);
        });
    }
}
function MakeCoins() {
	for (var i = 0; i < NumberOfCoins; i++) {
		let Coin = new Sprite(Math.random() * GameWidth, Math.random() * GameHeight, 20, "d");
		Coin.vel.x = 3;
		Coin.vel.y = 4;
		Coin.bounciness = 0.5;
		Coin.friction = 0;
		CoinGroup.add(Coin);
	}
}

window.setup = setup;
window.draw = draw;
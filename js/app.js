"use strict";

/** Where the two tracks collide. */
var collisionX = 250;
var collisionY = 230;

/** Number of seconds per beat. */
var beatDuration = 1.0;
/** Length of a track beat in pixels. */
var trackBeatLength = 80;
/** {number} How many pixels the track moves per second. */
var trackSpeed = trackBeatLength / beatDuration;


/**
 * @constructor
 *
 * A character that fights.
 *
 * @param {string} side - 'left' or 'right'.
 * @param {string} characterType - the character type. eg. 'char-boy' or 'char-cat-girl'
 */
var Character = function(side, characterType) {

	/* At the moment only used for sprite selection */
	this.characterType = characterType;

	this.side = side;

	/** The direction that this character's track goes. */
	this.dirSign = side === 'left' ? 1 : -1;

	this.trackOffset = 0;
}

/** Update the character for the end of a beat. */
Character.prototype.beat = function() {
	this.trackOffset -= this.dirSign * trackBeatLength;
}

/**
 * Update the character for a new frame.
 *
 * @param {number} dt - The number of seconds that has passed since the last update.
 */
Character.prototype.update = function(dt) {
	this.trackOffset += this.dirSign * trackSpeed * dt;
}

function drawTick(x, y) {
	ctx.beginPath();
	ctx.moveTo(x, y-10);
	ctx.lineTo(x, y+10);
	ctx.stroke();
}

/**
 * Draw the character and their track on the screen.
 */
Character.prototype.render = function() {

	// Select the relevant sprite and draw the player above the beat bar.
	this.sprite = 'images/' + this.characterType + '.png';
	// TODO select sprite based on player action
	var playerImage = Resources.get(this.sprite);
	if (playerImage) {
		var xOffset = (this.side === 'left' ? -1 : 1) * 100;
		var xPos = collisionX + xOffset - playerImage.width / 2;
		var yPos = collisionY - 20 - playerImage.height;
		ctx.drawImage(playerImage, xPos, yPos);
	}

	var numBeats = 5;
	var s = this.dirSign;

	ctx.lineWidth = 4;
	ctx.strokeStyle = this.side === 'left' ? 'blue' : 'green';

	// Draw track body.
	ctx.beginPath();
	ctx.moveTo(collisionX, collisionY);
	ctx.lineTo(collisionX - s * numBeats * trackBeatLength + s * this.trackOffset, collisionY);
	ctx.stroke();

	// Draw ticks and actions.
	var i;
	for (i = 0; i < numBeats; i++) {
		drawTick(collisionX - s * trackBeatLength * (i+1) + this.trackOffset, collisionY);
		//TODO draw action.
	}
}

/**
 * A person who plays the game, controlling a character.
 *
 * @param {Character} character - The character that the player is controlling.
 */
var Player = function(character) {
	this.character = character;
}

/** 
 * @param {string} key - The name of the key.
 * @param {boolean} down - Is the event keydown or key up?
 */
Player.prototype.handleInput = function(key, ev) {
	if (ev == 'down') {
		switch(key) {
			//TODO
		}
	}
};


// Now instantiate your objects.

var player, opponent, characters;

var initLevel = function() {
	var leftChar = new Character('left', 'char-boy');
	var rightChar = new Character('right', 'char-cat-girl');
	characters = [leftChar, rightChar];

	player = new Player(leftChar);
	opponent = new Player(rightChar);
};


var allowedKeys = {
	37: 'left',
	38: 'up',
	39: 'right',
	40: 'down'
};
var pressedKeys = {};

// This listens for key presses and sends the keys to your
// Player.handleInput() method.
document.addEventListener('keydown', function(e) {
	var k = allowedKeys[e.keyCode];
	if (!k) return;

    player.handleInput(k, pressedKeys[k] ? 'repeat' : 'down');
	pressedKeys[k] = true;
});
document.addEventListener('keyup', function(e) {
	var k = allowedKeys[e.keyCode];
	if (!k) return;

    player.handleInput(k, 'up');
	pressedKeys[k] = false;
});

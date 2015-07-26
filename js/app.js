"use strict";

// Enemies our player must avoid
var Enemy = function(x, y, dx, dy) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';

	this.x = x;
	this.y = y;
	this.dx = dx || 0;
	this.dy = dy || 0;
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
	this.x += this.dx * dt;
	this.y += this.dy * dt;
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(x, y) {

    this.sprite = 'images/char-cat-girl.png';

	this.speed = 10;
	this.x = x;
	this.y = y;
	this.dx = 0;
	this.dy = 0;
}

// Render the player to the screen.
Player.prototype.render = function() {
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.update = function(dt) {
	this.x += this.dx * dt;
	this.y += this.dy * dt;
};

/** 
 * @param {string} key - The name of the key.
 * @param {boolean} down - Is the event keydown or key up?
 */
Player.prototype.handleInput = function(key, ev) {
	var sign = null;
	if (ev === 'down') sign = 1;
	if (ev === 'up') sign = -1;
	if (sign === null) return;

	switch(key) {
		case 'left':
			this.dx -= this.speed * sign;
		break;
		case 'right':
			this.dx += this.speed * sign;
		break;
		case 'up':
			this.dy -= this.speed * sign;
		break;
		case 'down':
			this.dy += this.speed * sign;
		break;
	}
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var allEnemies = [];
var player = null;

var initLevel = function() {
	player = new Player(190, 198);

	var i;
	for (i = 0; i < 4; i++) {
		var sign = (i % 2 == 0) ? 1 : -1;
		allEnemies.push(new Enemy(190 + sign*190, i * 30, -sign*10, 0));
	}
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

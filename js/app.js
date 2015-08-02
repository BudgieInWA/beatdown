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

	/** How far the track has moved since the last beat. */
	this.trackOffset = 0;

	/** 
	 * The list of upcoming stances. The first stance is the one that dictates what different input
	 * does.
	 */
	this.futureStances = [];
}

/** Update the character for the end of a beat. */
Character.prototype.beat = function() {
	this.trackOffset -= this.dirSign * trackBeatLength;

	var oldStance = this.futureStances.shift();
	//DEBUG throw it on the end so we can see it rendered again
	if (oldStance) this.futureStances.push(oldStance);
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
	var s = this.dirSign;

	// Select the relevant sprite and draw the player above the beat bar.
	var sprite = 'images/' + this.characterType + '.png';
	// TODO select sprite based on player action
	var playerImage = Resources.get(sprite);
	if (playerImage) {
		var xOffset = -s * 100;
		var xPos = collisionX + xOffset - playerImage.width / 2;
		var yPos = collisionY - 20 - playerImage.height;
		ctx.drawImage(playerImage, xPos, yPos);
	}

	var numBeats = 5;

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
		var x = collisionX - s * trackBeatLength * (i+1) + this.trackOffset;
		var y = collisionY;

		drawTick(x, y);
		if (i < this.futureStances.length) {
			this.futureStances[i].render(x, y);
		}
	}
}


/**
 * Describes (a bunch about) the state that a Character is in or will probably be in in the future.
 *
 * Determines what actions are possible (and what the resulting next Stances will be).
 *
 * Can render itself on a track in a way that describes what inputs are valid and what they do.
 *
 * @param {Character} character - The character that the Stance describes.
 */
var Stance = function(character) {
	this.character = character;
	this.name = "abstract";
}
Stance.prototype.toString = function() {
	return "Stance " + name;
}

/**
 * Render the stance and the actions that it provides to the track.
 *
 * @param {number} x - The x coord of the place to render.
 * @param {number} y - The y coord of the place to render.
 */
Stance.prototype.render = function(x, y) {
	/*
	// Draw the stance.
    ctx.drawImage(Resources.get('images/track-stance-'+this.name+'.png'), x, y);

	var offset = trackBeatLength / 3;
	// Draw the four options for the four directions.
    ctx.drawImage(Resources.get('images/track-'+this.up.icon+'.png'), x, y - offset);
    ctx.drawImage(Resources.get('images/track-'+this.down.icon+'.png'), x, y + offset);
    ctx.drawImage(Resources.get('images/track-'+this.left.icon+'.png'), x - offset, y);
    ctx.drawImage(Resources.get('images/track-'+this.right.icon+'.png'), x + offset, y);
	*/

	ctx.textAlign = 'center';

	// Draw the stance icon.
    ctx.fillText('stance-'+this.name, x, y);

	var offset = trackBeatLength / 3;
	// Draw the four options for the four directions.
    ctx.fillText(this.up.icon,    x, y - offset);
    ctx.fillText(this.down.icon,  x, y + offset);
    ctx.fillText(this.left.icon,  x - offset, y);
    ctx.fillText(this.right.icon, x + offset, y);
}


/**
 * The basic 'stumble' move.
 *
 * This should be immutable.
 */
var stumbleMove = {
	icon: 'stance-stumble',
	result: function() {
		return {
			stances: [new StumbleStance(this.character)],
			action: null,
		}
	},
}

Stance.prototype.up    = stumbleMove;
Stance.prototype.down  = stumbleMove;
Stance.prototype.left  = stumbleMove;
Stance.prototype.right = stumbleMove;


/**
 * The Character is stumbling, cos they dun goofed.
 */
var StumbleStance = function(character) {
	Stance.call(this, character);
	this.name = 'stumble';
}
StumbleStance.prototype = new Stance(null);

StumbleStance.prototype.up = {
	icon: 'stance-high',
	result: function() {
		return {
			stances: [new HighStance(this.character)],
			action: null,
		}
	},
}
StumbleStance.prototype.down = {
	icon: 'stance-low',
	result: function() {
		return {
			stances: [new LowStance(this.character)],
			action: null,
		}
	},
}


/**
 * The Character is threatening high.
 */
var HighStance = function(character) {
	Stance.call(this, character);
	this.name = "high";
}
HighStance.prototype = new Stance(null);

StumbleStance.prototype.down = {
	icon: 'stance-low',
	result: function() {
		return {
			stances: [new LowStance(this.character)],
			action: null,
		}
	},
}

/** The 'attack' move. */
StumbleStance.prototype.right = {
	icon: 'action-attack-high',
	result: function() {
		var a = new Action(this.character);
		a.attack.high.power = 1;
		a.attack.high.range = 1;
		return {
			stances: [new HighStance(this.character)],
			action: a,
		}
	},
}


/**
 * The Character is threatening Low.
 */
var LowStance = function(character) {
	Stance.call(this, character);
	this.name = "low";
}
LowStance.prototype = new Stance(null);

StumbleStance.prototype.up = {
	icon: 'stance-high',
	result: function() {
		return {
			stances: [new HighStance(this.character)],
			action: null,
		}
	},
}

/** The 'attack' move. */
StumbleStance.prototype.right = {
	icon: 'action-attack-low',
	result: function() {
		var a = new Action(this.character);
		a.attack.low.power = 1;
		a.attack.low.range = 1;
		return {
			stances: [new LowStance(this.character)],
			action: a,
		}
	},
}


/**
 * Completely describes what a character does on a beat.
 *
 * @param {Character} character - The character is performing the action.
 */
var Action = function(character) {
	this.character = character;

	this.attacks = {
		high: {
			power: -1,
			range: -1,
		},
		low: {
			power: -1,
			range: -1,
		}
	}
	this.blocks = {
		high: {
			power: -1,
		},
		low: {
			power: -1,
		}
	}

	//this.onBlock = ...
	//this.onAttack = ...
	//this.onNoDamage = ...
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


/**
 * takes an attack action and a block action and determines if 
 */
var resolveAttack = function(attackAction, blockAction, height) {
	var attackChar = attackAction.character;
	var attack     = attackAction.attack[height];
	var blockChar  = blockAction.character;
	var block      = blockAction.block[height];

	//TODO if (attackChar.offset + blockChar.offset <= attack.range)
	if (attack.power >= 0) {
		var diff = attack.power > block.power;
		if (diff > 0) {
			blockChar.takeDamage(diff);
			//attackAction.onAttack(...)
		} else {
			//blockAction.onBlock(...)
		}
	}

	//TODO? maybe choose new stances.
}
/**
 * Takes the actions that two characters make and resolves them.
 */
var resolveActions = function(leftAction, rightAction) {
	['low', 'high'].forEach(function(h) {
		resolveAttack(leftAction, rightAction, h);
		resolveAttack(rightAction, leftAction, h);
	});
};
	


// Now instantiate your objects.

var player, opponent, characters;

var initLevel = function() {
	var leftChar = new Character('left', 'char-boy');
	var rightChar = new Character('right', 'char-cat-girl');
	characters = [leftChar, rightChar];

	player = new Player(leftChar);
	opponent = new Player(rightChar);

	//DEBUG
	leftChar.futureStances = [
		new HighStance(leftChar),
		new LowStance(leftChar),
		new StumbleStance(leftChar),
	];
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

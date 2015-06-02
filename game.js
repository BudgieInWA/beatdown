var _ = require('underscore');

var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');

// 0: Tweakables

var turnTime = 2000;
var postTurnTime = 400;


// A: Data types and automatic behaviours
function Character(name) {
	this.name = name;
	this.hp = 10;
	this.currentAction = new WaitAction(this);
	this.animation = null;
	this.offenseNext = false;
}
Character.prototype.toString = function() {
	return "[Character " + this.name + "]";
}
Character.prototype.dealDamage = function(type, amount) {
	this.hp -= amount;
	if (this.hp < 0) {
		alert("" + this + " just died");
	}
}

/**
 * A human player with a keyboard.
 */
function LocalHuman(character) {
	this.character = character;
	this.character.controller = this;
	this.acceptingInput = false;
}
LocalHuman.prototype.acceptInput = function (bool) {
	this.acceptingInput = bool;
}

/**
 * A simple AI player.
 */
function LocalAISimple(character) {
	this.character = character;
	this.character.controller = this;
}
LocalAISimple.prototype.acceptInput = function (bool) {
	var c = this.character;
	if (bool) {
		// choose an action!
		var r = Math.random();
		if (r < 0.2) {
			c.currentAction = new Attack(c, c.target);
		} else if (r < 0.3) {
			c.currentAction = new WaitAction(c);
		} else {
			if (c.target.currentAction.isAttack) {
				c.currentAction = new Block(c);
			} else {
				c.currentAction = new Attack(c, c.target);
			}
		}
	}
}

/// Something that a character can do on his turn.
function Action(name, owner) {
	this.name = name;
	if (name == null) return; // for inheriting

	this.owner = owner;
}
Action.prototype.resolveOffense = function() {
	console.log("Generic Action (offense)", this);
	this.owner.currentAction = new WaitAction(this); // default, we're done with this action
}
Action.prototype.resolveDefense = function() {
	console.log("Generic Action (defense)", this);
}
Action.prototype.toString = function() {
	return "[Action " + this.name + "]";
}

/// For doing nothing.
function WaitAction(owner) {
	Action.call(this, 'stand', owner);
}
WaitAction.prototype = new Action(null);

/**
 * Attacking some target.
 *
 * Responsible for examining the target and deciding if damage should be dealt.
 */
function Attack(owner, target) {
	Action.call(this, 'attack', owner);
	this.isAttack = true;
	this.target = target;
	this.power = 1;
}
Attack.prototype = new Action(null);
Attack.prototype.resolveOffense = function() {
	console.log("Attack (offense)", this);

	var blocked = false;
	if (this.target.currentAction.isBlock) {
		var block = this.target.currentAction;
		blocked = true;
	}

	if (!blocked) {
		this.target.dealDamage('physical', this.power);
		this.target.animation = 'damage';
	}

	this.owner.animation = 'swing';

	this.owner.currentAction = new WaitAction(this); // done with this action
}

/**
 * Defending against some attack.
 *
 * Passive, examined by attacks.
 */
function Block(owner) {
	Action.call(this, 'block', owner);
	this.isBlock = true;
}
Block.prototype = new Action(null);



// B: Behaviours

var players, currentPlayer;

/// Carry out the next player turn.
function turn() {
	players[(currentPlayer+1) % 2].controller.acceptInput(false);

	var action = players[currentPlayer].currentAction;
	if (action) {
		action.resolveOffense();
		if (action.target && action.target.currentAction) {
			action.target.currentAction.resolveDefense();
		}
	}

	players[currentPlayer].offenseNext = false;
	setTimeout(postTurn, postTurnTime);
}

function postTurn() {
	_.each(players, function(c) {
		c.animation = null;
	});

	players[currentPlayer].controller.acceptInput(true);

	++currentPlayer;
	currentPlayer %= players.length;
	players[currentPlayer].offenseNext = true;

	redraw();
}

/// Players wants to attack.
function playerAttack() {
	if (!human.acceptingInput) return;

	human.character.currentAction = new Attack(human.character, human.character.target);
}

/// Players wants to block.
function playerBlock() {
	if (!human.acceptingInput) return;

	human.character.currentAction = new Block(human.character);
}


// C: Set up keys
var keyBindings = {
	'32': turn, //space
	'38': playerAttack, // up
	'40': playerBlock, // down
	'192': function() {}, // tilde for redrawing
}

document.body.onkeydown = function(ev) {
	if (ev.keyCode in keyBindings) {
		keyBindings[ev.keyCode]();
		redraw();
	}
}

// D: Initialise the game state and game loop
var p1 = new Character("Alice");
var p2 = new Character("Bob");
p1.dir = 'right';
p2.dir = 'left';
p1.target = p2;
p2.target = p1;
players = [p1, p2];
var human = new LocalHuman(p1);
var computer = new LocalAISimple(p2);

currentPlayer = 1;
p2.offenseNext = true;
human.acceptInput(true);



// 1: Create a function that declares what the DOM should look like
function renderAll()  {
	return h('div', {}, [
		h('div', {}, "Offensive Player: " + players[currentPlayer]),
		h('div', {}, _.map(players, renderCharacter)),
	]);
}

function renderCharacter(character) {
	var stance = character.animation ||
		character.currentAction.name || 
		'stand';

	return h('div.character.' + (character.offenseNext ? 'off' : 'def'),
			{style: {'text-align': character.dir}}, 
			[
		h('img', {src: 'sprites/mouse-' + character.dir + '-' + stance + '.png'}),
		h('br'),
		stance,
		renderDebug(character),
	]) ;
}

function renderDebug(e) {
	return h('div.debug', {}, _.map(e, function(v, k) {
		return k + ": " + v;
	}).join("\n"));
}


// 2: Initialise the document

var tree = renderAll();          // We need an initial tree
var rootNode = createElement(tree);     // Create an initial root DOM node ...
document.body.appendChild(rootNode);    // ... and it should be in the document

// 3: Wire up the update logic
function redraw() {
	var newTree = renderAll();
	var patches = diff(tree, newTree);
	rootNode = patch(rootNode, patches);
	tree = newTree;
}

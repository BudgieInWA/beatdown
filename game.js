var _ = require('underscore');

var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');

// A: Data types and automatic behaviours
function Character(name) {
	this.name = name;
	this.hp = 10;
	this.stance = 'horizontal';
	this.currentAction = null;
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

/// Something that a character can do on his turn.
function Action(name, owner) {
	this.name = name;
	if (name == null) return; // for inheriting

	this.owner = owner;
}
Action.prototype.resolveOffense = function() {
	console.log("Generic Action (offense)", this);
	this.owner.currentAction = null; // default, we're done with this action
}
Action.prototype.resolveDefense = function() {
	console.log("Generic Action (defense)", this);
}
Action.prototype.toString = function() {
	return "[Action " + this.name + "]";
}

/**
 * Attacking some target.
 *
 * Responsible for examining the target and deciding if damage should be dealt.
 */
function Attack(owner, target) {
	Action.call(this, 'jab', owner);
	this.isAttack = true;
	this.target = target;
	this.power = 1;
}
Attack.prototype = new Action(null);
Attack.prototype.resolveOffense = function() {
	console.log("Attack (offense)", this);

	var blocked = false;
	if (this.target.currentAction && this.target.currentAction.isBlock) {
		var block = this.target.currentAction;
		blocked = true;
	}

	if (!blocked) {
		this.target.dealDamage('physical', this.power);
	}

	this.owner.currentAction = null; // done with this action
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

/// Carry out the next players turn.
function turn() {
	var action = players[currentPlayer].currentAction;
	if (action) {
		action.resolveOffense();
		if (action.target && action.target.currentAction) {
			action.target.currentAction.resolveDefense();
		}
	}

	++currentPlayer;
	currentPlayer %= players.length;
}

/// Players wants to attack.
function playerAttack() {
	var player = players[(currentPlayer+1) % players.length];
	var target = players[currentPlayer];

	player.currentAction = new Attack(player, target);
}

/// Players wants to block.
function playerBlock() {
	var player = players[(currentPlayer+1) % players.length];

	player.currentAction = new Block(player);
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
players = [p1, p2];
currentPlayer = 0;


// 1: Create a function that declares what the DOM should look like
function renderAll()  {
	return h('div', {}, [
		h('div', {}, "Offensive Player: " + players[currentPlayer]),
		h('div', {}, _.map(players, renderCharacter)),
	]);
}

function renderCharacter(character) {
	return renderDebug(character);
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

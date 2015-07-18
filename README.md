Beatdown
========

[![Floobits Status](https://floobits.com/BudgieInWA/beatdown.svg)](https://floobits.com/BudgieInWA/beatdown/redirect)

A gameplay experiment blending the mechanics of a rhythm game with that of a fighting game.

Set up
------

node and npm are required to build.

From the project directory:

```sh
npm install
npm run build
```

Running
-------

Simply view game.html in a browser.

Hacking
-------

Run `npm run watch` to automatically rebuild when you modify any js source files.

Submit pull requests to [github.com/BudgieInWA/beatdown](https://github.com/BudgieInWA/beatdown).


Gameplay
--------

The choices that the player makes should be well informed with relatively certain outcomes. That is
there should be little to no randomness in the result of choosing a certain action. The system
should be one that can almost be solved, as if it were a simple card game. The difficulty
should come from the limited time the player has to figure out what the next action should be.

Play should generally be about deciding on a decent/good move to make on each beat. All input will
happen in time with the beat, so the player will have no time, or some whole number of beats to
react to something. 

Most moves should be - at least partially - telegraphed (that means at least one beat of reaction
time). This is not about guessing the correct move, nor about reacting very quickly. It is about
choosing the best move from a set in a limited amount of time. To this end, the player should not
have a "go to" move that they can rely on to keep them safe. Staying safe should require keeping
mentally on top of all of the things that the opponent throws at the player. Thinking time should be
a valuable resource.

### Ideas / Planned 

I am currently envisioning two scrolling tracks (think classic rhythm games) that collide in the
centre of the screen. This provides a lot of flexibility for varied methods of interaction between
the characters with very little implementation effort, as well as clearly showing the mechanics. As
players chose their moves, they are visually marked on their track.

The rhythm can be composed of alternating *on beats* and *off beats*. An on beat is when a player
attacks and an off beat is when a player blocks or chooses some stance or prepares some attack.
Players 1's on beat is Player 2's off beat. That is, the fight is a back and forth, with players
taking turns making their primary attacks. 

Players could have a few resources to manage in order to vary the options available to them over the
course of a fight. This might be important to ensure that the player doesn't have a "go to" move.
For example, *stamina* could be a short term resource used for certain attacks or blocks. Stamina
would be limited but regenerate every beat that it wasn't used. *Mana* could be a medium term
resource that still regenerates and is used to perform more powerful moves. These moves would be
used to create an imbalance that could be exploited for a nice combo if the opponent doen't think
quick and reply perfectly.

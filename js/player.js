/*jslint plusplus: true */
/*global game, console */

function Player(side) {
    this.side = side;
    this.centipawns = 100;
}

Player.prototype.moves = function () {
    'use strict';
    console.log('moves:');
    console.log(game.board);
};

Player.prototype.think = function () {
    'use strict';
    var moves = this.moves(this.side);
    console.log('thinking');

    game.makeMove();
};

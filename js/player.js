/*jslint plusplus: true */
/*global game, console */

(function () {
    "use strict";

    function Player(side) {
        this.side = side;
        this.centipawns = 100;
    }

    Player.prototype.think = function () {
        console.log('thinking');
        game.makeMove();
    };

}());
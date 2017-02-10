/*jslint plusplus: true */
/*global player, game, dictionary, console*/

function allowDrop(e) {
    'use strict';
    if (player.side !== game.side) { return false; }
    if (player.centipawns < game.centipawns) { return false; }

    // disallow for any but the first 2 ranks
    if (parseInt(e.target.id.substring(6), 10) < 48) { return false; }

    e.preventDefault();
}

function drag(e) {
    'use strict';
    e.dataTransfer.setData('text', e.target.id);
    game.centipawns = dictionary.cp[e.target.id];
}

function drop(e) {
    'use strict';
    e.preventDefault();

    // validate the move
    var className,
        piece,
        square = parseInt(e.target.id.substring(6), 10),
        rank = parseInt(square / game.ranks, 10),
        file = square % game.files;

    if (game.board[rank][file] !== ' ') {
        console.log('bad move');
        return;
    }

    player.centipawns -= dictionary.cp[e.dataTransfer.getData('text')];

    // update the UI
    className = 'square';
    piece = e.dataTransfer.getData('text').substring(4, 5);
    if (e.target.className.indexOf('shade') !== -1) { className += ' shade'; }
    e.target.className = className + ' ' + piece;

    game.makeMove({piece: piece, toPiece: ' ', to: [rank, file]});
    game.prepareUIForNextMove();
}

//game.loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
//game.loadFEN('3bk3/8/p7/rp2n3/rp6/p7/8/4K3 w - -');
game.loadFEN('4k3/8/8/8/8/8/8/4K3 w - -');
//game.loadFEN('8/8/8/8/8/4k3/8/4K3 w - -');
game.drawInterface(dictionary.white);
//game.testAI();
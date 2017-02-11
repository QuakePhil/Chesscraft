/*jslint plusplus: true */
/*global game, dictionary, console*/

function allowDrop(e) {
    'use strict';
    console.log(e.target.id, e.dataTransfer.getData('text'));
    // todo: detect above getData, if drop do below code, if square do regular move (new code)

    if (game.player.side !== game.side) { return false; }
    if (game.player.centipawns < game.centipawns) { return false; }

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

    // console.log(e.target.id, e.dataTransfer.getData('text'));
    // todo: detect above getData, if drop do below code, if square do regular move (new code)

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

    game.player.centipawns -= dictionary.cp[e.dataTransfer.getData('text')];

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
//game.loadFEN('4k3/3ppp2/8/1PpP4/8/8/8/4K3 w - c6');
game.loadFEN('4k3/8/8/8/8/8/8/4K3 w - -');
game.drawInterface(dictionary.white);
//game.testAI();
//player.think();
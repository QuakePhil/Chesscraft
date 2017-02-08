/*jslint plusplus: true */
/*global player, game, dictionary, console*/

function allowDrop(e) {
    'use strict';
    if (player.side !== game.side) { return false; }
    if (player.centipawns < game.centipawns) { return false; }

    e.preventDefault();
}

function drag(e) {
    'use strict';
    var cp = {
        'dropQ': 900,
        'dropR': 500,
        'dropB': 300,
        'dropN': 300,
        'dropP': 100
    };

    e.dataTransfer.setData('text', e.target.id);
    game.centipawns = cp[e.target.id];
}

function drop(e) {
    'use strict';
    e.preventDefault();

    // validate the move
    var className,
        piece,
        cp = {
            'dropQ': 900,
            'dropR': 500,
            'dropB': 300,
            'dropN': 300,
            'dropP': 100
        },
        square = parseInt(e.target.id.substring(6), 10),
        rank = parseInt(square / game.ranks, 10),
        file = square % game.files;

    if (game.board[rank][file] !== ' ') {
        console.log('bad move');
        return;
    }

    // update board
    piece = e.dataTransfer.getData('text').substring(4, 5);
    game.board[rank][file] = piece;

    player.centipawns -= cp[e.dataTransfer.getData('text')];

    // update the UI
    className = 'square';
    if (e.target.className.indexOf('shade') !== -1) { className += ' shade'; }
    e.target.className = className + ' ' + piece;

    game.makeMove();
}

//game.loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
game.loadFEN('4k3/8/8/8/8/8/8/4K3 w - -');
game.drawInterface(dictionary.white);

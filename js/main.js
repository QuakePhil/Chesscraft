/*jslint plusplus: true */
/*global game, dictionary, console*/

function allowDrop(e) {
    'use strict';
    // todo: detect above getData, if drop do below code, if square do regular move (new code)

    if (game.player.side !== game.side) { return false; }
    if (game.playerDropping) {
        if (game.player.centipawns < game.centipawns) { return false; }

        // disallow for any but the first 2 ranks
        if (parseInt(e.target.id.substring(6), 10) < 48) { return false; }
    }

    e.preventDefault();
}

function drag(e) {
    'use strict';
    e.dataTransfer.setData('text', e.target.id);
    game.playerDropping = (e.target.id.substring(0, 4) === 'drop');
    game.centipawns = dictionary.cp[e.target.id];
}

function drop(e) {
    'use strict';
    e.preventDefault();
    
    var i, className, piece, square, rank, file,
        source = e.dataTransfer.getData('text'), sourceSquare, sourceRank, sourceFile;

    if (source.substring(0, 4) === 'drop') {
        // validate the move
        square = parseInt(e.target.id.substring(6), 10);
        rank = parseInt(square / game.ranks, 10);
        file = square % game.files;

        if (game.board[rank][file] !== ' ') {
            console.log('bad move');
            return;
        }

        // update the UI
        className = 'square';
        piece = e.dataTransfer.getData('text').substring(4, 5);
        if (e.target.className.indexOf('shade') !== -1) { className += ' shade'; }
        e.target.className = className + ' ' + piece;

        game.makeMove({dropCost: dictionary.cp[source], piece: piece, toPiece: ' ', to: [rank, file]});
        game.prepareUIForNextMove();

    } else {
        square = parseInt(e.target.id.substring(6), 10);
        rank = parseInt(square / game.ranks, 10);
        file = square % game.files;
        sourceSquare = parseInt(source.substring(6), 10);
        sourceRank = parseInt(sourceSquare / game.ranks, 10);
        sourceFile = sourceSquare % game.files;
        for (i = 0; i < game.playerMoves.length; ++i) {
            if (typeof game.playerMoves[i].from !== 'undefined' && // skip generated drop moves, they're handled above
                    game.playerMoves[i].from[0] === sourceRank &&
                    game.playerMoves[i].from[1] === sourceFile &&
                    game.playerMoves[i].to[0] === rank &&
                    game.playerMoves[i].to[1] === file) {
                game.makeMove(game.playerMoves[i]);
                game.prepareUIForNextMove();
                break;
            }
        }
    }
}

//game.loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
//game.loadFEN('3bk3/8/p7/rp2n3/rp6/p7/8/4K3 w - -');
//game.loadFEN('4k3/3ppp2/8/1PpP4/8/8/8/4K2R w - c6');
game.loadFEN('4k3/8/8/8/8/8/8/4K3 w - -');
game.drawInterface(dictionary.white);
//game.testAI();
//game.player.think();
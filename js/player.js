/*jslint plusplus: true */
/*global dictionary, game, console */

function Player(side) {
    'use strict';
    this.side = side;
    this.centipawns = 100;
    this.noDepth = false;
}

Player.prototype.isCapture = function (move) {
    'use strict';
    if (typeof move === 'undefined') { return false; }
    return (move.toPiece !== ' ' && dictionary.pieces[move.piece] !== dictionary.pieces[move.toPiece]);
};

Player.prototype.algebraic = function (move) {
    'use strict';

    return (move.piece.toLowerCase() === 'p' ? '' : move.piece.toUpperCase())
        + (typeof move.from !== 'undefined' ? (dictionary.files[move.from[1]] + dictionary.ranks[move.from[0]]) : '@')
        + (this.isCapture(move) ? 'x' : '')
        + dictionary.files[move.to[1]] + dictionary.ranks[move.to[0]];
};

Player.prototype.isPiece = function (piece) {
    'use strict';
    var pieceColor = dictionary.pieces[piece];
    if (typeof pieceColor !== undefined) { return true; }
    return false;
};

Player.prototype.isMyPiece = function (piece) {
    'use strict';
    var pieceColor = dictionary.pieces[piece];
    if (pieceColor === this.side) { return true; }
    return false;
};

// add move to moves if legal
Player.prototype.tryMove = function (moves, move) {
    'use strict';
    var i, toPiece, opponentMoves, validMove = true;

    if (move.to[0] < 0 || move.to[0] >= game.ranks || move.to[1] < 0 || move.to[1] >= game.files) { return false; }

    toPiece = game.board[move.to[0]][move.to[1]];
    if (game.board[move.to[0]][move.to[1]] !== ' ') {
        if (dictionary.pieces[move.piece] === dictionary.pieces[toPiece]) { return false; }
    }

    // if this move puts me (or keeps me) in check, skip
    if (this.side === game.side && this.noDepth === false) {
        game.makeMove(move);
        game.opponent(this.side).noDepth = true;
        opponentMoves = game.opponent(this.side).moves();
        for (i = 0; i < opponentMoves.length; ++i) {
            if (opponentMoves[i].toPiece.toLowerCase() === 'k') {
                // moves that place us in check are invalid
                validMove = false;
            }
        }
        game.unmakeMove();
    }

    if (!validMove) { return false; }

    move.toPiece = toPiece;
    moves.push(move);
    return true;
};

Player.prototype.tryRayMove = function (ray, rankDelta, fileDelta, piece, rank, file, moves) {
    'use strict';
    var toRank = rank + rankDelta,
        toFile = file + fileDelta;

    while (this.tryMove(moves, {piece: piece, from: [rank, file], to: [toRank, toFile]})) {
        if (ray === false) { break; }
        if (this.isCapture(moves[moves.length - 1])) { break; }
        toRank = toRank + rankDelta;
        toFile = toFile + fileDelta;
    }
};

Player.prototype.pieceMoves = function (rank, file, moves) {
    'use strict';
    var piece = game.board[rank][file], ray = false, diagonal = false, cardinal = false;

    if (piece.toLowerCase() === 'k') {
        diagonal = true;
        cardinal = true;
    }

    if (piece.toLowerCase() === 'q') {
        diagonal = true;
        cardinal = true;
        ray = true;
    }

    if (piece.toLowerCase() === 'r') {
        cardinal = true;
        ray = true;
    }

    if (piece.toLowerCase() === 'b') {
        diagonal = true;
        ray = true;
    }

    if (piece.toLowerCase() === 'n') {
        this.tryMove(moves, {piece: piece, from: [rank, file], to: [rank + 2, file + 1]});
        this.tryMove(moves, {piece: piece, from: [rank, file], to: [rank - 2, file + 1]});
        this.tryMove(moves, {piece: piece, from: [rank, file], to: [rank + 2, file - 1]});
        this.tryMove(moves, {piece: piece, from: [rank, file], to: [rank - 2, file - 1]});
        this.tryMove(moves, {piece: piece, from: [rank, file], to: [rank + 1, file + 2]});
        this.tryMove(moves, {piece: piece, from: [rank, file], to: [rank - 1, file + 2]});
        this.tryMove(moves, {piece: piece, from: [rank, file], to: [rank + 1, file - 2]});
        this.tryMove(moves, {piece: piece, from: [rank, file], to: [rank - 1, file - 2]});
    }

    if (diagonal) {
        this.tryRayMove(ray, 1, 1, piece, rank, file, moves);
        this.tryRayMove(ray, 1, -1, piece, rank, file, moves);
        this.tryRayMove(ray, -1, 1, piece, rank, file, moves);
        this.tryRayMove(ray, -1, -1, piece, rank, file, moves);
    }

    if (cardinal) {
        this.tryRayMove(ray, 1, 0, piece, rank, file, moves);
        this.tryRayMove(ray, -1, 0, piece, rank, file, moves);
        this.tryRayMove(ray, 0, 1, piece, rank, file, moves);
        this.tryRayMove(ray, 0, -1, piece, rank, file, moves);
    }
};

Player.prototype.moves = function () {
    'use strict';
    var rank, file, moves = [];

    // now get the moves for my pieces...
    for (file = 0; file < game.files; ++file) {
        for (rank = 0; rank < game.ranks; ++rank) {
            if (this.isMyPiece(game.board[rank][file])) {
                this.pieceMoves(rank, file, moves);
            }
        }
    }

    return moves;
};

Player.prototype.think = function () {
    'use strict';
    var i, moves = this.moves(this.side);

    console.log('Moves:');
    for (i = 0; i < moves.length; ++i) {
        console.log(this.algebraic(moves[i]));
    }

    // make the first move (essentially at random)
    // need to sort moves by heuristic, and perform some sort of depth search
    game.makeMove(moves[0]);
    game.prepareUIForNextMove();
};

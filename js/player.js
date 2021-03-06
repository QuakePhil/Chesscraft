/*jslint plusplus: true */
/*global dictionary, game, console, alert*/

function Player(side) {
    'use strict';
    this.side = side;
    this.centipawns = 100;
    this.noDepth = false; // a moves-related property, needs to be re-factored...
}

Player.prototype.isCapture = function (move) {
    'use strict';
    if (typeof move === 'undefined') { return false; }
    if (typeof move.toPiece === 'undefined') { return false; }
    return (move.toPiece !== ' ' && dictionary.pieces[move.piece] !== dictionary.pieces[move.toPiece]);
};

Player.prototype.algebraic = function (move) {
    'use strict';

    return (move.piece.toLowerCase() === 'p' ? '' : move.piece.toUpperCase())
        + (typeof move.from !== 'undefined' ? (dictionary.files[move.from[1]] + dictionary.ranks[move.from[0]]) : '@')
        + (this.isCapture(move) ? 'x' : '')
        + (typeof move.to !== 'undefined' ? dictionary.files[move.to[1]] + dictionary.ranks[move.to[0]] : '');
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

Player.prototype.opponent = function () {
    'use strict';
    if (game.player.side === this.side) {
        return game.opponent;
    }
    return game.player;
};

// add move to moves if legal
Player.prototype.tryMove = function (moves, move) {
    'use strict';
    var i, toPiece, opponentMoves, validMove = true;

    if (move.to[0] < 0 || move.to[0] >= game.ranks || move.to[1] < 0 || move.to[1] >= game.files) { return false; }

    toPiece = game.board[move.to[0]][move.to[1]];
    // we don't need to do extended lookup for enpassant check, but when
    // we fix the noDepth hack, this needs to be redone as part of it
    if (game.enPassant === move.enPassant && this.noDepth === false) {
        toPiece = (move.piece === 'P' ? 'p' : 'P');
    }
    if (game.board[move.to[0]][move.to[1]] !== ' ') {
        if (dictionary.pieces[move.piece] === dictionary.pieces[toPiece]) { return false; }
    }

    // if this move puts me (or keeps me) in check, skip
    if (this.side === game.side && this.noDepth === false) {
        game.makeMove(move);
        this.opponent().noDepth = true; // fix this hack... this.side === game.side should be enough, no?
        opponentMoves = this.opponent().moves();
        for (i = 0; i < opponentMoves.length; ++i) {
            if (opponentMoves[i].toPiece.toLowerCase() === 'k') {
                // moves that place us in check are invalid
                validMove = false;
            }
        }
        this.opponent().noDepth = false;
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
    var piece = game.board[rank][file], ray = false, diagonal = false, cardinal = false, pawnDirection, pawnRank;

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

    if (piece.toLowerCase() === 'p') {
        pawnDirection = 1;
        pawnRank = 1;
        if (this.side === dictionary.white) {
            pawnDirection = -1;
            pawnRank = 6;
        }

        // diagonal pawn moves must be captures
        this.tryMove(moves, { enPassant: file + 1, piece: piece, from: [rank, file], to: [rank + pawnDirection, file + 1]});
        if (!this.isCapture(moves[moves.length - 1])) { moves.pop(); }
        this.tryMove(moves, { enPassant: file - 1, piece: piece, from: [rank, file], to: [rank + pawnDirection, file - 1]});
        if (!this.isCapture(moves[moves.length - 1])) { moves.pop(); }

        // pawn pushes must not be captures
        if (rank === pawnRank && game.board[rank + pawnDirection][file] === ' ') {
            this.tryMove(moves, {piece: piece, from: [rank, file], to: [rank + pawnDirection + pawnDirection, file]});
            if (this.isCapture(moves[moves.length - 1])) { moves.pop(); }
        }
        this.tryMove(moves, {piece: piece, from: [rank, file], to: [rank + pawnDirection, file]});
        if (this.isCapture(moves[moves.length - 1])) { moves.pop(); }
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

Player.prototype.pieceDropMoves = function (dropCost, piece, moves) {
    'use strict';
    var file, rank = (piece.toLowerCase() === 'p' ? 6 : 7);
    piece = piece.toUpperCase(); // white piece

    if (this.side === dictionary.black) {
        rank = (piece.toLowerCase() === 'p' ? 1 : 0);
        piece = piece.toLowerCase(); // black piece
    }

    for (file = 0; file < game.files; ++file) {
        if (game.board[rank][file] === ' ') {
            moves.push({dropCost: dropCost, piece: piece, toPiece: ' ', to: [rank, file]});
        }
    }

};

Player.prototype.moves = function () {
    'use strict';
    var i, rank, file, moves = [];

    // any possible drop moves
    for (i in dictionary.cp) {
        if (dictionary.cp.hasOwnProperty(i) && this.centipawns >= dictionary.cp[i]) {
            this.pieceDropMoves(dictionary.cp[i], i.substring(4), moves);
        }
    }

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

    //console.log('Moves:');
    //for (i = 0; i < moves.length; ++i) {
    //    console.log(this.algebraic(moves[i]));
    //}

    // make the first move (essentially at random)
    // need to sort moves by heuristic, and perform some sort of depth search
    if (moves.length > 0) {
        game.makeMove(moves[0]);
        game.prepareUIForNextMove();
    }

    if (moves.length === 0) {
        alert('Checkmate!  For new game, refresh page');
    }
};

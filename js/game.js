/*jslint plusplus: true */
/*global Player, console*/

var dictionary = {
        black: 0,
        white: 1,
        files: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
        file2int: {'-': -1, 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7},
        ranks: ['8', '7', '6', '5', '4', '3', '2', '1'],
        pieces: {k: 0, q: 0, r: 0, b: 0, n: 0, p: 0, K: 1, Q: 1, R: 1, B: 1, N: 1, P: 1 },
        cp: {
            'dropQ': 900,
            'dropR': 500,
            'dropB': 300,
            'dropN': 300,
            'dropP': 100
        }
    },

    game = {
        side: 0,
        files: 0,
        ranks: 0,
        previousState: [{}], // for unmakeMove, keyed by depth
        board: '',
        centipawns: 0, // centipawns of dragged piece
        pieces: ['q', 'r', 'b', 'n', 'p'], // droppable pieces

        player: new Player(dictionary.white),
        opponent: new Player(dictionary.black),
        playerMoves: [], // used to keep track of dnd for user's moves
        playerDropping: false, // used to check for resources during piece dropping
        moves: [], // history of all moves
        enPassant: -1, // en passant file
        
        prepareUIForNextMove: function () {
            'use strict';

            // kick off the AI, if its turn
            if (this.opponent.side === this.side) {
                this.opponent.centipawns += 100;
                this.opponent.think();
            } else {
                this.player.centipawns += 100;
            }

            this.drawInterface(dictionary.white);
        },
        
        makeMove: function (move, depth) {
            'use strict';
            if (typeof depth === 'undefined') { depth = 0; }

            // .slice() doesn't seem deep enough for my multi-dimensional array
            this.previousState[depth].board = JSON.parse(JSON.stringify(this.board));
            this.previousState[depth].side = this.side;
            this.previousState[depth].enPassant = this.enPassant;

            this.moves.push(move);
    
            if (typeof move.enPassant !== 'undefined') {
                this.enPassant = move.enPassant;
            }

            if (typeof move.from !== 'undefined') {
                this.board[move.from[0]][move.from[1]] = ' ';
            }
            this.board[move.to[0]][move.to[1]] = move.piece; // need to also save ep square, castling, side, etc

            if (this.side === 0) {
                this.side = 1;
            } else {
                this.side = 0;
            }
        },

        unmakeMove: function (depth) {
            'use strict';
            if (typeof depth === 'undefined') { depth = 0; }

            this.board = JSON.parse(JSON.stringify(this.previousState[depth].board));
            this.side = this.previousState[depth].side;
            this.enPassant = this.previousState[depth].enPassant;

            this.moves.pop();
        },
        
        dumpBoard: function (instance) {
            'use strict';
            var file, rank, line;

            if (typeof instance === 'undefined') {
                instance = {};
                instance.board = this.board;
                instance.side = this.side;
            }

            console.log('Side to move: ' + this.side);

            for (file = 0; file < this.files; ++file) {
                line = String(file) + ' - ';
                for (rank = 0; rank < this.ranks; ++rank) {
                    line = line + '[' + this.board[file][rank] + ']';
                }
                console.log(line);
            }
        },
        
        loadFEN: function (fen) {
            'use strict';
            var file, rank, rankArray, slashes = 0, parts = fen.split(' ');

            // load fen here
            this.files = 8;
            this.ranks = 8;
            this.board = [];
            fen = fen.replace(/8/g, '        ').replace(/7/g, '       ').replace(/6/g, '      ')
                .replace(/5/g, '     ').replace(/4/g, '    ').replace(/3/g, '   ').replace(/2/g, '  ').replace(/1/g, ' ');

            for (file = 0; file < this.files; ++file) {
                rankArray = [];
                for (rank = 0; rank < this.ranks; ++rank) {
                    rankArray.push(fen.substring((file * this.ranks) + rank + slashes, (file * this.ranks) + rank + slashes + 1));
                }
                slashes++;
                this.board.push(rankArray);
            }
            this.side = (parts[1] === 'w' ? dictionary.white : dictionary.black);
            // castling = parts[2] // KQkq
            this.enPassant = dictionary.file2int[parts[3].substring(0, 1)];
            this.moves = [];
        },

        testAI: function () {
            'use strict';
            this.opponent.think();
            this.drawInterface(dictionary.white);
        },

        squareClasses: function (piece, shade) {
            'use strict';
            if (piece === ' ') {
                return shade ? 'square shade' : 'square';
            }

            return (shade ? 'square shade' : 'square') + ' ' + piece;
        },

        drawMoves: function () {
            'use strict';
            var i, separator = '', moves = '';
            for (i = 0; i < this.moves.length; ++i) {
                moves += separator + this.player.algebraic(this.moves[i]);
                separator = ', ';
            }
            document.getElementById('moves').innerHTML = moves;
        },

        drawInfo: function () {
            'use strict';
            // info board
            document.getElementById('info').innerHTML = 'Centipawns: ' + this.player.centipawns + '<br/>' +
                'Player: ' + (this.player.side === dictionary.white ? 'white' : 'black') + '<br/>' +
                'Turn: ' + (this.side === dictionary.white ? 'white' : 'black');
        },

        drawBoard: function (fromSide) {
            'use strict';
            // also blah = document.createElement('tagname'); blah.attr = val; ...
            var i, pieces, thisPiece, rank, file, classes, draggable, moves, sequence = 0,
                board = '<table cellpadding="0" cellspacing="0" border="0">', ranks;

            if (typeof this.player !== 'undefined' && this.side === this.player.side) {
                this.playerMoves = this.player.moves();
            }
            
            ranks = '<tr><td></td>';
            for (file = 0; file < this.files; ++file) {
                ranks += '<td>' + dictionary.files[file] + '</td>';
            }
            ranks += '<td></td></tr>';
            board += ranks;

            for (rank = 0; rank < this.ranks; ++rank) {
                board += '<tr><td>' + dictionary.ranks[rank] + '</td>';
                for (file = 0; file < this.files; ++file) {
                    classes = this.squareClasses(
                        this.board[rank][file],
                        ((file + rank) % 2 === 0)
                    );
                    
                    draggable = '';
                    for (i = 0; i < this.playerMoves.length; ++i) {
                        if (this.playerMoves[i].from[0] === rank && this.playerMoves[i].from[1] === file) {
                            draggable = ' draggable="true" ondragstart="drag(event)"';
                            break;
                        }
                    }
                    
                    board += '<td id="square' + sequence + '" class="' + classes + '" '
                        + draggable + 'ondrop="drop(event)" ondragover="allowDrop(event)"></td>';
                    sequence++;
                }
                board += '<td>' + dictionary.ranks[rank] + '</td></tr>';
            }

            board += ranks;

            board += '</table>';
            document.getElementById('board').innerHTML = board;

            // piece drop interface
            pieces = '<table cellpadding="0" cellspacing="0" border="0"><tr>';
            for (file = 0; file < this.pieces.length; ++file) {
                if (fromSide === dictionary.black) {
                    thisPiece = this.pieces[file].toLowerCase();
                } else {
                    thisPiece = this.pieces[file].toUpperCase();
                }
                pieces += '<td id="drop' + thisPiece + '" draggable="true" ondragstart="drag(event)" class="' +
                    this.squareClasses(thisPiece, this.side === this.player.side) + '"></td>';
            }

            pieces += '</tr></table>';
            document.getElementById('pieces').innerHTML = pieces;
        },

        drawInterface: function (fromSide) {
            'use strict';
            this.drawBoard(fromSide);
            this.drawInfo();
            this.drawMoves();
        }
    };

/*jslint plusplus: true */
/*global Player*/

var dictionary = {
        black: 0,
        white: 1,
        files: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
        ranks: ['8', '7', '6', '5', '4', '3', '2', '1'],
        pieces: {k: 0, q: 0, r: 0, b: 0, n: 0, p: 0, K: 1, Q: 1, R: 1, B: 1, N: 1, P: 1 }
    },

    player = new Player(dictionary.white),
    opponent = new Player(dictionary.black),

    game = {
        side: 0,
        files: 0,
        ranks: 0,
        board: '',
        centipawns: 0, // centipawns of dragged piece
        pieces: ['q', 'r', 'b', 'n', 'p'], // droppable pieces

        makeMove: function (move) {
            'use strict';
            
            if (typeof move.from !== 'undefined') {
                game.board[move.from[0]][move.from[1]] = ' ';
            }
            game.board[move.to[0]][move.to[1]] = move.piece;

            if (this.side === 0) {
                this.side = 1;
            } else {
                this.side = 0;
            }

            // kick off the AI, if its turn
            if (opponent.side === this.side) {
                opponent.centipawns += 100;
                opponent.think();
            } else {
                player.centipawns += 100;
            }

            this.drawInterface(dictionary.white);
        },

        loadFEN: function (fen) {
            'use strict';
            var file, rank, rankArray, slashes = 0;

            // load fen here
            this.files = 8;
            this.ranks = 8;
            this.board = [];
            fen = fen.replace(/8/g, '        ').replace(/7/g, '       ').replace(/6/g, '      ')
                .replace(/5/g, '     ').replace(/4/g, '    ').replace(/3/g, '   ').replace(/2/g, '  ').replace(/1/g, ' ');

            for (file = 0; file < game.files; ++file) {
                rankArray = [];
                for (rank = 0; rank < game.ranks; ++rank) {
                    rankArray.push(fen.substring((file * this.ranks) + rank + slashes, (file * this.ranks) + rank + slashes + 1));
                }
                slashes++;
                this.board.push(rankArray);
            }
            this.side = 1; // should come from fen
        },

        squareClasses: function (piece, shade) {
            'use strict';
            if (piece === ' ') {
                return shade ? 'square shade' : 'square';
            }

            return (shade ? 'square shade' : 'square') + ' ' + piece;
        },

        drawInfo: function () {
            'use strict';
            // info board
            document.getElementById('info').innerHTML = 'Centipawns: ' + player.centipawns + '<br/>' +
                'Player: ' + (player.side === dictionary.white ? 'white' : 'black') + '<br/>' +
                'Turn: ' + (game.side === dictionary.white ? 'white' : 'black');
        },

        drawBoard: function (fromSide) {
            'use strict';
            // also blah = document.createElement('tagname'); blah.attr = val; ...
            var pieces, thisPiece, rank, file, classes,
                sequence = 0, board = '<table cellpadding="0" cellspacing="0" border="0">';

            board += '<tr><td></td>';
            for (file = 0; file < game.files; ++file) {
                board += '<td>' + dictionary.files[file] + '</td>';
            }
            board += '<td></td></tr>';

            for (rank = 0; rank < game.ranks; ++rank) {
                board += '<tr><td>' + dictionary.ranks[rank] + '</td>';
                for (file = 0; file < game.files; ++file) {
                    classes = this.squareClasses(
                        this.board[rank][file],
                        ((file + rank) % 2 === 0)
                    );
                    board += '<td id="square' + sequence + '" class="' + classes + '" ondrop="drop(event)" ondragover="allowDrop(event)"></td>';
                    sequence++;
                }
                board += '<td>' + dictionary.ranks[rank] + '</td></tr>';
            }

            board += '<tr><td></td>';
            for (file = 0; file < game.files; ++file) {
                board += '<td>' + dictionary.files[file] + '</td>';
            }
            board += '<td></td></tr>';

            board += '</table>';
            document.getElementById('board').innerHTML = board;

            // piece drop interface
            pieces = '<table cellpadding="0" cellspacing="0" border="0"><tr>';
            for (file = 0; file < this.pieces.length; ++file) {
                thisPiece = this.pieces[file].toUpperCase();
                pieces += '<td id="drop' + thisPiece + '" draggable="true" ondragstart="drag(event)" class="' +
                    this.squareClasses(thisPiece, game.side === player.side) + '"></td>';
            }

            pieces += '</tr></table>';
            document.getElementById('pieces').innerHTML = pieces;
        },

        drawInterface: function (fromSide) {
            'use strict';
            this.drawBoard(fromSide);
            this.drawInfo();
        }
    };

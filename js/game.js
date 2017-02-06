var dictionary = {
  black: 0,
  white: 1,
  files: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  ranks: ['8', '7', '6', '5', '4', '3', '2', '1']
};

var player = new Player(dictionary.white);
var ai = new Player(dictionary.black);

var game = {
  side: 0,
  files: 0,
  ranks: 0,
  board: '',
  centipawns: 0, // centipawns of dragged piece
  pieces: ['q', 'r', 'b', 'n', 'p'], // droppable pieces

  makeMove: function () {
    if (this.side == 0) {
      this.side = 1;
    } else {
      this.side = 0;
    }

    // kick off the AI, if its turn
    if (ai.side == this.side) {
      ai.centipawns += 100;
      setTimeout(function(){ ai.think(); },3000);
    } else {
      player.centipawns += 100;
    }

    this.drawInfo();
  },

  loadFEN: function (fen) {
    // load fen here
    this.files = 8;
    this.ranks = 8;
    this.board = [];
    fen = fen.replace(/8/g,'        ').replace(/7/g,'       ').replace(/6/g,'      ')
      .replace(/5/g,'     ').replace(/4/g,'    ').replace(/3/g,'   ').replace(/2/g,'  ').replace(/1/g,' ');
    var slashes = 0;
    for (var file = 0; file < game.files; ++file) {
      var rankArray = [];
      for (var rank = 0; rank < game.ranks; ++rank) {
        rankArray.push(fen.substring((file*this.ranks)+rank+slashes, (file*this.ranks)+rank+slashes+1))
      }
      slashes++;
      this.board.push(rankArray);
    }
    this.side = 1; // should come from fen
  },

  squareClasses(piece, shade) {
    if (piece == ' ') {
      return shade ? 'square shade' : 'square';
    }

    return (shade ? 'square shade' : 'square') + ' ' + piece;
  },

  drawInfo: function () {
    // info board
    document.getElementById('info').innerHTML = 'Centipawns: ' + player.centipawns + '<br/>'
      + 'Player: ' + (player.side == dictionary.white ? 'white' : 'black') + '<br/>'
      + 'Turn: ' + (game.side == dictionary.white ? 'white' : 'black');
  },

  drawBoard: function (fromSide = dictionary.white) {
    // also blah = document.createElement('tagname'); blah.attr = val; ...
    var board = '<table cellpadding="0" cellspacing="0" border="0">';

    board += '<tr><td></td>';
    for (var file = 0; file < game.files; ++file) {
      board += '<td>' + dictionary.files[file] + '</td>';
    }
    board += '<td></td></tr>';

    var sequence = 0;
    for (var rank = 0; rank < game.ranks; ++rank) {
      board += '<tr><td>' + dictionary.ranks[rank] + '</td>';
      for (var file = 0; file < game.files; ++file) {
        var classes = this.squareClasses(
          this.board[rank][file],
          ((file + rank) % 2 === 0));
        board += '<td id="square' + sequence + '" class="'+classes+'" ondrop="drop(event)" ondragover="allowDrop(event)"></td>';
        sequence++;
      }
      board += '<td>' + dictionary.ranks[rank] + '</td></tr>';
    }

    board += '<tr><td></td>';
    for (var file = 0; file < game.files; ++file) {
      board += '<td>' + dictionary.files[file] + '</td>';
    }
    board += '<td></td></tr>';

    board += '</table>';
    document.getElementById('board').innerHTML = board;

    // piece drop interface
    var pieces = '<table cellpadding="0" cellspacing="0" border="0"><tr>';
    for (var file = 0; file < this.pieces.length; ++file) {
      var thisPiece = this.pieces[file].toUpperCase();
      pieces += '<td id="drop' + thisPiece + '" draggable="true" ondragstart="drag(event)" class="' 
        + this.squareClasses(thisPiece, game.side == player.side) + '"></td>';
    }

    pieces += '</tr></table>';
    document.getElementById('pieces').innerHTML = pieces;
  },

  drawInterface: function (fromSide) {
    this.drawBoard(fromSide);
    this.drawInfo();
  }
};

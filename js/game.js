var dictionary = {
  black: 0,
  white: 1,
  files: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  ranks: ['8', '7', '6', '5', '4', '3', '2', '1']
};

var game = {
  files: 0,
  ranks: 0,
  board: '',

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
  },

  squareClasses(piece, shade) {
    if (piece == ' ') {
      return shade ? 'square' : 'square shade';
    }

    return (shade ? 'square' : 'square shade') + ' ' + piece;
  },

  drawBoard: function (fromSide = dictionary.white) {
    // also blah = document.createElement('tagname'); blah.attr = val; ...
    var board = '<table>';

    board += '<tr><td></td>';
    for (var file = 0; file < game.files; ++file) {
      board += '<td>' + dictionary.files[file] + '</td>';
    }
    board += '<td></td></tr>';

    for (var rank = 0; rank < game.ranks; ++rank) {
      board += '<tr><td>' + dictionary.ranks[rank] + '</td>';
      for (var file = 0; file < game.files; ++file) {
        var classes = this.squareClasses(
          this.board[rank][file],
          ((file + rank) % 2 === 0));
        board += '<td class="'+classes+'"></td>';
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
  }
};

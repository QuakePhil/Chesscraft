var dictionary = {
  black: 0,
  white: 1,
  files: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  ranks: ['8', '7', '6', '5', '4', '3', '2', '1']
};

var player = new Player(dictionary.white);

var game = {
  files: 0,
  ranks: 0,
  board: '',
  pieces: ['q', 'r', 'b', 'n', 'p'],

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
      return shade ? 'square shade' : 'square';
    }

    return (shade ? 'square shade' : 'square') + ' ' + piece;
  },

  drawInterface: function (fromSide = dictionary.white) {
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
        + this.squareClasses(thisPiece, true) + '"></td>';
    }

    pieces += '</tr></table>';
    document.getElementById('pieces').innerHTML = pieces;

    // info board
    document.getElementById('info').innerHTML = 'Centipawns: ' + player.centipawns + '<br/>'
      + 'Side: ' + (player.side == dictionary.white ? 'white' : 'black');
  }
};

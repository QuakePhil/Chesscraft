function allowDrop (e) {
  if (player.side !== game.side) return false;
  if (player.centipawns < game.centipawns) return false;

  e.preventDefault();
}

function drag (e) {
  var cp = {'dropQ': 900, 'dropR': 500, 'dropB': 300, 'dropN': 300, 'dropP': 100 };

  e.dataTransfer.setData('text', e.target.id);
  game.centipawns = cp[e.target.id];
}

function drop (e) {
  e.preventDefault();

  // validate the move
  var square = parseInt(e.target.id.substring(6));
  var rank = parseInt(square / game.ranks);
  var file = square % game.files;

  if (game.board[rank][file] != ' ') {
    console.log('bad move');
    return;
  }

  // update board
  var piece = e.dataTransfer.getData('text').substring(4,5);
  game.board[rank][file] = piece;

  var cp = {'dropQ': 900, 'dropR': 500, 'dropB': 300, 'dropN': 300, 'dropP': 100 };
  player.centipawns -= cp[e.dataTransfer.getData('text')];

  // update the UI
  var className = 'square';
  if (e.target.className.indexOf('shade') !== -1) className += ' shade';
  e.target.className = className + ' ' + piece;

  game.makeMove();
}

//game.loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
game.loadFEN('4k3/8/8/8/8/8/8/4K3 w - -');
game.drawInterface();

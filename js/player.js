function Player (side) {
  this.side = side;
  this.centipawns = 0;
}

Player.prototype.think = function() {
  console.log('thinking');
}
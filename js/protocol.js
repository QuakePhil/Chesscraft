// re: https://github.com/feross/simple-peer
// also: https://github.com/cjb/serverless-webrtc/
// http://blog.printf.net/articles/2013/05/17/webrtc-without-a-signaling-server/

var p = new SimplePeer({ initiator: location.hash === '#1', trickle: false })

p.on('error', function (err) { console.log('error', err) })

p.on('signal', function (data) {
  console.log('SIGNAL', JSON.stringify(data));
  console.log('outgoing:', JSON.stringify(data));
})

document.getElementById('sendButton').addEventListener('click', function (ev) {
  ev.preventDefault();
  p.signal(JSON.parse('"hello"'));
})

p.on('connect', function () {
  console.log('CONNECT');
  p.send('whatever' + Math.random());
})

p.on('data', function (data) {
  console.log('data: ' + data);
})

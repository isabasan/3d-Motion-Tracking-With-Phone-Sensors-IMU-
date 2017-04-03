var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const dgram = require('dgram');
const server = dgram.createSocket('udp4');

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});
server.on('listening', () => {
  var address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});
server.bind(5555);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  console.log('a user connected');
  server.on('message', (msg, rinfo) => {
    msg = String.fromCharCode.apply(null, new Uint8Array(msg));
    var sensorData = {};
    var messages = msg.split(',');
    messages.shift();
    for (var i = 0; i < messages.length; i = i + 4) {
      if (messages[i] == 3) {
        var acc = {};
        acc.x = parseFloat(messages[i + 1].trim());
        acc.y = parseFloat(messages[i + 2].trim());
        acc.z = parseFloat(messages[i + 3].trim());
        sensorData.accelerometer = acc;
      } else if (messages[i] == 4) {
        var gyro = {};
        gyro.x = messages[i + 1].trim();
        gyro.y = messages[i + 2].trim();
        gyro.z = messages[i + 3].trim();
        sensorData.gyroscope = gyro;
      } else if (messages[i] == 5) {
        var magne = {};
        magne.x = messages[i + 1].trim();
        magne.y = messages[i + 2].trim();
        magne.z = messages[i + 3].trim();
        sensorData.magnetometer = magne;
      } else if (messages[i] == 81) {
        var orientation = {};
        orientation.x = messages[i + 1].trim();
        orientation.y = messages[i + 2].trim();
        orientation.z = messages[i + 3].trim();
        sensorData.orientation = orientation;
      } else {
        console.log(messages[i]);
      }
    }
    socket.emit('message', sensorData);
  });
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
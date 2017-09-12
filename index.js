const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const fetch = require('isomorphic-fetch');

const PORT = process.env.PORT || 3001;

const latitude = 45.4697;
const longitude = -73.7449;
const radiusKm = 10;
const url = `https://public-api.adsbexchange.com/VirtualRadar/AircraftList.json?lat=${latitude}8&lng=${longitude}&fDstL=0&fDstU=${radiusKm}`;

setInterval(() => {
  fetch(url)
    .then(
      (response) => {
        if (!response.ok) {
          throw Error('Could not fetch data');
        }
        return response.json();
      },
      error => console.log('Fetch Error occured:', error),
    )
    .then((json) => {
      console.log('emit planes');
      io.emit('planes', json);
    });
}, 5 * 1000);

app.get('/', (req, res) => {
  res.send('Hello World');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  io.emit('message', 'hello user');

  socket.on('disconnect', () => {
    console.log('a user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Listening on *:${PORT}`);
});

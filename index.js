const debug = require('debug')('overhead-api');
const axios = require('axios');
const socketio = require('socket.io');

const PORT = process.env.PORT || 3001;
const watcherInterval = 5000;
const radiusKm = 2;

const io = socketio(PORT);

io.on('connection', (socket) => {
  debug(`Client Connected: ID ${socket.id}`);

  const { latitude, longitude } = socket.handshake.query;
  debug(`LAT/LONG for ID ${socket.id}: \n  LAT:${latitude}\n  LONG:${longitude}`);

  // Start a Watcher for this client
  const url = `https://public-api.adsbexchange.com/VirtualRadar/AircraftList.json?lat=${latitude}&lng=${longitude}&fDstL=0&fDstU=${radiusKm}`;

  const timeout = setInterval(() => {
    debug(`---FETCHING PLANES for client: ${socket.id} ---`);
    axios.get(url)
      .then((response) => {
        if (response.statusText !== 'OK') {
          throw Error('Could not fetch data');
        }
        return response.data;
      })
      .then((planes) => {
        // TODO: use normalizer to restructure the data for react/redux usage.
        if (planes.acList.length) {
          debug(`---EMIT PLANES for client: ${socket.id} ---`);
          socket.emit('planes.update', planes);
        } else {
          debug(`---NO PLANES for client: ${socket.id} ---`);
        }
      })
      .catch((error) => {
        debug('Fetch Error occured:', error);
      });
  }, watcherInterval);

  socket.on('disconnect', () => {
    clearInterval(timeout);
    debug(`Client Disconnected: ID ${socket.id}`);
  });
});

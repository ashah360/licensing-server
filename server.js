'use strict';
process.env.NODE_ENV = 'development';
process.env.MONGODB_URI = '';
const PORT = process.env.PORT || 3000;

if (!process.env.MONGODB_URI) {
  throw new Error('No MONGODB_URI set');
  process.exit(1);
}

require('console-stamp')(console, {
  metadata: function() {
    return '[' + process.pid + ']';
  },
  colors: {
    stamp: 'yellow',
    label: 'white',
    metadata: 'green'
  }
});

let APIRoutes = require('./src/classes/APIRoutes.js');

let http = require('http');
let express = require('express');
let cluster = require('cluster');
let cpus = require('os').cpus();

let compression = require('compression');
let bodyParser = require('body-parser');
let logger = require('morgan');
let subdomain = require('subdomain');

let mongoose = require('mongoose');

mongoose.Promise = Promise;

let app = express();
let api = express();

app.server = http.createServer(app);

if (cluster.isMaster) {
  console.info('Starting Workers');

  for (let i = 0; i < cpus.length; i++) {
    cluster.fork();
  }
} else {
  app.use(compression());
  app.use(
    bodyParser.urlencoded({
      extended: false,
      limit: '50mb'
    })
  );
  app.use(logger('dev'));
  app.use('/api', api);

  mongoose.connect(process.env.MONGODB_URI);

  mongoose.connection.once('open', () => {
    console.log('MONGODB CONNECTION OPEN');

    new APIRoutes(api);
  });

  app.server.listen(PORT, () =>
    console.log('Listening on', app.server.address().port)
  );
}

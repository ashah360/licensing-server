let Key = require('../models/Key.js');
let mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI);

let newKey = 'GN-' + uuidv4();

mongoose.connection.once('open', () => {
  let key = new Key({
    key: newKey,
    machineId: 'unregistered'
  });

  key
    .save()
    .then(() => {
      if (!key.isNew) console.log('key created - ' + newKey);
    })
    .catch(console.error);
});

let mongoose = require('mongoose');
let schema = mongoose.Schema;

let keySchema = {
  key: { type: String, required: true },
  activated: { type: Boolean, required: false, default: false },
  machineId: { type: String, required: true }
};

module.exports = mongoose.model('Key', keySchema);

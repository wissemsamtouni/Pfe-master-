const mongoose = require("mongoose");
const temperatureSchema = new mongoose.Schema({
  temperature: {
    type: Number,
    required: true
  },
  timeStamp: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model("Temperature", temperatureSchema);


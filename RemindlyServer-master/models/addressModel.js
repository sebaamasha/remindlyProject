const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  name: { type: String },
  lat: { type: Number},
  lng : { type: Number}
});

module.exports = addressSchema; // Export ONLY the schema, not the model

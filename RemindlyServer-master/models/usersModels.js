const mongoose = require('mongoose');
const addressSchema = require('./addressModel');
const ItemSchema = require('./personalItemsModels');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: addressSchema, required: true }, // Embed the addressSchema
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other'] // Validate gender values
      },
    timeReminders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ReminderTime' }], // Reference Time Reminders
    locationReminders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ReminderLocation' }], // Reference Location Reminders
    personalItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PersonalItem' }],
    ShopingList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PersonalItem' }], 
  },
  { collection: 'users' }
);

const User = mongoose.model('User', userSchema);

module.exports = User;

const {mongoose, Collection}= require('mongoose');
const addressSchema = require('./addressModel');

const reminderLocationSchema = new mongoose.Schema({
   reminderType : {type : String,default:"Location"},
   title: {type : String},
    address: { type: addressSchema, required: true },
   radius:{type : Number , default:200},
  time:{type : Date ,  default: Date.now },
  active:{type:Boolean , default : true},
   details:{type : String}
});

const ReminderLocation = mongoose.model('ReminderLocation',reminderLocationSchema);

module.exports = ReminderLocation;
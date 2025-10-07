const mongoose = require('mongoose');
const addressSchema = require('./addressModel'); // Correctly import addressSchema

const personalItemSchema = new mongoose.Schema(
  {
    address: { type: addressSchema }, 
    itemName:{type:String,required:true},
    qty:{type:Number,default1:1},
    days:{type:Number,default:1}
  }
);

const PersonalItem = mongoose.model('PersonalItem', personalItemSchema);

module.exports = PersonalItem;

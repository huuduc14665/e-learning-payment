const mongoose = require('mongoose');

//define payment collection schema in MongoDB
const PaymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  course: {
      type: String,
      required: true,
  },
  user: {
      type: String,
      required: true
  },
  paid: {
      type: Boolean,
      default: false
  }
}//,
  // {collation: { locale: 'en', strength: 2 }}
);
//use schema for 'subject' collection schema
const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;